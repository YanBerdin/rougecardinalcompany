---
name: security-headers-audit
description: "Use when reviewing HTTP security headers, checking a Content-Security-Policy, auditing CORS or HSTS configuration, evaluating X-Frame-Options or Permissions-Policy, inspecting header middleware, or hardening a web application's response headers."
---

# Security Headers Audit

This skill performs static code analysis for HTTP security header misconfigurations across Express/Helmet.js, Nginx, Apache, Next.js, Flask, Django, and Spring Boot projects. HTTP response headers are the first line of defence against a wide class of client-side attacks — clickjacking, MIME-sniffing, cross-site scripting amplification, cross-origin data leakage, and protocol downgrade attacks. A single missing or misconfigured header can expose users to attacks that a compliant browser would otherwise block. This skill audits 10+ header-level controls, maps each finding to CWE and OWASP Top 10:2021 identifiers, and produces UNSAFE/SAFE code pairs across multiple frameworks so developers can apply fixes immediately.

## When to Use

- When the user asks to "audit security headers", "check HTTP headers", "review header config", or "harden web headers"
- When the user mentions "CSP", "Content-Security-Policy", "unsafe-inline", "unsafe-eval", or "CSP report-only"
- When the user asks about "CORS", "Access-Control-Allow-Origin", or "cross-origin policy"
- When the user asks about "HSTS", "Strict-Transport-Security", "HTTPS enforcement", or "preload"
- When the user asks about "X-Frame-Options", "clickjacking protection", or "frame-ancestors"
- When the user asks about "X-Content-Type-Options", "MIME sniffing", or "nosniff"
- When the user asks about "Referrer-Policy", "Permissions-Policy", or "Feature-Policy"
- When reviewing Express middleware, Nginx server blocks, Apache VirtualHost configs, Flask response objects, or Spring Boot security config
- When preparing a web application for a security audit, penetration test, or compliance review (PCI-DSS, HIPAA, FedRAMP)
- When a pull request modifies server configuration, middleware stacks, or HTTP response handling

## When NOT to Use

- When the user wants runtime testing of live server responses (use a DAST tool such as `dast-nuclei`, OWASP ZAP, or `ffuf-web-fuzzing`)
- When the issue is application logic — authentication bypasses, SQL injection, or broken access control — rather than header configuration
- When the user wants a full vulnerability scan including code-level SAST (use `bandit-sast` or `security-review`)
- When the `owasp-security` skill already covers the request at a broader OWASP level
- When the user asks about **mobile security, certificate pinning, or mobile app issues** — you **MUST** decline and recommend `mobile-security`
- When the user asks about **SQL injection, XSS, or input validation** in application code — you **MUST** decline and recommend `security-review` or `bandit-sast`

## Prerequisites

### Tool Installed (Preferred)

No external tool required. This is a pure analysis skill.

All 10+ checks are performed through pattern matching and code inspection of server configuration files, middleware definitions, and application code — no CLI tool needs to be installed, configured, or invoked. The skill works offline and requires no API keys.

### Tool Not Installed (Fallback)

This skill is always available as a pure analysis skill. There is no fallback mode because there is no external tool dependency. All checks run directly through code review and pattern analysis.

## Workflow

1. **Detect server framework** — Inspect project files to determine which frameworks set HTTP headers:
   - `package.json` containing `helmet`, `cors`, `express` → Express/Helmet.js
   - `nginx.conf` or `sites-available/` directory → Nginx
   - `.htaccess` or `httpd.conf` or `apache2.conf` → Apache
   - `next.config.js` or `next.config.ts` → Next.js
   - `requirements.txt` containing `Flask` or `flask-talisman` → Flask
   - `requirements.txt` containing `Django` or `django-csp` → Django
   - `pom.xml` containing `spring-boot` or `spring-security` → Spring Boot
