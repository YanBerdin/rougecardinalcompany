"use client";

import { NewsletterView, NewsletterForm } from './NewsletterView';
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
        <NewsletterView
            isSubscribed={isSubscribed}
            isInitialLoading={isInitialLoading}
            email={email}
            isLoading={isLoading}
            onEmailChange={handleEmailChange}
            onSubmit={handleSubmit}
        >
            {!isSubscribed && !isInitialLoading && (
                <NewsletterForm
                    email={email}
                    isLoading={isLoading}
                    isSubscribed={isSubscribed}
                    onEmailChange={handleEmailChange}
                    onSubmit={handleSubmit}
                />
            )}
        </NewsletterView>
    );
}
