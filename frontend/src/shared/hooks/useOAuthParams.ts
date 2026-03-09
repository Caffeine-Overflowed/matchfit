"use client";

import {useMemo} from "react";
import {useSearchParams} from "next/navigation";

interface OAuthParams {
    code: string | null;
    state: string | null;
}

export function useOAuthParams(): OAuthParams {
    const searchParams = useSearchParams();

    return useMemo(() => {
        const code = searchParams.get("code");
        const state = searchParams.get("state");


        return {code, state};
    }, [searchParams]);
}
