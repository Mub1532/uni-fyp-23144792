import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="bg-blue-50 dark:bg-slate-800">
      <Head />

      <body className="antialiased ">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
