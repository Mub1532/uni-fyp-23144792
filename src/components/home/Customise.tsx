import { useState } from "react";
import { FaPalette } from "react-icons/fa";
import { toast } from "react-toastify";

import { USER_CODES } from "@/types/user";
import EventModal from "../calendar/modal";
import { QuickButton } from "./QuickButton";

type customiseProps = {
  initialImage?: string | null;
  className?: string;
};

export default function CustomiseBackground({
  initialImage,
  className,
}: customiseProps) {
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialImage);

  async function setBG() {
    if (!imageUrl) {
      toast.warn("Please enter an image URL.");
      return;
    }

    try {
      const res = await fetch("/api/auth/background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await res.json();

      if (data.code === USER_CODES.NOT_VALID_IMG) {
        toast.info("That image is not accessible from the server.");
      } else if (data.code === USER_CODES.SAVE_SUCCESS) {
        toast.info("Successfully set image, please refresh the page to see.");
        setOpen(false);
      } else {
        toast.error("Failed to save background image.");
      }
    } catch {
      toast.error("Unknown error.");
    }
  }

  return (
    <div className={className}>
      <QuickButton
        icon={FaPalette}
        label="Customise"
        onClick={() => setOpen(true)}
        className="text-xs md:text-sm"
        extraIconClass="text-sm md:text-md"
        showText="onlyMd"
      />

      <EventModal
        open={open}
        onClose={() => setOpen(false)}
        modalType="generic"
        title="Customise Background"
        onSave={setBG}
        submitLabel={"Save"}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Image URL
            </label>
            <input
              type="text"
              value={imageUrl as string}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {imageUrl && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Preview
              </label>
              {/** biome-ignore lint/performance/noImgElement: preview url */}
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              />
            </div>
          )}
        </div>
      </EventModal>
    </div>
  );
}
