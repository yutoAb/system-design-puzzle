export function AccountBar({ auth, balance }) {
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
