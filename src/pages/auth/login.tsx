import { USER_CODES } from "@/types/user";
import { hashEmailPass } from "@/utils/auth/jwt";
import Link from "next/link";
import { useRouter } from "next/router";
import type { SubmitEvent } from "react";
import { useEffect, useState } from "react";
import { MdEmail, MdLock } from "react-icons/md";
import { toast } from "react-toastify";

export default function LoginPage() {
  const [currentMessage, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (Number(router.query.code) === USER_CODES.NOT_LOGGED_IN) {
      toast.warn("Please login or sign up first.");
    } else if (Number(router.query.code) === USER_CODES.LOGGED_OUT) {
      toast.info("Successfully Logged out.");
    }
  }, [router.query.code]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      setMessage("Please enter your email and password.");
      setSubmitting(false);
      return;
    }

    const hashedPassword = hashEmailPass(password);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: hashedPassword }),
      });

      const data = await res.json();

      const status = data.code;

      if (status === USER_CODES.INFO_NOT_ENTERED) {
        setSubmitting(false);
        setMessage("Please enter email and password.");
      } else if (status === USER_CODES.USER_DOESNT_EXIST) {
        setSubmitting(false);
        setMessage("Incorrect email or password, please try again.");
      } else if (status === USER_CODES.WRONG_PASSWORD) {
        setSubmitting(false);
        setMessage("Incorrect email or password, please try again.");
      } else if (data.error || !data) {
        setMessage(data.error ?? "Unknown Error.");
        setSubmitting(false);
      } else if (status === USER_CODES.LOGGED_IN) {
        setSubmitting(false);
        setMessage("Logged in Successfully.");

        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      }
    } catch (_) {
      setMessage("Unknown error.");
    }
  }

  return (
    <div className="flex items-center justify-evenly h-full min-h-0 pb-42">
      <div className="border-2 border-blue-300 rounded-xl p-10 w-full max-w-sm">
        <h1 className="text-xl font-semibold text-blue-400 mb-6 text-center">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <LoginInput
            icon={<MdEmail />}
            type="email"
            name="email"
            placeholder="Email"
          />
          <LoginInput
            icon={<MdLock />}
            type="password"
            name="password"
            placeholder="Password"
          />

          {currentMessage && (
            <p className="text-red-400 text-xs">{currentMessage}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-400 hover:bg-blue-500 cursor-pointer disabled:opacity-50 text-white rounded-lg py-2 text-sm font-medium transition-colors"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-xs text-gray-400 dark:text-slate-300 text-center mt-5">
          No account?{" "}
          <Link
            href="/auth/register"
            className="text-blue-400 hover:underline font-semibold"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export function LoginInput({
  icon,
  ...props
}: { icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="text-white placeholder:text-white flex items-center gap-3 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-blue-400 transition-colors">
      <span className="text-gray-400 text-lg shrink-0">{icon}</span>
      <input
        {...props}
        required
        className="flex-1 outline-none text-sm text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder:text-slate-300"
      />
    </div>
  );
}
