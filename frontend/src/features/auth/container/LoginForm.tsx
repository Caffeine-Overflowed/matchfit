"use client"

import React, { FC } from "react";
import { AuthForm, AuthFormData } from "@/features/auth/ui/AuthForm";
import { useMutation } from "@apollo/client/react";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { LoginDocument } from "@/shared/api/graphql";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/shared/store/user-store";

export const LoginForm: FC = () => {
    const router = useRouter();
    const authorize = useUserStore((state) => state.authorize);
    const [loginMutation, { loading }] = useMutation(LoginDocument, {
        errorPolicy: 'all',
    });

    const handleLogin = async (info: AuthFormData) => {
        try {
            const result = await loginMutation({
                variables: {
                    data: {
                        email: info.email,
                        password: info.password,
                    }
                }
            });


            if (result.error) {
                console.log("Login error:", result.error);

                return;
            }

            if (result.data?.login) {

                authorize(result.data.login)

                toast.success("Successful login");


                router.push("/");
            }
        } catch (err) {

            console.error("Network error:", err);
            toast.error(err instanceof Error ? err.message : "Network error");
        }
    };

    return (
        <AuthForm authActionType={"login"} handleSubmit={handleLogin} isLoading={loading} />
    );
};

