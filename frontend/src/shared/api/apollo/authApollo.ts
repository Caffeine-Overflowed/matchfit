"use client";

import {ApolloClient, HttpLink, InMemoryCache} from "@apollo/client";

const isProd = process.env.NODE_ENV === "production";
const rawApiUrl = process.env.NEXT_PUBLIC_URL || "localhost:8000";
const httpBaseUrl = (
  /^https?:\/\//.test(rawApiUrl)
    ? rawApiUrl
    : `${isProd ? "https" : "http"}://${rawApiUrl}`
).replace(/\/+$/, "");
const apiUrl = `${httpBaseUrl}/graphql`;

const httpLink = new HttpLink({
    uri: apiUrl,
});

const authApollo = new ApolloClient({
  ssrMode: false,
  link: httpLink,
  cache: new InMemoryCache(),
});

export default authApollo;