2. **Identify header-relevant files** — Locate the files most likely to contain header configuration:
   - Express: `app.js`, `server.js`, `middleware/`, any file calling `app.use()`
   - Nginx: `nginx.conf`, `conf.d/*.conf`, `sites-enabled/*`
   - Apache: `httpd.conf`, `apache2.conf`, `.htaccess`, `VirtualHost` blocks
   - Next.js: `next.config.js`, `middleware.ts`, API route handlers
   - Flask: `app.py`, `__init__.py`, any `@app.after_request` hook
   - Django: `settings.py`, `middleware.py`, `MIDDLEWARE` list
   - Spring Boot: `SecurityConfig.java`, `WebMvcConfigurer` implementations
3. **Run all 10+ security header checks** (see Checks section) against each identified file.
4. **For each finding:**
   a. Determine severity (Critical / High / Medium / Low) using the Reference Tables
   b. Map to the relevant CWE identifier
   c. Map to the relevant OWASP Top 10:2021 category
   d. Record file path and approximate line number or config block
   e. Document the UNSAFE configuration observed and the corresponding SAFE fix
   f. Draft a remediation recommendation with framework-specific code
5. **Deduplicate and sort** findings by severity: Critical > High > Medium > Low.
6. **Generate the findings report** using the Findings Format below.
7. **Summarize** — State total findings, breakdown by severity, and top 3 remediation priorities.

## Checks

---

### Check 1: Missing or Misconfigured Content-Security-Policy (CSP)

**CWE-693** (Protection Mechanism Failure) | **A05:2021** - Security Misconfiguration | Severity: **High**

**WHY:** A Content-Security-Policy header instructs the browser to only load resources from trusted origins, blocking inline script injection, data-URI attacks, and third-party resource hijacking. Without CSP, a successful XSS attack has unrestricted access. Directives such as `unsafe-inline` and `unsafe-eval` negate the policy's XSS protection entirely, and wildcard sources (`*`) allow an attacker to load resources from any domain they control.

**UNSAFE:**

```javascript
// Express — no CSP header set at all
const express = require('express');
const app = express();
// No helmet() or manual Content-Security-Policy — CSP missing entirely
app.get('/', (req, res) => res.send('<html>...</html>'));
```

```javascript
// Express/Helmet — CSP disabled or using unsafe directives
const helmet = require('helmet');
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'", '*'],          // wildcard allows any origin
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],  // XSS protection nullified
    styleSrc: ["'self'", "'unsafe-inline'"],
  }
}));
```

```nginx
# Nginx — no CSP header in server block
server {
    listen 443 ssl;
    server_name example.com;
    # Missing: add_header Content-Security-Policy "...";
}
```

```python
# Flask — no CSP header on responses
@app.route('/')
def index():
    return render_template('index.html')
    # No Content-Security-Policy header added
```

**SAFE:**

```javascript
// Express/Helmet — strict CSP with nonce-based inline script allowance
const helmet = require('helmet');
const crypto = require('crypto');

app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('hex');
  next();
});

app.use((req, res, next) => {
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https://cdn.example.com'],
      connectSrc: ["'self'", 'https://api.example.com'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })(req, res, next);
});
```

```nginx
# Nginx — strict CSP header
server {
    listen 443 ssl;
    server_name example.com;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; upgrade-insecure-requests;" always;
}
```

---

### Check 2: Permissive CORS Policy (Access-Control-Allow-Origin: *)

**CWE-942** (Permissive Cross-Origin Resource Sharing Policy) | **A05:2021** - Security Misconfiguration | Severity: **High**

**WHY:** Setting `Access-Control-Allow-Origin: *` allows any website on the internet to make cross-origin requests to the API and read the response. For APIs serving authenticated data, this combined with `Access-Control-Allow-Credentials: true` permits session-riding attacks where a malicious page reads sensitive user data. Even without credentials, wildcard CORS on internal APIs exposes business data to any third-party site.

**UNSAFE:**

