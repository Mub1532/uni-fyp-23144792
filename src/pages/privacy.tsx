export default function Planner() {
  return (
    <div className="flex flex-col gap-2 h-full w-full px-4 text-slate-700  dark:text-white">
      <div className="">
        This is my (Mubashar Khan) Final Univeristy Project, and this website is
        not meant for production use as of now.
      </div>

      <div className="text-2xl font-bold mt-2">
        Data that is stored or Used:
      </div>

      <ul className="list-disc pl-6">
        <li>Username</li>
        <li>Email (hashed on database)</li>
        <li>Password (hashed)</li>
        <li>Calendar Events you explicitly create</li>
        <li>Tasks you explicitly create</li>
        <li>Notes you explicitly create</li>
      </ul>

      <div className="text-xl font-bold mt-2">
        Data that is stored or Used but disabled by default:
      </div>

      <div className="text-lg font-semibold mt-2">
        (Read Only) If Google Calendar Sync enabled:
      </div>

      <ul className="list-disc pl-6">
        <li>Calendar items, so that it can be added to your calendar</li>
        <li>
          Username/Name, so that you can see if you are signed in, and to the
          correct account
        </li>
        <li>
          Profile Picture if you enable the setting Use Google Profile Picture
          as my profile pic.
        </li>
      </ul>

      <div className="mt-4 font-semibold">
        We (Mubashar Khan) do not sell any data, we do not have tracking, and
        only data specifically enabled by you is stored
      </div>
    </div>
  );
}
