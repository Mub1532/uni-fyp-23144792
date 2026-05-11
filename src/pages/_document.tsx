import { Head, Html, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en" className="bg-blue-50 dark:bg-slate-800">
      <Head>
        <Script src="/theme.js" strategy="beforeInteractive" />
      </Head>

      <body className="antialiased ">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
