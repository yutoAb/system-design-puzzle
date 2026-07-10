-- チケット台帳: 1チケット = 面接1回。
-- Supabase ダッシュボードの SQL エディタで実行する。

-- 残高（1行/ユーザー）
create table public.ticket_balances (
  user_id uuid primary key references auth.users (id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

-- 台帳（増減の監査ログ + Stripe イベントの冪等化）
create table public.ticket_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  delta integer not null,
  reason text not null, -- 'signup_bonus' | 'purchase' | 'consume' | 'admin_grant'
  stripe_event_id text unique,
  created_at timestamptz not null default now()
);

-- クライアントは直接読まない（残高は /api/me 経由）。
-- RLS を有効にしポリシーを作らないことで全 deny。サーバーの secret key は RLS をバイパスする。
alter table public.ticket_balances enable row level security;
alter table public.ticket_ledger enable row level security;

-- 消費: 残高が1以上のときだけ1減らす。条件付き UPDATE の行ロックで同時開始に安全。
-- 戻り値: 消費後の残高。残高不足なら -1。
create or replace function public.consume_ticket(p_user_id uuid)
returns integer
language plpgsql
security definer set search_path = public
as $$
declare new_balance integer;
begin
  update ticket_balances
    set balance = balance - 1, updated_at = now()
    where user_id = p_user_id and balance >= 1
    returning balance into new_balance;
  if new_balance is null then
    return -1;
  end if;
  insert into ticket_ledger (user_id, delta, reason) values (p_user_id, -1, 'consume');
  return new_balance;
end;
$$;

-- 付与: stripe_event_id が既出なら no-op（webhook リトライの冪等化）。
-- 戻り値: 付与後の残高。
create or replace function public.grant_tickets(
  p_user_id uuid,
  p_amount integer,
  p_reason text,
  p_stripe_event_id text default null
) returns integer
language plpgsql
security definer set search_path = public
as $$
declare new_balance integer;
begin
  if p_stripe_event_id is not null then
    begin
      insert into ticket_ledger (user_id, delta, reason, stripe_event_id)
        values (p_user_id, p_amount, p_reason, p_stripe_event_id);
    exception when unique_violation then
      select balance into new_balance from ticket_balances where user_id = p_user_id;
      return coalesce(new_balance, 0);
    end;
  else
    insert into ticket_ledger (user_id, delta, reason)
      values (p_user_id, p_amount, p_reason);
  end if;
  insert into ticket_balances (user_id, balance)
    values (p_user_id, p_amount)
    on conflict (user_id) do update
      set balance = ticket_balances.balance + p_amount, updated_at = now()
    returning balance into new_balance;
  return new_balance;
end;
$$;

-- サインアップボーナス: ユーザー作成時に1枚付与
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  perform public.grant_tickets(new.id, 1, 'signup_bonus');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RPC はサーバー（secret key）専用。クライアントロールからは呼べないようにする。
revoke execute on function public.consume_ticket(uuid) from anon, authenticated;
revoke execute on function public.grant_tickets(uuid, integer, text, text) from anon, authenticated;

-- 管理者が自分にチケットを付与する例:
--   select public.grant_tickets('<user_id>', 100, 'admin_grant');
