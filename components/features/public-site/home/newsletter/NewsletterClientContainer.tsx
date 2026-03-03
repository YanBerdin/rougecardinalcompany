"use client";

import { NewsletterView } from "./NewsletterView";
import { NewsletterForm } from "./NewsletterForm";
import { NewsletterProvider, useNewsletterContext } from "./NewsletterContext";

function NewsletterViewInner() {
    const { isSubscribed, isInitialLoading, errorMessage } =
        useNewsletterContext();

    return (
        <NewsletterView
            isSubscribed={isSubscribed}
            isInitialLoading={isInitialLoading}
            errorMessage={errorMessage}
        >
            {!isSubscribed && !isInitialLoading && <NewsletterForm />}
        </NewsletterView>
    );
}

export function NewsletterClientContainer() {
    return (
        <NewsletterProvider>
            <NewsletterViewInner />
        </NewsletterProvider>
    );
}
