import { SignUp } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="flex justify-center items-center py-24 bg-dark-300 min-h-screen">
            <SignUp path="/sign-up" />
        </div>
    );
}
