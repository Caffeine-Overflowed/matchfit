"use client";

import {FC, useCallback, useEffect, useRef} from "react";
import {useOAuthParams} from "@/shared/hooks/useOAuthParams";
import {useUserStore} from "@/shared/store/user-store";
import {useMutation} from "@apollo/client/react";
import {AuthGoogleDocument, GoogleAuthInput} from "@/shared/api";
import {useRouter} from "next/navigation";
import {CombinedGraphQLErrors} from "@apollo/client/errors";
import {toast} from "sonner";
import {errorTranslation} from "@/shared/constants/errorTranslation";


export const GoogleAuthContainer: FC = () => {
    const {code, state} = useOAuthParams();
    const {authorize} = useUserStore();
    const [authGoogle] = useMutation(AuthGoogleDocument, {
        errorPolicy: 'all'
    });

    const router = useRouter();

    const hasFetched = useRef(false);

    const fetchTokens = useCallback(
        async (data: GoogleAuthInput) => {
            try {
                const resp = await authGoogle({variables: {data}});

                if (resp.error || !resp.data) {
                    console.log("Login error:", resp.error);

                    const code = CombinedGraphQLErrors.is(resp.error)
                        ? resp.error.errors[0]?.message
                        : undefined;
                    toast.error(
                        (code && errorTranslation[code]) ||
                            errorTranslation["google_auth_error"],
                    );
                    router.replace("/auth/login");
                    return;
                }

                authorize(resp.data.authGoogle);
                // Navigate only after a successful token exchange.
                router.push("/home");
            } catch (err) {
                console.error("Network error:", err);
                toast.error(err instanceof Error ? err.message : "Network error");
                router.replace("/auth/login");
            }
        }, [authGoogle, authorize, router],
    );

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        if (!code || !state) {
            console.error("code or state is missing");
            toast.error(errorTranslation["invalid_oauth_state"]);
            router.replace("/auth/login");
            return;
        }

        const data: GoogleAuthInput = {
            code: code || "",
            state: state || "",
        };

        fetchTokens(data).then();
    }, [state, code, fetchTokens, router]);

    return null;

};
