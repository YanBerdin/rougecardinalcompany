"use client";

import { ContactPageView } from './ContactPageView';
import { useContact } from './contact-hooks';

export function ContactPageContainer() {
    const {
        isSubmitted,
        isLoading,
        newsletterEmail,
        isNewsletterSubscribed,
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
            isNewsletterSubscribed={isNewsletterSubscribed}
            newsletterEmail={newsletterEmail}
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
