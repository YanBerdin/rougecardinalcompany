"use client";

import { useState, useCallback } from "react";
import { ContactForm } from "./ContactForm";
import { ContactSuccessView } from "./ContactSuccessView";

interface ContactPageViewProps {
  sidebar: React.ReactNode;
}

export function ContactPageView({
  sidebar,
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
      <section className="py-8 md:py-16 hero-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-7xl text-white font-semibold leading-none tracking-tight animate-fade-in-up">
            En aparté
          </h1>
        </div>
      </section>

      <div className="max-sm:py-16 py-24 bg-chart-7">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <ContactForm onSuccess={handleSuccess} />
            </div>
            {sidebar}
          </div>
        </div>
      </div>
    </div>
  );
}
