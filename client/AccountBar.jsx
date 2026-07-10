export function AccountBar({ auth, balance, onBuy }) {
  if (!auth.enabled) {
    return null;
  }
  if (auth.loading) {
    return <div className="account-bar">確認中…</div>;
  }
  return (
    <div className="account-bar">
      {auth.user ? (
        <>
          <span className="account-email">{auth.user.email}</span>
          {balance != null && (
            <span className="account-tickets">チケット {balance}枚</span>
          )}
          {onBuy && (
            <>
              {/* 表示価格は Stripe の Price（テスト/本番とも）と一致させること */}
              <button
                type="button"
                className="secondary-button"
                onClick={() => onBuy("single")}
              >
                1枚 ¥1,500
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => onBuy("pack5")}
              >
                5枚 ¥6,000
              </button>
            </>
          )}
          <button type="button" className="secondary-button" onClick={auth.signOut}>
            ログアウト
          </button>
        </>
      ) : (
        <button type="button" className="primary" onClick={auth.signInWithGoogle}>
          Googleでログイン
        </button>
      )}
    </div>
  );
}