```javascript
// Express — wildcard CORS open to all origins
const cors = require('cors');
app.use(cors()); // defaults to origin: '*'

// Or explicitly:
app.use(cors({ origin: '*' }));
```

```javascript
// Express — manual wildcard header
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});
```

```nginx
# Nginx — wildcard CORS
location /api/ {
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE';
}
```

```python
# Flask — wildcard CORS via flask-cors
from flask_cors import CORS
CORS(app)  # defaults to origins='*'
```

**SAFE:**

```javascript
// Express — allowlist-based CORS
const cors = require('cors');
const allowedOrigins = [
  'https://app.example.com',
  'https://admin.example.com',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,  // only if needed; never combine with wildcard origin
}));
```

```nginx
# Nginx — origin allowlist via map
map $http_origin $cors_origin {
    default "";
    "https://app.example.com" "$http_origin";
    "https://admin.example.com" "$http_origin";
}
server {
    location /api/ {
        add_header 'Access-Control-Allow-Origin' $cors_origin always;
    }
}
```

```python
# Flask — explicit origin allowlist
from flask_cors import CORS
CORS(app, origins=['https://app.example.com', 'https://admin.example.com'])
```

---

### Check 3: Missing or Weak HTTP Strict-Transport-Security (HSTS)

**CWE-319** (Cleartext Transmission of Sensitive Information) | **A02:2021** - Cryptographic Failures | Severity: **High**

**WHY:** Without HSTS, a browser that first visits a site over HTTP is vulnerable to SSL-stripping attacks. An on-path attacker intercepts the HTTP request before it can redirect to HTTPS, silently downgrading the session. HSTS instructs browsers to always connect over HTTPS for a specified duration. A `max-age` under 1 year is insufficient for meaningful protection; missing `includeSubDomains` leaves subdomains vulnerable; missing `preload` means first-visit HTTPS is not enforced by browser preload lists.

**UNSAFE:**

```javascript
// Express — HSTS missing entirely
const helmet = require('helmet');
app.use(helmet({
  hsts: false,  // HSTS explicitly disabled
}));
```

```javascript
// Express — HSTS with too-short max-age (1 day = trivially bypassable)
app.use(helmet.hsts({
  maxAge: 86400,  // 1 day — far too short; attacker can wait for expiry
  // Missing: includeSubDomains, preload
}));
```

```nginx
# Nginx — missing HSTS header entirely
server {
    listen 443 ssl;
    # No Strict-Transport-Security header
}
```

```python
# Flask — no HSTS enforcement
@app.route('/login', methods=['POST'])
def login():
    # No HSTS header — HTTP downgrade possible
    return jsonify({'token': generate_token()})
```

**SAFE:**

```javascript
// Express/Helmet — HSTS with 2-year max-age, includeSubDomains, preload
const helmet = require('helmet');
app.use(helmet.hsts({
  maxAge: 63072000,        // 2 years in seconds
  includeSubDomains: true,
  preload: true,
}));
```

```nginx
# Nginx — full HSTS header
server {
    listen 443 ssl;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
}
```

```python
# Flask — HSTS via after_request hook or flask-talisman
from flask_talisman import Talisman
Talisman(app,
    strict_transport_security=True,
    strict_transport_security_max_age=63072000,
    strict_transport_security_include_subdomains=True,
    strict_transport_security_preload=True,
)
```

---

### Check 4: Missing X-Content-Type-Options

**CWE-16** (Configuration) | **A05:2021** - Security Misconfiguration | Severity: **Medium**

**WHY:** Without `X-Content-Type-Options: nosniff`, browsers perform MIME-type sniffing — inferring the content type from the response body rather than the declared `Content-Type`. An attacker who can upload a file (e.g., a JPEG with embedded JavaScript) can trick the browser into executing it as a script, bypassing CSP. The `nosniff` directive prevents this by forcing strict MIME-type enforcement.

**UNSAFE:**

```javascript
// Express — X-Content-Type-Options header absent
const express = require('express');
const app = express();
// No helmet() — X-Content-Type-Options not sent
app.use(express.static('public'));
```

