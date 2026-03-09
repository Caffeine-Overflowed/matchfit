"use client"

import React, {FC} from "react";
import {AuthForm, AuthFormData} from "@/features/auth/ui/AuthForm";
import {useMutation} from "@apollo/client/react";
import {CombinedGraphQLErrors} from "@apollo/client/errors";
import {RegisterDocument} from "@/shared/api/graphql";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {useUserStore} from "@/shared/store/user-store";

export const SignUpForm: FC = () => {
    const router = useRouter();
    const authorize = useUserStore((state) => state.authorize);
    const [registerMutation, {loading}] = useMutation(RegisterDocument, {
        errorPolicy: 'all',
    });

    const handleSignUp = async (info: AuthFormData) => {
        try {
            const result = await registerMutation({
                variables: {
                    data: {
                        email: info.email,
                        password: info.password,
                    }
                }
            });


            if (result?.error) {
                console.log("Registration error:", result.error);

                return;
            }

            if (result.data?.register) {

                authorize(result.data.register);

                toast.success("Registration successful!");

                router.push("/");
            }
        } catch (err) {
            console.error("Network error:", err);
            toast.error(err instanceof Error ? err.message : "Network error");
        }
    };

    return (
        <AuthForm
            authActionType={"signup"}
            handleSubmit={handleSignUp}
            isLoading={loading}
        />
    );
};
