"use client";

import { ContactPageView } from './ContactPageView';
import { useContact } from './contact-hooks';

export function ContactPageContainer() {
    const {
        isSubmitted,
        isLoading,
        isInitialLoading,
        newsletterEmail,
        isNewsletterSubscribed,
        newsletterError,
        formData,
        contactReasons,
        handleSubmit,
        handleNewsletterSubmit,
        handleInputChange,
        handleNewsletterEmailChange,
        resetForm
    } = useContact();

    return (
        <ContactPageView
            isSubmitted={isSubmitted}
            isLoading={isLoading}
            isInitialLoading={isInitialLoading}
            isNewsletterSubscribed={isNewsletterSubscribed}
            newsletterEmail={newsletterEmail}
            newsletterError={newsletterError}
            formData={formData}
            contactReasons={contactReasons}
            onFormSubmit={handleSubmit}
            onNewsletterSubmit={handleNewsletterSubmit}
            onResetForm={resetForm}
            onInputChange={handleInputChange}
            onNewsletterEmailChange={handleNewsletterEmailChange}
        />
    );
}
