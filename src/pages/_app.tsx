import Navigation from "@/components/navigation/index";
import TopBar from "@/components/navigation/Top";
import { useUser } from "@/hooks/useUser";
import "@/styles/globals.scss";
import { Montserrat } from "next/font/google";
import { useRouter } from "next/router";
import Script from "next/script";
import ProgressBar from "nextjs-progressbar";
import { type CSSProperties, useEffect, useState } from "react";
import { Bounce, ToastContainer } from "react-toastify";
import type { CalendarEvent } from "@/components/calendar/modal";
import { EMPTY_MODAL, type ModalState } from "@/types/calendar";
import type { MyPageProps } from "@/types/props";
import { USER_CODES } from "@/types/user";
import { textColor } from "@/utils/classes";
import { pages } from "@/utils/data/pages";
import { capitaliseFirstLetter } from "@/utils/misc/caps";
import { defaultScrollbar, joinClasses } from "@/utils/misc/classes";
import PageSEO from "./layout/seo";

const font = Montserrat({
  subsets: ["latin"],
});

export default function App({ Component, pageProps }: MyPageProps) {
  const { user, loading, loggedIn, googleUsername, googlePic, useGooglePic } =
    useUser();

  const [bgImage, setBGImage] = useState<string | null>(null);

  // current selected calendar item
  const [calModal, setCalModal] = useState<ModalState>(EMPTY_MODAL);

  const openCalModal = (event: CalendarEvent) =>
    setCalModal({ open: true, mode: "edit", event: { ...event } });

  const router = useRouter();
  const currentPage = pages.find(
    (x) =>
      router.pathname === x.path || router.pathname.startsWith(`${x.path}/`),
  );

  // If user is not logged in and the page needs auth, direct to login
  useEffect(() => {
    if (loading) return;

    if (currentPage?.needAuth && !loggedIn) {
      router.push(`/auth/login?code=${USER_CODES.NOT_LOGGED_IN}`);
    }

    if (user?.background_image) {
      setBGImage(user?.background_image);
    }
  }, [loading, loggedIn, currentPage, router.push, user?.background_image]);

  const [pageName, setPageName] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    setPageName(
      currentPage?.name ??
        capitaliseFirstLetter(router.asPath.replace("/", "")),
    );
  }, [router.asPath, currentPage, router.isReady]);

  return (
    <>
      <PageSEO title={currentPage?.name} />
      <Script src="/theme.js" strategy="beforeInteractive" />
      <main className={font.className}>
        <ToastContainer
          position="bottom-right"
          autoClose={6000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          transition={Bounce}
        />
        <div
          style={
            bgImage
              ? ({
                  "--bg-url": `url(${bgImage})`,
                } as CSSProperties)
              : undefined
          }
          className={joinClasses(
            "fixed h-full mb-auto w-full overflow-hidden bg-blue-50 dark:bg-slate-800 dark:text-slate-300 text-blue-500",
            bgImage ? "user-bg" : "",
          )}
        >
          <div className="h-full w-full relative overflow-hidden">
            <div className="flex flex-col-reverse md:flex-row h-full w-full overflow-hidden">
              {pageName !== "Mub Calendar" && (
                <Navigation loggedIn={loggedIn} />
              )}
              <div className=" h-full w-full overflow-hidden flex flex-col gap-2">
                <TopBar
                  pageName={pageName}
                  user={user}
                  useGooglePic={useGooglePic}
                  googlePic={googlePic}
                />
                <div
                  className={joinClasses(
                    "w-full overflow-x-hidden overflow-y-auto",
                    textColor,
                    defaultScrollbar,
                    pageName === "Calendar" ||
                      pageName === "Login" ||
                      pageName === "Sign Up" ||
                      pageName === "Notes" ||
                      pageName === "AI Planner" ||
                      pageName === "Mub Calendar"
                      ? "h-full"
                      : "h-fit md:h-full",
                    pageName !== "Mub Calendar" && "p-4 px-1 md:px-2",
                  )}
                >
                  <ProgressBar color="#3b82f6" />
                  <Component
                    {...pageProps}
                    user={user}
                    userLoading={loading}
                    googleUser={googleUsername}
                    googlePic={googlePic}
                    useGooglePic={useGooglePic}
                    openCalItem={openCalModal}
                    currentCalModal={calModal}
                    setCurrentCalModal={setCalModal}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
