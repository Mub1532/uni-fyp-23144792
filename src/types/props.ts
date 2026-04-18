import type { AppProps } from "next/app";
import type { userInfo } from "./user";

export interface MyProps extends AppProps {
  user: userInfo;
  authLoading: boolean;
  loggedIn: boolean;
}
