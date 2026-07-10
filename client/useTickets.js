import { useCallback, useEffect, useState } from "react";

export function useTickets(accessToken) {
  const [balance, setBalance] = useState(null);

  const refresh = useCallback(async () => {
    if (!accessToken) {
      setBalance(null);
      return;
    }
    try {
      const response = await fetch("/api/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!response.ok) {
        setBalance(null);
        return;
      }
      const data = await response.json();
      setBalance(data.balance);
    } catch {
      setBalance(null);
    }
  }, [accessToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { balance, refresh };
}
