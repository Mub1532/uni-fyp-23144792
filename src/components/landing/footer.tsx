import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto mb-0 h-fit w-full bg-blue-400 dark:bg-slate-700 p-4">
      <div className="flex items-center justify-center gap-4 text-sm text-white font-bold dark:text-slate-300">
        <div className="font-medium">Mub Calendar 2026</div>
        <Link
          passHref
          className="hover:opacity-70 transition-opacity ease-in duration-100"
          href="/tos"
        >
          Terms of Service
        </Link>
        <span>-</span>
        <Link
          className="hover:opacity-70 transition-opacity ease-in duration-100"
          href="/privacy"
        >
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
