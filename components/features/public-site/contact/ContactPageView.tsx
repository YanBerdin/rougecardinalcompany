"use client";

import { useState, useCallback } from "react";
import { ContactForm } from "./ContactForm";
import { ContactSuccessView } from "./ContactSuccessView";
import { ContactInfoSidebar } from "./ContactInfoSidebar";

interface ContactPageViewProps {
  showNewsletter?: boolean;
}

export function ContactPageView({
  showNewsletter = true,
}: ContactPageViewProps): React.JSX.Element {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSuccess = useCallback((): void => {
    setIsSubmitted(true);
  }, []);

  const handleReset = useCallback((): void => {
    setIsSubmitted(false);
  }, []);

  if (isSubmitted) {
    return <ContactSuccessView onReset={handleReset} />;
  }

  return (
    <div className="max-sm:pt-12 pt-16">
      <section className="max-sm:py-10 py-16 hero-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl text-white font-bold mb-6 animate-fade-in-up">
            Contact
          </h1>
          <p
            className="text-md md:text-2xl text-white/80 opacity-90 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Échangeons autour de nos projets
          </p>
        </div>
      </section>

      <div className="max-sm:py-12 py-24 bg-chart-7/50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <ContactForm onSuccess={handleSuccess} />
            </div>
            <ContactInfoSidebar showNewsletter={showNewsletter} />
          </div>
        </div>
      </div>
    </div>
  );
}
