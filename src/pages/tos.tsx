export default function Tos() {
  return (
    <div className="flex flex-col gap-2 h-full w-full px-4 text-slate-700  dark:text-white">
      <div className="">
        This is my (Mubashar Khan) Final University Project, and this website is
        not meant for production use as of now.
      </div>

      <div className="text-2xl font-bold mt-2">Terms of Service:</div>

      <ul className="list-disc pl-6">
        <li>
          This is a univeristy project, so website may be offline any time
        </li>
        <li>You use this app at your own risk</li>
        <li>We are not liable for any data loss or issues arising from use</li>
        <li>
          Do not upload any sensitive or personal information beyond what is
          required
        </li>
      </ul>

      <div className="text-xl font-bold mt-2">
        Google Calendar Sync (disabled by default):
      </div>

      <div className="text-lg font-semibold mt-2">
        If you enable Google Calendar Sync:
      </div>

      <ul className="list-disc pl-6">
        <li>
          You grant read-only access to your Google Calendar, for the purposes
          of syncing calendars.
        </li>
        <li>
          You grant read-only access to your Google Username/Name and profile
          picture if enabled.
        </li>
        <li>
          You can revoke access at any time via{" "}
          <a
            className="underline"
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noreferrer"
          >
            myaccount.google.com/permissions
          </a>
        </li>
      </ul>

      <div>
        We (Mubashar Khan) do not sell any data, we do not have tracking, and
        only data specifically enabled by you is stored.
      </div>
    </div>
  );
}
