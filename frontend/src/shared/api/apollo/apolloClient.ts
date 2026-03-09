"use client";

import { ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { ErrorLink } from "@apollo/client/link/error";
import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs";
import { useUserStore } from "@/shared/store/user-store";
import authLink from "@/shared/api/apollo/links/authLink";
import {errorLink} from "@/shared/api/apollo/links/errorLink";

const apiUrl = process.env.NODE_ENV === "production" && typeof window !== "undefined" ? `${window.location.origin}/graphql` : `https://${process.env.NEXT_PUBLIC_URL}/graphql`;

/*
const authLink = new ApolloLink((operation, forward) => {
    const accessToken = useUserStore.getState().tokens?.accessToken;

    operation.setContext(({ headers = {} }) => ({
        headers: {
            ...headers,
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
    }));

    return forward(operation);
});
*/

const uploadLink = new UploadHttpLink({
    uri: apiUrl,
});

export const client = new ApolloClient({
    link: ApolloLink.from([errorLink, authLink, uploadLink]),
    cache: new InMemoryCache(),
});

