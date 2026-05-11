import { FaRocket } from "react-icons/fa";
import { QuickButton } from "@/components/home/QuickButton";
import Footer from "@/components/landing/footer";

export default function landing() {
  return (
    <div className="flex flex-col overflow-auto h-full min-h-full w-full">
      <main className="flex flex-col items-center justify-center text-center px-4 py-24 h-full w-full">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Mub Calendar</h1>
        <p className="text-slate-300 text-lg max-w-xl mb-8">
          Your AI powered planner to help you in tasks big or small...
        </p>
        <div className="flex gap-2">
          <QuickButton
            label="Get Started"
            href="/auth/register"
            icon={FaRocket}
          />
          <QuickButton label="Login" href="/auth/login" icon={FaRocket} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
