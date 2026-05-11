import Head from "next/head";

interface PageSEOProps {
  title?: string;
  description?: string;
}

export default function PageSEO({ title, description }: PageSEOProps) {
  const siteName = "Mub Calendar";
  const fullTitle =
    title && title !== siteName ? `${title} | ${siteName}` : siteName;
  const defaultDescription = "MUb Calendar Planning website";

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description ?? defaultDescription} />
      <meta
        name="google-site-verification"
        content="jcds2dS9NBwA2kAvHzMCpijshQQNSsbTmb_-WrsbSXc"
      />
      <meta name="robots" content="noindex, nofollow" />
      <meta property="og:title" content={fullTitle} />
      <meta name="theme-color" content="#3b82f6" />
      <meta
        property="og:description"
        content={description ?? defaultDescription}
      />
      <meta property="og:url" content="https://uniproject.mubkhan.me" />
      <meta property="og:site_name" content={siteName} />
    </Head>
  );
}
