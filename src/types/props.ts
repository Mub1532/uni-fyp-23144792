import type { AppProps } from "next/app";
import type { Dispatch, SetStateAction } from "react";
import type { CalendarEvent } from "@/components/calendar/modal";
import type { ModalState } from "./calendar";
import type { userInfo } from "./user";

export interface MyPageProps extends AppProps {
  user: userInfo;
  authLoading: boolean;
  loggedIn: boolean;
  googleUser?: string;
  googlePic?: string;
  useGooglePic: boolean;
  openCalItem: (event: CalendarEvent) => void;
  currentCalModal: ModalState;
  setCurrentCalModal: Dispatch<SetStateAction<ModalState>>;
}
