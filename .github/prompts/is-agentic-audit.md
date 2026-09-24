Improve how ready https://compagnie-rouge-cardinal.fr is for agents.

Current Is Agentic score: 59/100 (Is Agentic readiness model based on Ora audit evidence).

Implement the following fixes in priority order (failures first, then warnings):

1. Agent crawler reachability (Essential, Failed)
Evidence: Some AI crawlers are blocked - ChatGPT-User: unknown, ClaudeBot: unknown, Google-Extended: reachable, ora-agent: unknown, DeepSeekBot: reachable
Recommended fix: Verify that major agent User-Agents can reach the homepage. If your WAF or bot rules block them, remove or narrow the blocking rule. Add an allow rule only when your security setup denies them by default.
Current result: Failed.

2. Agent-friendly 404s (Essential, Partial)
Evidence: Nonexistent paths return a real HTTP 404. For full credit, include a short markdown body (site map links, where to look next) so agents can recover.
Recommended fix: Return a real HTTP 404 (or 410) status for nonexistent paths - never a 200 with your app shell, which makes agents believe every path exists. For full credit, give the 404 response a short markdown body pointing agents at your sitemap, llms.txt, or docs index. Verify with `curl -s -o /dev/null -w "%{http_code}" https://yourdomain.com/some-path-that-does-not-exist` - it must print 404.
Current result: Partial (50%).

3. Content without JavaScript (Essential, Partial)
Evidence: 2650 chars with H1, but heading hierarchy skips H2 to H4; 4.3% content ratio is below the 5% target
Recommended fix: Serve at least 500 characters of meaningful homepage content in raw HTML. Add a clear H1, keep deeper heading levels sequential, and remove excessive non-content markup.
Current result: Partial (67%).

4. Markdown content negotiation (acceptmarkdown.com) (Essential, Failed)
Evidence: Not acceptmarkdown.com compliant: Accept: text/markdown returned text/html; charset=utf-8; Vary header missing Accept (got "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch")
Recommended fix: On the responses that serve text/markdown via Accept negotiation, add Accept to the Vary header (Vary: Accept, Accept-Encoding). Without it, CDNs can serve the cached HTML variant to an agent asking for markdown (or vice versa), depending on which variant landed in cache first.
Current result: Failed.

5. JSON-LD structured data (Recommended, Failed)
Evidence: No JSON-LD structured data found on homepage
Recommended fix: Add JSON-LD structured data to your homepage using the identity type that matches your site - SoftwareApplication for products, Organization or LocalBusiness for companies, Person for personal sites, Article for blogs - with name, description, url, and type-appropriate fields (offers, sameAs, author) so AI can parse your identity programmatically.
Current result: Failed.

Requirements:

- Inspect the existing codebase before changing files.
- Follow each published protocol or file format exactly.
- Preserve existing product behavior and visual design.
- Add or update tests for every behavior you change.
- Verify every public endpoint and machine-readable file after implementation.
- Finish with a concise change summary, verification results, and any remaining recommendations that require product decisions or credentials.
