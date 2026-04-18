import { useEffect, useState } from "react";

import type { loginUser } from "@/types/user";

/**
 *  Use User hook, to get user from cookie
 * @returns {user, loading}
 */
export function useUser() {
  const [userInfo, setUserInfo] = useState<loginUser>({ loggedIn: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/currentUser");
        const data = await res.json();
        setUserInfo(data);
      } catch {
        setUserInfo({ loggedIn: false });
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  return { user: userInfo.user, loading, loggedIn: userInfo.loggedIn };
}
