import { USER_CODES } from "@/types/user";
import { hashEmailPass } from "@/utils/auth/jwt";
import Link from "next/link";
import type { SubmitEvent } from "react";
import { useState } from "react";
import { MdEmail, MdLock, MdPerson } from "react-icons/md";
import { LoginInput } from "./login";

export default function RegisterPage() {
  const [currentMessage, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("confirmPassword") as string;
    const username = formData.get("username") as string;

    if (!email || !password || !username) {
      setMessage("Please enter your email, password and username.");
      setSubmitting(false);
      return;
    }

    if (password !== passwordConfirm) {
      setMessage("Password do not match, please try again.");
      setSubmitting(false);
      return;
    }

    const hashedEmail = hashEmailPass(email);
    const hashedPassword = hashEmailPass(password);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: hashedEmail,
          password: hashedPassword,
          username,
        }),
      });

      const data = await res.json();

      const status = data.code;

      if (status === USER_CODES.INFO_NOT_ENTERED) {
        setSubmitting(false);
        setMessage("Please enter email, password and username.");
      } else if (status === USER_CODES.USER_EXISTS) {
        setSubmitting(false);
        setMessage("User with this email exists, please sign in.");
      } else if (data.error || !data) {
        setMessage(data.error ?? "Unknown Error.");
        setSubmitting(false);
      } else if (status === USER_CODES.CREATED_SUCCESSFULLY) {
        setSubmitting(false);
        setMessage("Signed up Successfully.");

        await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: hashedPassword }),
        });

        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      }
    } catch (_) {
      setMessage("Unknown error.");
    }
  }

  return (
    <div className="flex items-center justify-center h-full min-h-0 pb-36">
      <div className="border-2 inset-shadow-amber-950 border-blue-300 rounded-xl p-8 w-full max-w-sm">
        <h1 className="text-xl font-semibold text-blue-400 mb-6 text-center">
          Register
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <LoginInput
            icon={<MdEmail />}
            type="email"
            name="email"
            placeholder="Email"
          />
          <LoginInput
            icon={<MdPerson />}
            type="username"
            name="username"
            placeholder="Username"
          />
          <LoginInput
            icon={<MdLock />}
            type="password"
            name="password"
            placeholder="Password"
          />
          <LoginInput
            icon={<MdLock />}
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
          />

          {currentMessage && (
            <p className="text-red-400 text-xs">{currentMessage}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-400 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg py-2 text-sm font-medium transition-colors"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-5">
          Have an account?{" "}
          <Link
            href="/auth/login"
            className="text-blue-400 hover:underline font-semibold"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
