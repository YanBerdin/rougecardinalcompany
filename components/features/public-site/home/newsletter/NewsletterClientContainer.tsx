"use client";

import { NewsletterView, NewsletterForm } from "./NewsletterView";
import { useNewsletterSubscribe } from "./hooks";

export function NewsletterClientContainer() {
  const {
    email,
    isSubscribed,
    isLoading,
    isInitialLoading,
    errorMessage,
    handleEmailChange,
    handleSubmit,
  } = useNewsletterSubscribe();

  return (
    <NewsletterView
      isSubscribed={isSubscribed}
      isInitialLoading={isInitialLoading}
      errorMessage={errorMessage}
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
          errorMessage={errorMessage}
          onEmailChange={handleEmailChange}
          onSubmit={handleSubmit}
        />
      )}
    </NewsletterView>
  );
}
