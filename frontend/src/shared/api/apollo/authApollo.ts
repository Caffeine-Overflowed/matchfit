"use client";

import {ApolloClient, ApolloLink, HttpLink, InMemoryCache} from "@apollo/client";

const isProd = process.env.NODE_ENV === "production";
const apiUrl = isProd && typeof window !== "undefined"
    ? `${window.location.origin}/graphql`
    : `${isProd ? "https" : "http"}://${process.env.NEXT_PUBLIC_URL}/graphql`;

const httpLink = new HttpLink({
    uri: apiUrl,
});

const authApollo = new ApolloClient({
  ssrMode: false,
  link: httpLink,
  cache: new InMemoryCache(),
});

export default authApollo;
