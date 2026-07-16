import type {AuthResultFragment, AuthTokensFragment, UserType} from "@/shared/api";
import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";

export interface UserStoreState {
    user: UserType | undefined;
    tokens: AuthTokensFragment | undefined;
    isAuthorized: boolean;
    authorize: (authInfo: AuthResultFragment) => void;
    unAuthorize: () => void;
    refreshTokens: (tokensInfo: AuthTokensFragment) => void;
}

const localStorage = typeof window !== "undefined" ? window.localStorage : undefined;

// Backend sends expiry as absolute unix timestamps in seconds; convert to ms epoch.
// Copy instead of mutating the Apollo mutation result (which is cached/frozen).
const normalizeTokens = (tokens: AuthTokensFragment): AuthTokensFragment => ({
    ...tokens,
    accessTokenExpire: tokens.accessTokenExpire * 1000,
    refreshTokenExpire: tokens.refreshTokenExpire * 1000,
});

// Synchronous initialization from localStorage
const persistedState = (() => {
    try {
        return JSON.parse(localStorage?.getItem("user-storage") || "{}").state || {};
    } catch {
        return {};
    }
})();

export const useUserStore = create<UserStoreState>()(
    persist(
        (set) => ({
            tokens: persistedState.tokens || undefined,
            user: persistedState.user || undefined,
            isAuthorized: persistedState.isAuthorized || false,
            authorize: (authInfo: AuthResultFragment) => {
                set(() => ({
                    tokens: normalizeTokens(authInfo.tokens),
                    user: authInfo.user,
                    isAuthorized: true,
                }));
            },
            unAuthorize: () => {
                set(() => ({
                    isAuthorized: false,
                    tokens: undefined,
                    user: undefined,
                }));
            },
            refreshTokens: (tokensInfo: AuthTokensFragment) => {
                set(() => ({
                    tokens: normalizeTokens(tokensInfo)
                }));
            },
        }),
        {
            name: "user-storage",
            storage: createJSONStorage(() => localStorage as Storage),
        },
    ),
);
