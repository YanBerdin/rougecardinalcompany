"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useNewsletterSubscribe } from "./hooks";

interface NewsletterContextValue {
    email: string;
    isLoading: boolean;
    isSubscribed: boolean;
    isInitialLoading: boolean;
    errorMessage: string | null;
    handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
}

const NewsletterContext = createContext<NewsletterContextValue | null>(null);

interface NewsletterProviderProps {
    children: ReactNode;
    source?: string;
}

export function NewsletterProvider({ children, source }: NewsletterProviderProps) {
    const {
        email,
        isLoading,
        isSubscribed,
        isInitialLoading,
        errorMessage,
        handleEmailChange,
        handleSubmit,
    } = useNewsletterSubscribe({ source });

    return (
        <NewsletterContext.Provider
            value={{
                email,
                isLoading,
                isSubscribed,
                isInitialLoading,
                errorMessage,
                handleEmailChange,
                handleSubmit,
            }}
        >
            {children}
        </NewsletterContext.Provider>
    );
}

export function useNewsletterContext(): NewsletterContextValue {
    const ctx = useContext(NewsletterContext);
    if (!ctx) {
        throw new Error(
            "useNewsletterContext must be used within NewsletterProvider"
        );
    }
    return ctx;
}
