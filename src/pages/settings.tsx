import { toDateTimeLocal } from "@/components/calendar/modal";
import LoginButton from "@/components/misc/LoginButton";
import type { MyPageProps } from "@/types/props";
import { USER_CODES } from "@/types/user";
import verifyUser from "@/utils/auth/jwt";
import { getDBConnection } from "@/utils/database";
import type { RowDataPacket } from "mysql2";
import type { GetServerSidePropsContext } from "next";
import { type HTMLInputTypeAttribute, useEffect, useState } from "react";

interface SettingsProps extends MyPageProps {
  userCreated: string;
}

export default function Settings({ user, userCreated }: SettingsProps) {
  const [email, setEmail] = useState<string | undefined>(user?.email);
  const [username, setUsername] = useState<string | undefined>(user?.username);
  const [password, setPassword] = useState<string | undefined>();

  useEffect(() => {
    if (!user) return;
    setUsername(user?.username);
    setEmail(user?.email);
  }, [user]);

  console.log(email, username);

  return (
    <div className="h-full w-full flex gap-4 px-4 flex-col">
      <div className="flex gap-2 h-fit w-full text-slate-200">
        <div className="rounded-md bg-blue-500 aspect-square w-24 flex items-center justify-center text-6xl font-bold">
          {user?.username[0].toUpperCase().trimEnd()}
        </div>
        <div className="flex flex-col gap-1 h-full w-full justify-center">
          <div className="text-xl font-semibold text-blue-500 dark:text-slate-300">
            {user?.username}
          </div>
          <div className="text-md font-medium text-blue-500 dark:text-slate-300">
            User Created At: <span className="font-bold">{userCreated}</span>
          </div>
        </div>
      </div>

      <div className="h-fit w-full sm:w-1/2 lg:w-1/4 flex flex-col gap-2">
        <div className="text-lg font-bold text-blue-400">
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
        <LoginButton type="logout" extraClass="p-2" />
      </div>
    </div>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const rawCookie = req.headers.cookie;
  const user = await verifyUser(rawCookie as string);

  if (!user || !user?.id) {
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
    [user?.id],
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
import { FaLock, FaUser } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

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
