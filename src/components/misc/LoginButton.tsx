import ItemContainer from "@/components/misc/ItemContainer";
import { useRouter } from "next/router";

export default function LoginButton() {
    const router = useRouter();

    return (
        <ItemContainer
            as="button"
            onClick={() => {
                router.push("/auth/login");
            }}
            className="text-sm md:text-lg font-medium px-4"
        >
            Login
        </ItemContainer>
    );
}
