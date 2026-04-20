import Navigation from "@/components/navigation/index";
import TopBar from "@/components/navigation/Top";
import { useUser } from "@/hooks/useUser";
import "@/styles/globals.scss";
import type { MyProps } from "@/types/props";
import { USER_CODES } from "@/types/user";
import { textColor } from "@/utils/classes";
import { pages } from "@/utils/data/pages";
import { capitaliseFirstLetter } from "@/utils/misc/caps";
import { joinClasses } from "@/utils/misc/classes";
import { Montserrat } from "next/font/google";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Bounce, ToastContainer } from "react-toastify";

const font = Montserrat({
  subsets: ["latin"],
});

export default function App({ Component, pageProps }: MyProps) {
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

  if (loading) return null; // or a proper spinner

  if (currentPage?.needAuth && !loggedIn) return null;

  return (
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
            {loggedIn ? <Navigation loggedIn={loggedIn} /> : null}
            <div className=" h-full w-full overflow-hidden flex flex-col gap-2">
              <TopBar
                pageName={
                  currentPage?.name ??
                  capitaliseFirstLetter(router.asPath.replace("/", ""))
                }
                user={user}
              />
              <div
                className={joinClasses(
                  "p-4 px-1 md:px-2 h-full w-full",
                  textColor,
                )}
              >
                <Component {...pageProps} user={user} userLoading={loading} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