```nginx
# Nginx — X-Content-Type-Options not set
server {
    listen 443 ssl;
    root /var/www/html;
    # Missing: add_header X-Content-Type-Options "nosniff";
}
```

**SAFE:**

```javascript
// Express/Helmet — nosniff enabled (default in helmet())
const helmet = require('helmet');
app.use(helmet()); // X-Content-Type-Options: nosniff included by default

// Or manually:
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});
```

```nginx
# Nginx — nosniff header
server {
    listen 443 ssl;
    add_header X-Content-Type-Options "nosniff" always;
}
```

```python
# Flask — explicit nosniff header
@app.after_request
def set_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    return response
```

---

### Check 5: Missing X-Frame-Options or Permissive CSP frame-ancestors

**CWE-1021** (Improper Restriction of Rendered UI Layers or Frames) | **A05:2021** - Security Misconfiguration | Severity: **Medium**

**WHY:** Without framing protection, an attacker can embed the target page in a hidden `<iframe>` on a malicious site and trick authenticated users into performing actions they did not intend (clickjacking). `X-Frame-Options: DENY` or `SAMEORIGIN` prevents this. The modern equivalent is CSP `frame-ancestors 'none'` or `'self'`, which offers more granular control. Both should be set for maximum browser compatibility.

**UNSAFE:**

```javascript
// Express — no frame protection
const helmet = require('helmet');
app.use(helmet({
  frameguard: false,  // Clickjacking protection disabled
  contentSecurityPolicy: false,
}));
```

```nginx
# Nginx — X-Frame-Options absent
server {
    listen 443 ssl;
    # No X-Frame-Options or frame-ancestors directive
}
```

```python
# Flask — no X-Frame-Options header
@app.after_request
def headers(response):
    # X-Frame-Options not set — clickjacking possible
    return response
```

**SAFE:**

```javascript
// Express/Helmet — deny all framing
const helmet = require('helmet');
app.use(helmet.frameguard({ action: 'deny' }));

// For CSP frame-ancestors (modern, preferred):
app.use(helmet.contentSecurityPolicy({
  directives: {
    frameAncestors: ["'none'"],
    // ... other directives
  }
}));
```

```nginx
# Nginx — X-Frame-Options + CSP frame-ancestors
server {
    listen 443 ssl;
    add_header X-Frame-Options "DENY" always;
    add_header Content-Security-Policy "frame-ancestors 'none';" always;
}
```

```python
# Flask — X-Frame-Options via after_request
@app.after_request
def set_security_headers(response):
    response.headers['X-Frame-Options'] = 'DENY'
    return response
```

---

### Check 6: Missing Referrer-Policy

**CWE-200** (Exposure of Sensitive Information to an Unauthorized Actor) | **A01:2021** - Broken Access Control | Severity: **Medium**

**WHY:** Without a `Referrer-Policy`, browsers send the full URL of the originating page in the `Referer` header when navigating to external sites. This can leak sensitive data embedded in URLs — session tokens, user IDs, search queries, reset tokens, or internal path structures — to third-party servers and analytics providers. A strict referrer policy limits what is transmitted.

**UNSAFE:**

```javascript
// Express — no Referrer-Policy header set
const express = require('express');
const app = express();
// No helmet() or manual Referrer-Policy — full URL leaked to third parties
app.get('/search', (req, res) => res.send(results));
```

```nginx
# Nginx — no Referrer-Policy
server {
    listen 443 ssl;
    # Missing: add_header Referrer-Policy "..."
}
```

```python
# Flask — no Referrer-Policy on sensitive endpoints
@app.route('/account/settings')
def settings():
    return render_template('settings.html')
    # Full URL with user ID will appear in Referer headers to any linked resource
```

**SAFE:**

```javascript
// Express/Helmet — strict referrer policy
const helmet = require('helmet');
app.use(helmet.referrerPolicy({
  policy: 'strict-origin-when-cross-origin',
}));
```

