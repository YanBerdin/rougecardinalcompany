"use client";

import { Newsletter as NewsletterComponent, NewsletterForm } from './Newsletter';
import { useNewsletter } from './hooks';

export function NewsletterContainer() {
    const {
        email,
        isSubscribed,
        isLoading,
        isInitialLoading,
        handleEmailChange,
        handleSubmit
    } = useNewsletter();

    return (
        <NewsletterComponent isSubscribed={isSubscribed} isInitialLoading={isInitialLoading}>
            {!isSubscribed && !isInitialLoading && (
                <NewsletterForm
                    email={email}
                    isLoading={isLoading}
                    isSubscribed={isSubscribed}
                    onEmailChange={handleEmailChange}
                    onSubmit={handleSubmit}
                />
            )}
        </NewsletterComponent>
    );
}
