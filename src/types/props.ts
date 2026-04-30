import type { AppProps } from "next/app";
import type { userInfo } from "./user";

export interface MyPageProps extends AppProps {
  user: userInfo;
  authLoading: boolean;
  loggedIn: boolean;
  googleUser?: string;
  googlePic?: string;
}