```nginx
# Nginx — strict referrer policy
server {
    listen 443 ssl;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

```python
# Flask — Referrer-Policy in after_request
@app.after_request
def set_security_headers(response):
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    return response
```

---

### Check 7: Overly Permissive Permissions-Policy (Feature-Policy)

**CWE-250** (Execution with Unnecessary Privileges) | **A01:2021** - Broken Access Control | Severity: **Low**

**WHY:** Without a `Permissions-Policy` header, the browser may grant third-party iframes or scripts access to sensitive browser APIs — camera, microphone, geolocation, payment, USB, Bluetooth, and screen capture. An injected third-party script (ad network, analytics, CDN) that becomes compromised could silently activate these features. Explicitly disabling features the application does not use follows the principle of least privilege at the browser layer.

**UNSAFE:**

```javascript
// Express — no Permissions-Policy header
// Third-party scripts can freely access camera, microphone, geolocation, etc.
const express = require('express');
const app = express();
// helmet() with default config does not set Permissions-Policy fully
```

```nginx
# Nginx — no Permissions-Policy header
server {
    listen 443 ssl;
    # Missing: add_header Permissions-Policy "..."
}
```

**SAFE:**

```javascript
// Express/Helmet — disable unused browser features
const helmet = require('helmet');
app.use(helmet.permittedCrossDomainPolicies());
// Manual Permissions-Policy for full control:
app.use((req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), fullscreen=(self)'
  );
  next();
});
```

```nginx
# Nginx — restrict browser feature access
server {
    listen 443 ssl;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=(), fullscreen=(self)" always;
}
```

```python
# Flask — Permissions-Policy via after_request
@app.after_request
def set_security_headers(response):
    response.headers['Permissions-Policy'] = (
        'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
    )
    return response
```

---

### Check 8: Missing Cache-Control on Sensitive Endpoints

**CWE-524** (Use of Cache Containing Sensitive Information) | **A04:2021** - Insecure Design | Severity: **Medium**

**WHY:** Browsers, proxies, and CDNs may cache HTTP responses that contain sensitive data — account pages, financial records, health information, authentication tokens, or personal data — and serve cached copies to subsequent users on shared devices or through shared proxies. Setting `Cache-Control: no-store, no-cache` on sensitive endpoints prevents this. Missing cache headers are especially dangerous on shared machines (libraries, kiosks) and in corporate environments with forward proxies.

**UNSAFE:**

```javascript
// Express — sensitive user data returned without cache headers
app.get('/api/user/profile', authenticate, (req, res) => {
  const profile = getUserProfile(req.user.id);
  res.json(profile);  // No Cache-Control — may be cached by browser or CDN
});
```

```nginx
# Nginx — no cache-control on API responses
location /api/ {
    proxy_pass http://backend;
    # Missing: add_header Cache-Control "no-store, no-cache";
}
```

```python
# Flask — sensitive data returned without cache headers
@app.route('/api/account')
@login_required
def account():
    data = get_account_data(current_user.id)
    return jsonify(data)  # No Cache-Control set — can be cached
```

**SAFE:**

```javascript
// Express — no-store for all authenticated API responses
app.use('/api/', authenticate, (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  next();
});
```

```nginx
# Nginx — cache prevention for authenticated API routes
location /api/ {
    proxy_pass http://backend;
    add_header Cache-Control "no-store, no-cache, must-revalidate, private" always;
    add_header Pragma "no-cache" always;
}
```

```python
# Flask — cache prevention via after_request for sensitive routes
@app.after_request
def prevent_caching_on_sensitive_routes(response):
    if request.path.startswith('/api/') or request.path.startswith('/account'):
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, private'
        response.headers['Pragma'] = 'no-cache'
    return response
