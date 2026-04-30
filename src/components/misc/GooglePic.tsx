import Image from "next/image";
import { joinClasses } from "@/utils/misc/classes";

type GooglePicProps = {
  pic: string;
  size?: string;
  rounded?: boolean;
};

export default function GooglePic({
  pic,
  size = "w-5 md:w-7",
  rounded = false,
}: GooglePicProps) {
  return (
    <div className={joinClasses("aspect-square relative rounded-sm", size)}>
      <Image
        src={pic}
        alt="Google Profile Pic"
        fill
        className={rounded ? "rounded-sm!" : ""}
      />
    </div>
  );
}
