import { LoginForm } from "@/features/auth/container/LoginForm";
import { SignUpForm } from "@/features/auth/container/SignupForm";


interface Props{
    params: {
        "authType": "signup" | "login"
    }
}

export default async function AuthenticationPage({params}: Props) {
    const { authType } = await params;

    return <>
        {authType === "signup" ? <SignUpForm/> : <LoginForm/>}
    </>


}


