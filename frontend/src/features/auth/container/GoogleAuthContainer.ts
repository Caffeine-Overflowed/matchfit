"use client";

import {FC, useCallback, useEffect, useRef} from "react";
import {useOAuthParams} from "@/shared/hooks/useOAuthParams";
import {useUserStore} from "@/shared/store/user-store";
import {useMutation} from "@apollo/client/react";
import {AuthGoogleDocument, GoogleAuthInput} from "@/shared/api";
import {useRouter} from "next/navigation";
import {CombinedGraphQLErrors} from "@apollo/client/errors";
import {toast} from "sonner";


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

                if (resp.error) {
                    console.log("Login error:", resp.error);


                    return;
                }

                if (!resp.data) return;


                const tokenAndUser = resp.data.authGoogle

                authorize(tokenAndUser);


            } catch (err) {
                console.error("Network error:", err);
                toast.error(err instanceof Error ? err.message : "Network error");
            } finally {
                router.push("/home");
            }
        }, [authGoogle, authorize, router],
    );

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        if (!code || !state) {
            console.error("code or state is missing");
            return;
        }

        const data: GoogleAuthInput = {
            code: code || "",
            state: state || "",
        };

        fetchTokens(data).then();
    }, [state, code, fetchTokens]);

    return null;

};