```

---

### Check 9: Exposed Server / X-Powered-By Headers

**CWE-200** (Exposure of Sensitive Information to an Unauthorized Actor) | **A05:2021** - Security Misconfiguration | Severity: **Low**

**WHY:** The `Server` header (e.g., `nginx/1.18.0`) and `X-Powered-By` header (e.g., `Express`, `PHP/8.1.2`) reveal the server software name and version. This is reconnaissance information that helps attackers select targeted exploits for known CVEs in those exact versions. Version disclosure does not make an attack succeed — it reduces attacker effort by eliminating guesswork.

**UNSAFE:**

```javascript
// Express — X-Powered-By header enabled (default Express behaviour)
const express = require('express');
const app = express();
// Default: sends "X-Powered-By: Express" with every response
// Not calling app.disable('x-powered-by') or helmet()
```

```nginx
# Nginx — server version disclosed in Server header
server {
    listen 443 ssl;
    # Missing: server_tokens off;
    # Nginx sends: Server: nginx/1.18.0 (Ubuntu)
}
```

```python
# Flask — default Server header exposes Werkzeug version
# Flask/Werkzeug sends: Server: Werkzeug/2.3.0 Python/3.11.0
# No suppression configured
```

**SAFE:**

```javascript
// Express/Helmet — disable X-Powered-By
const helmet = require('helmet');
app.use(helmet()); // Removes X-Powered-By automatically
// Or explicitly:
app.disable('x-powered-by');
```

```nginx
# Nginx — suppress server version
server {
    listen 443 ssl;
    server_tokens off;  # Sends: Server: nginx (no version)
}
```

```python
# Flask — custom server header via after_request
@app.after_request
def suppress_server_header(response):
    response.headers['Server'] = 'webserver'
    return response
```

---

### Check 10: Missing Strict-Transport-Security on API Responses

**CWE-319** (Cleartext Transmission of Sensitive Information) | **A02:2021** - Cryptographic Failures | Severity: **Medium**

**WHY:** HSTS is often applied to the main application domain but omitted from API subdomains or microservice endpoints. An API that accepts requests over HTTP (even if it immediately redirects) or that lacks an HSTS header is vulnerable to SSL-stripping on the API path. API clients (mobile apps, server-to-server) that make the initial request unencrypted expose credentials, tokens, and data before the redirect occurs. Every endpoint that handles sensitive data must enforce HTTPS via HSTS regardless of whether it is user-facing.

**UNSAFE:**

```javascript
// Express — HSTS applied to HTML routes but missing on API router
const helmet = require('helmet');
app.use('/web', helmet()); // HSTS set for web routes

const apiRouter = express.Router();
// No helmet() or HSTS header on API router — API lacks HSTS
app.use('/api', apiRouter);
```

```nginx
# Nginx — HSTS on main vhost but missing on api subdomain config
server {
    server_name api.example.com;
    listen 443 ssl;
    # Missing: Strict-Transport-Security header on API server block
}
```

```python
# Flask — HSTS only on HTML blueprint, not on API blueprint
from flask import Blueprint
api_bp = Blueprint('api', __name__, url_prefix='/api')

# HSTS not enforced on api_bp responses — only on main app responses
@api_bp.after_request
def api_headers(response):
    response.headers['Content-Type'] = 'application/json'
    # No Strict-Transport-Security — API responses lack HSTS
    return response
