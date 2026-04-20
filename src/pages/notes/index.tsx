import { NOTE_CODES } from "@/types/notes";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function Notes() {
    const router = useRouter();

    useEffect(() => {
        if (Number(router.query.code) === NOTE_CODES.NOT_FOUND) {
            toast.error("That note was not found.");
        }
    }, [router.query.code]);

    return <></>;
}
