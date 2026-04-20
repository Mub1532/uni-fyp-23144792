import Navigation from "@/components/navigation/index";
import TopBar from "@/components/navigation/Top";
import { useUser } from "@/hooks/useUser";
import "@/styles/globals.scss";
import type { MyPageProps } from "@/types/props";
import { USER_CODES } from "@/types/user";
import { textColor } from "@/utils/classes";
import { pages } from "@/utils/data/pages";
import { capitaliseFirstLetter } from "@/utils/misc/caps";
import { defaultScrollbar, joinClasses } from "@/utils/misc/classes";
import { Montserrat } from "next/font/google";
import { useRouter } from "next/router";
import Script from "next/script";
import ProgressBar from "nextjs-progressbar";
import { useEffect, useState } from "react";
import { Bounce, ToastContainer } from "react-toastify";

const font = Montserrat({
  subsets: ["latin"],
});

export default function App({ Component, pageProps }: MyPageProps) {
  const { user, loading, loggedIn } = useUser();

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
  }, [loading, loggedIn, currentPage, router.push]);

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
      <Script src="/theme.js" strategy="beforeInteractive" />
      <main className={font.className}>
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          transition={Bounce}
          stacked
        />
        <div className="fixed h-full mb-auto w-full overflow-hidden bg-blue-50 dark:bg-slate-800 dark:text-slate-300 text-blue-500">
          <div className="h-full w-full relative overflow-hidden">
            <div className="flex flex-col-reverse md:flex-row h-full w-full overflow-hidden">
              <Navigation loggedIn={loggedIn} />
              <div className=" h-full w-full overflow-hidden flex flex-col gap-2">
                <TopBar pageName={pageName} user={user} />
                <div
                  className={joinClasses(
                    "p-4 px-1 md:px-2 h-full w-full overflow-x-hidden overflow-y-auto",
                    textColor,
                    defaultScrollbar,
                  )}
                >
                  <ProgressBar color="#3b82f6" />
                  <Component {...pageProps} user={user} userLoading={loading} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
