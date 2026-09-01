import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";

import InvitationEmail from "@/emails/invitation-email";

const INVITATION_URL = "https://example.com/invite/abc123";

let html: string;

beforeAll(() => {
    // @react-email components expect React on the global scope (jsx runtime differences)
    globalThis.React = React as unknown as typeof globalThis.React;

    html = renderToStaticMarkup(
        <InvitationEmail
            email="test@example.com"
            role="admin"
            displayName="Test User"
            invitationUrl={INVITATION_URL}
        />
    );
});

describe("InvitationEmail", () => {
    it("renders non-empty markup", () => {
        expect(html.length).toBeGreaterThan(0);
    });

    it("includes the CTA text, invitation URL and recipient email", () => {
        expect(html).toContain("Activer mon compte");
        // codeql[js/incomplete-url-substring-sanitization] - Test assertion, not a security check.
        expect(html).toContain(INVITATION_URL);
        expect(html).toContain("test@example.com");
    });

    it("inlines the CTA button colors (required by email clients)", () => {
        const ctaStyle = html
            .toLowerCase()
            .match(/<a[^>]+style="([^"]*background-color[^"]*)"/)?.[1];

        expect(ctaStyle).toBeDefined();
        expect(ctaStyle).toContain("background-color:#4f46e5");
        expect(ctaStyle).toMatch(/(^|;)color:#[0-9a-f]{3,6}/);
    });

    it("converts Tailwind classes to inline styles", () => {
        expect(html).toContain("style=");
        expect(html).toContain("padding:");
        expect(html).not.toContain("class=");
    });

    it("displays the French label of the invited role", () => {
        expect(html).toContain("Administrateur");
    });
});
