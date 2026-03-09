"use client"

import React, { FC, useState } from "react";
import Link from "next/link";
import { GoogleIcon } from "@/shared/components/icon/googleIcon";
import { LineSeparator } from "@/shared/components/LineSeparator";
import { ROUTES } from "@/shared/constants/routes";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import {useRouter} from "next/navigation";
import {useMutation} from "@apollo/client/react";
import {AuthGoogleDocument, GoogleAuthUrlDocument} from "@/shared/api";


interface AuthFormProps {
    authActionType: 'login' | 'signup';
    handleSubmit: (info: AuthFormData) => void | Promise<void>;
    isLoading?: boolean;
}

export interface AuthFormData {
    email: string;
    password: string;
}


export const AuthForm: FC<AuthFormProps> = ({ authActionType, handleSubmit, isLoading = false }) => {
    const [info, setInfo] = useState<AuthFormData>({ email: "", password: "" });
    const isLogin = authActionType === "login";
    const content = {
        title: isLogin ? "Log in" : "Create account",
        description: isLogin ? "Welcome back!" : "Join us and start your journey today.",
        submitText: isLogin ? "Sign in" : "Get started",
        footerText: isLogin ? "Don't have an account?" : "Already have an account?",
        linkText: isLogin ? "Create an account" : "Log in here",
        linkHref: isLogin ? ROUTES.SIGNUP : ROUTES.LOGIN,
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit(info);
    };

    const [googleUrl] = useMutation(GoogleAuthUrlDocument, {
        errorPolicy: 'all'
    });

    const loginWithGoogle = async () => {
        try {
            const r = await googleUrl();

            if (r.data?.googleAuthUrl) {
                window.location.assign(r.data.googleAuthUrl.url);
            }
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-[400px]">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">
                        {content.title}
                    </CardTitle>
                    <CardDescription>
                        {content.description}
                    </CardDescription>
                </CardHeader>

                <CardContent className="grid gap-6">
                    <form onSubmit={onSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email text-left">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={info.email}
                                onChange={(e) => setInfo({ ...info, email: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password text-left">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={info.password}
                                onChange={(e) => setInfo({ ...info, password: e.target.value })}
                            />
                        </div>

                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Loading..." : content.submitText}
                        </Button>
                    </form>

                    <div className="relative">
                        <LineSeparator text="or" />
                    </div>

                    <Button
                        variant="outline"
                        type="button"
                        className="w-full"
                        onClick={() => loginWithGoogle()}
                    >
                        <GoogleIcon />
                        Continue with Google
                    </Button>
                </CardContent>

                <CardFooter className="flex flex-wrap items-center justify-center gap-1 text-sm text-muted-foreground">
                    <span>{content.footerText}</span>
                    <Link
                        href={content.linkHref}
                        className="font-semibold text-primary underline-offset-4 hover:underline"
                    >
                        {content.linkText}
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};