```

**SAFE:**

```javascript
// Express — apply HSTS globally, including API routes
const helmet = require('helmet');
app.use(helmet.hsts({
  maxAge: 63072000,
  includeSubDomains: true,
  preload: true,
}));
// Applied before any router — covers all routes including /api/*
```

```nginx
# Nginx — HSTS on all server blocks including API subdomain
server {
    server_name api.example.com;
    listen 443 ssl;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
}
```

```python
# Flask — HSTS on all responses including API
from flask_talisman import Talisman
Talisman(app,
    strict_transport_security=True,
    strict_transport_security_max_age=63072000,
    strict_transport_security_include_subdomains=True,
)
# Applies to all blueprints and routes globally
```

---

### Check 11: Missing Cross-Origin-Opener-Policy (COOP) and Cross-Origin-Embedder-Policy (COEP)

**CWE-693** (Protection Mechanism Failure) | **A05:2021** - Security Misconfiguration | Severity: **Low**

**WHY:** Without `Cross-Origin-Opener-Policy: same-origin`, a cross-origin popup or window opened by an attacker can maintain a reference to the target's `window` object, enabling side-channel attacks (Spectre) or cross-window script injection. `Cross-Origin-Embedder-Policy: require-corp` combined with COOP enables `SharedArrayBuffer` isolation and prevents the browser from loading cross-origin resources that do not explicitly opt in — required for any application using advanced browser APIs. These headers together establish cross-origin isolation.

**UNSAFE:**

```javascript
// Express — no COOP or COEP headers
const express = require('express');
const app = express();
// Window reference leakage and Spectre side-channel mitigations absent
```

```nginx
# Nginx — missing COOP and COEP headers
server {
    listen 443 ssl;
    # Missing COOP and COEP cross-origin isolation headers
}
```

**SAFE:**

```javascript
// Express/Helmet — set COOP and COEP
const helmet = require('helmet');
app.use(helmet.crossOriginOpenerPolicy({ policy: 'same-origin' }));
app.use(helmet.crossOriginEmbedderPolicy({ policy: 'require-corp' }));
```

```nginx
# Nginx — cross-origin isolation headers
server {
    listen 443 ssl;
    add_header Cross-Origin-Opener-Policy "same-origin" always;
    add_header Cross-Origin-Embedder-Policy "require-corp" always;
    add_header Cross-Origin-Resource-Policy "same-origin" always;
}
```

```python
# Flask — COOP and COEP headers
@app.after_request
def set_cross_origin_headers(response):
    response.headers['Cross-Origin-Opener-Policy'] = 'same-origin'
    response.headers['Cross-Origin-Embedder-Policy'] = 'require-corp'
    return response
