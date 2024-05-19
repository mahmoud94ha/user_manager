import { useSession } from "next-auth/react";

export default function getSession() {
    const { data: session } = useSession();
    if (session) {
        return session
    }
    return null;
}
