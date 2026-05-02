import moment from "moment";
import type { RowDataPacket } from "mysql2";
import type { GetServerSidePropsContext } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { type HTMLInputTypeAttribute, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { toDateTimeLocal } from "@/components/calendar/modal";
import LoginButton from "@/components/misc/LoginButton";
import type { MyPageProps } from "@/types/props";
import { USER_CODES } from "@/types/user";
import verifyUser from "@/utils/auth/jwt";
import { getDBConnection } from "@/utils/database";

interface SettingsProps extends MyPageProps {
  userCreated: string;
}

export default function Settings({
  user,
  userCreated,
  googlePic,
  googleUser,
  useGooglePic,
}: SettingsProps) {
  const [email, setEmail] = useState<string | undefined>(user?.email);
  const [username, setUsername] = useState<string | undefined>(user?.username);
  const [password, setPassword] = useState<string | undefined>();
  const [showGooglePic, setShowGooglePic] = useState(useGooglePic);

  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    setUsername(user?.username);
    setEmail(user?.email);
    setShowGooglePic(useGooglePic);
  }, [user, useGooglePic]);

  async function updateUser() {
    if (
      (!username && !email && password) ||
      (username === user?.username && email === user?.email && !password)
    )
      return toast.warn(
        "Please change at least 1 setting to update the user info.",
      );

    const responseFetch = await fetch(`/api/auth/update`, {
      method: "POST",
      body: JSON.stringify({
        email: email,
        username: username,
        password: password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await responseFetch.json();

    switch (data?.code) {
      case USER_CODES.NOT_LOGGED_IN:
        toast.warn("Please login or sign up first.");
        break;
      case USER_CODES.USER_EXISTS:
        toast.warn("User with that email already exists.");
        break;
      case USER_CODES.INFO_NOT_ENTERED:
        toast.warn("Please change at least 1 setting to update the user info.");
        break;
      case USER_CODES.SAVE_FAIL:
        toast.error("Failed to save User.");
        break;
      case USER_CODES.SAVE_SUCCESS:
        toast.info("Updated Settings Successfully.");
        break;
      default:
        toast.error("Unknown error.");
        break;
    }
  }

  const debouncedSave = useDebounceCallback(updateUser, 500);

  const [lastToggledPic, setLastToggledPic] = useState<number | null>(null);

  async function toggleGooglePicPref() {
    if (lastToggledPic && Date.now() - lastToggledPic < 60000) {
      toast.warning("Please wait a minute before toggling again.");
      return;
    }

    const res = await fetch("/api/google/togglePicPref", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newValue: !showGooglePic }),
    });

    const { success, code } = await res.json();

    if (success) {
      toast.info("Successfully toggled preference.");
      setShowGooglePic(!showGooglePic);
      setLastToggledPic(Date.now());
      return;
    }

    switch (code) {
      case USER_CODES.NOT_LOGGED_IN:
        toast.error("Could not verify login, please refresh.");
        break;
      case USER_CODES.SAVE_FAIL:
        toast.error("Could not toggle, please refresh & try again.");
        break;
      default:
        toast.error("Unknown error, please try again later.");
        break;
    }
  }

  const [googleSyncLoading, setSyncLoading] = useState(false);

  async function syncGoogle() {
    if (!googleUser) {
      router.push("/api/google/auth");
    } else {
      setSyncLoading(true);
      const res = await fetch("/api/google/syncCalendar?isManual=true");
      const data = await res.json();

      if (data?.success === true) {
        toast.success("Successfully Synced Calendar.");
      } else {
        toast.error("Could not Sync Calendar.");
      }
      setSyncLoading(false);
    }
  }

  return (
    <div className="h-full w-full flex md:flex-row gap-6 px-1 md:px-4 flex-col">
      {/* first section, user settings etc */}
      <div className="h-full w-full lg:mr-12">
        <div className="flex gap-2 h-fit w-full text-slate-200">
          {useGooglePic && googlePic ? (
            <GooglePic
              pic={googlePic}
              size="w-24 border-4 rounded-md! border-blue-500"
            />
          ) : (
            <div className="rounded-md bg-blue-500 aspect-square w-24 flex items-center justify-center text-6xl font-bold">
              {user?.username[0].toUpperCase().trimEnd()}
            </div>
          )}
          <div className="flex flex-col gap-1 h-full w-full justify-center">
            <div className="text-xl font-semibold text-blue-500 dark:text-slate-300">
              {username}
            </div>
            <div className="text-md font-medium text-blue-500 dark:text-slate-300">
              User Since:{" "}
              <span className="font-bold">
                {moment(userCreated).format("dddd Do MMMM [-] HH:mm")}
              </span>
            </div>
          </div>
        </div>
        <div className="h-fit w-full flex flex-col gap-2">
          <div className="text-lg font-bold text-blue-400 mt-2">
            Change Account Settings
          </div>
          <FormInput
            icon={MdEmail}
            title="Email"
            value={email}
            placeholder="Change Email"
            type="email"
            onChange={setEmail}
          />
          <FormInput
            icon={FaUser}
            title="Username"
            value={username}
            placeholder="Change Username"
            onChange={setUsername}
          />
          <FormInput
            icon={FaLock}
            title="Password"
            type="password"
            value={password}
            placeholder="Change Password"
            onChange={setPassword}
          />
          <div className="h-fit w-full max-w-fit flex flex-col md:flex-row gap-2">
            <button
              onClick={debouncedSave}
              type="button"
              className="w-fit h-full p-2 bg-blue-300 dark:bg-slate-600 flex items-center justify-center gap-2 font-medium text-lg rounded-md cursor-pointer hover:bg-blue-400 hover:dark:bg-slate-700 transition-all! ease-in duration-100 text-blue-800 dark:text-slate-300"
            >
              <FaSave className="text-2xl text-slate-100!" />
              <div className="text-sm md:text-lg">Save Account Settings</div>
            </button>
            <LoginButton
              type="logout"
              extraClass="p-2 w-fit text-sm! md:text-lg!"
              extraIconClass="text-2xl dark:text-slate-300 text-slate-100"
            />
          </div>
        </div>
      </div>

      {/* second section, toggle stuff */}
      <div className="h-full w-full flex flex-col gap-4">
        {/* Future improvemnets, reminders */}
        {/* <div className="text-lg font-bold text-blue-400 ">
          Reminders & Notification Settings
        </div> */}

        <div className="flex flex-col gap-2">
          <div className="text-lg font-bold text-blue-400">
            Calendar Sync Settings
          </div>
          {googleUser && (
            <>
              <div className="font-medium">Currently Syncing as: </div>
              <div className="flex h-fit w-full gap-2 items-center">
                <div className="relative aspect-square w-20!">
                  <Image
                    src={googlePic ?? ""}
                    alt="Google Profile Pic"
                    fill
                    className="rounded-md border-3 border-blue-500"
                  />
                </div>
                <div>
                  <span className="font-bold">{googleUser}</span>
                  <div className="font-medium">
                    Auto Syncs every 24h
                    <br />
                    <span className="font-bold">Calendar Last Synced:</span> 23
                    April 15:35pm
                  </div>
                </div>
              </div>
            </>
          )}
          <button
            onClick={syncGoogle}
            type="button"
            className="w-fit h-fit p-2 bg-blue-300 dark:bg-slate-600 flex items-center justify-center gap-2 font-medium text-md rounded-md cursor-pointer hover:bg-blue-400 hover:dark:bg-slate-700 transition-all! ease-in duration-100 text-blue-800 dark:text-slate-300"
          >
            {googleSyncLoading ? (
              <AiOutlineLoading3Quarters className="text-2xl text-slate-100! animate-spin" />
            ) : (
              <FaGoogle className="text-2xl text-slate-100!" />
            )}
            <div>{googleUser ? "Manual Sync" : "Login to Sync"}</div>
          </button>
          {googleUser && (
            <div className="w-fit max-w-full flex items-center h-fit">
              <div className="mr-2 font-medium">
                Use Google PFP as Profile Pic:
              </div>
              <Toggle toggle={showGooglePic} onToggle={toggleGooglePicPref} />
            </div>
          )}
        </div>

        <div className="text-lg font-bold text-blue-400 mt-2">AI Settings</div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const rawCookie = req.headers.cookie;
  const { currentUser } = await verifyUser(rawCookie as string);

  if (!currentUser?.id) {
    return {
      redirect: {
        destination: `/auth/login?code=${USER_CODES.NOT_LOGGED_IN}`,
        permanent: false,
      },
    };
  }

  const connection = await getDBConnection();

  const [[rows]] = await connection.query<RowDataPacket[]>(
    "SELECT created_at from users WHERE id = ?;",
    [currentUser?.id],
  );

  if (rows?.created_at)
    return {
      props: { userCreated: toDateTimeLocal(rows?.created_at) },
    };

  return {
    props: { userCreated: undefined },
  };
}

import type { IconType } from "react-icons";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaGoogle, FaLock, FaSave, FaUser } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { useDebounceCallback } from "usehooks-ts";
import GooglePic from "@/components/misc/GooglePic";
import Toggle from "@/components/misc/Toggle";

interface FormInputProps {
  title: string;
  icon: IconType;
  placeholder: string;
  value: string | undefined;
  onChange: (value: string) => void;
  type?: HTMLInputTypeAttribute;
}

function FormInput({
  title,
  icon: Icon,
  placeholder,
  value,
  onChange,
  type,
}: FormInputProps) {
  return (
    <div className="flex flex-col gap-1 h-full w-full">
      <label htmlFor={title} className="text-md font-semibold">
        {title}
      </label>
      <div className="flex items-center gap-2 px-3 h-8 w-full rounded-md border">
        <Icon />
        <input
          id={title}
          type={type ?? "text"}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="outline-none! text-sm h-full w-full placeholder:text-slate-400 text-blue-900 dark:text-slate-300 font-medium"
        />
      </div>
    </div>
  );
}