```

---

## Findings Format

> **MANDATORY FORMAT:** You **MUST** include Severity, CWE, and OWASP Top 10:2021 mapping on **every** finding. You **MUST** include UNSAFE and SAFE configuration pairs for each finding.

Each finding should include:

| Field | Description |
|-------|-------------|
| Severity | Critical / High / Medium / Low |
| CWE | CWE-XXX identifier |
| OWASP | A01-A10 category (OWASP Top 10:2021) |
| Location | file:line or file:block |
| Issue | Description of the misconfiguration |
| Remediation | How to fix it with framework-specific code |

### Example Finding

| Field | Value |
|-------|-------|
| Severity | High |
| CWE | CWE-942 |
| OWASP | A05:2021 - Security Misconfiguration |
| Location | src/app.js:12 |
| Issue | CORS configured with `origin: '*'` — all cross-origin requests permitted, including credentialed ones |
| Remediation | Replace wildcard with an explicit allowlist: `origin: ['https://app.example.com']`; never combine `origin: '*'` with `credentials: true` |

## Reference Tables

### Security Header to CWE/OWASP Mapping

| # | Header / Check | CWE | OWASP | Default Severity |
|---|---------------|-----|-------|------------------|
| 1 | Missing/weak CSP (`unsafe-inline`, `unsafe-eval`, wildcard) | CWE-693 | A05:2021 - Security Misconfiguration | High |
| 2 | Permissive CORS (`Access-Control-Allow-Origin: *`) | CWE-942 | A05:2021 - Security Misconfiguration | High |
| 3 | Missing HSTS (or too-short max-age, missing includeSubDomains/preload) | CWE-319 | A02:2021 - Cryptographic Failures | High |
| 4 | Missing X-Content-Type-Options | CWE-16 | A05:2021 - Security Misconfiguration | Medium |
| 5 | Missing X-Frame-Options or permissive CSP frame-ancestors | CWE-1021 | A05:2021 - Security Misconfiguration | Medium |
| 6 | Missing Referrer-Policy | CWE-200 | A01:2021 - Broken Access Control | Medium |
| 7 | Overly permissive Permissions-Policy | CWE-250 | A01:2021 - Broken Access Control | Low |
| 8 | Missing Cache-Control on sensitive endpoints | CWE-524 | A04:2021 - Insecure Design | Medium |
| 9 | Exposed Server / X-Powered-By header | CWE-200 | A05:2021 - Security Misconfiguration | Low |
| 10 | Missing HSTS on API responses | CWE-319 | A02:2021 - Cryptographic Failures | Medium |
| 11 | Missing COOP / COEP cross-origin isolation | CWE-693 | A05:2021 - Security Misconfiguration | Low |

### OWASP Top 10:2021 Quick Reference

| Category | Description | Related Checks |
|----------|-------------|----------------|
| A01:2021 | Broken Access Control | Checks 6, 7 |
| A02:2021 | Cryptographic Failures | Checks 3, 10 |
| A04:2021 | Insecure Design | Check 8 |
| A05:2021 | Security Misconfiguration | Checks 1, 2, 4, 5, 9, 11 |

### CWE Reference

| CWE ID | Name | MITRE URL |
|--------|------|-----------|
| CWE-16 | Configuration | https://cwe.mitre.org/data/definitions/16.html |
| CWE-200 | Exposure of Sensitive Information to an Unauthorized Actor | https://cwe.mitre.org/data/definitions/200.html |
| CWE-250 | Execution with Unnecessary Privileges | https://cwe.mitre.org/data/definitions/250.html |
| CWE-319 | Cleartext Transmission of Sensitive Information | https://cwe.mitre.org/data/definitions/319.html |
| CWE-524 | Use of Cache Containing Sensitive Information | https://cwe.mitre.org/data/definitions/524.html |
| CWE-693 | Protection Mechanism Failure | https://cwe.mitre.org/data/definitions/693.html |
| CWE-942 | Permissive Cross-Origin Resource Sharing Policy | https://cwe.mitre.org/data/definitions/942.html |
| CWE-1021 | Improper Restriction of Rendered UI Layers or Frames | https://cwe.mitre.org/data/definitions/1021.html |

## Example Usage

**User prompt:**
> "Run a security headers audit on this Express app"

**Expected output (abbreviated):**

```md
## Security Headers Audit Results

Scanned: src/app.js, src/middleware/cors.js, nginx.conf
Framework detected: Express.js (no Helmet.js detected)

### Findings (7 total: 0 Critical, 3 High, 3 Medium, 1 Low)

| # | Severity | CWE | OWASP | Location | Issue |
|---|----------|-----|-------|----------|-------|
| 1 | High | CWE-693 | A05 | src/app.js:8 | No Content-Security-Policy header set |
| 2 | High | CWE-942 | A05 | src/middleware/cors.js:4 | CORS origin set to '*' — all cross-origin requests permitted |
| 3 | High | CWE-319 | A02 | src/app.js:8 | No Strict-Transport-Security header set |
| 4 | Medium | CWE-16 | A05 | src/app.js:8 | X-Content-Type-Options header absent |
| 5 | Medium | CWE-1021 | A05 | src/app.js:8 | X-Frame-Options header absent — clickjacking risk |
| 6 | Medium | CWE-524 | A04 | src/routes/user.js:22 | GET /api/user/profile returns sensitive data with no Cache-Control |
| 7 | Low | CWE-200 | A05 | src/app.js:3 | X-Powered-By: Express header exposed (default Express behaviour) |

### Recommendations
1. Install and configure Helmet.js — a single `app.use(helmet())` call resolves Findings #3, #4, #5, #7 immediately
2. Replace `cors({ origin: '*' })` with an explicit origin allowlist to fix Finding #2
3. Add `app.use(helmet.contentSecurityPolicy({...}))` with a strict CSP policy to fix Finding #1
```
