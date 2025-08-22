# GitHub Copilot Instructions pour Rouge Cardinal Company

## Priority Guidelines

When generating code for this repository:

1. **Version Compatibility**: Always detect and respect the exact versions of languages, frameworks, and libraries used in this project
2. **Context Files**: Prioritize patterns and standards defined in the .github/copilot directory
3. **Codebase Patterns**: When context files don't provide specific guidance, scan the codebase for established patterns
4. **Architectural Consistency**: Maintain our Layered architectural style and established boundaries
5. **Code Quality**: Prioritize maintainability, performance, security, accessibility, and testability in all generated code

## Technology Version Detection

Before generating code, scan the codebase to identify:

1. **Language Versions**: 
   - TypeScript target: ES2017 (as specified in tsconfig.json)
   - React version: 19.0.0
   - Node.js environment: ^20 (specified in devDependencies)

2. **Framework Versions**:
   - Next.js: 15.4.5
   - Supabase: latest (from package.json)
   - Tailwind CSS: ^3.4.1
   - TypeScript: ^5

3. **Library Versions**:
   - Radix UI components: various versions (^1.x-^2.x)
   - Lucide React: ^0.511.0
   - Next Themes: ^0.4.6
   - ESLint: ^9
   - Never use APIs or features not available in the detected versions

## Context Files

Priority context directories to scan:

- `/app`: Next.js App Router structure
- `/components`: Reusable UI components
- `/lib/supabase`: Supabase integration code
- `/memory-bank`: Project documentation and context
- `/.github/copilot/`: Copilot-specific configuration and instruction files

Additional context available via MCP GitHub and MCP Supabase

## Codebase Scanning Instructions

When context files don't provide specific guidance:

1. Identify similar files to the one being modified or created
2. Analyze patterns for:
   - Naming conventions (camelCase for variables/functions, PascalCase for components)
   - Code organization (React hooks at the top, JSX at the bottom)
   - Error handling (try/catch with appropriate error handling)
   - Use of Server vs Client Components
   
3. Follow the most consistent patterns found in the codebase
4. When conflicting patterns exist, prioritize patterns in newer files or files with higher test coverage
5. Never introduce patterns not found in the existing codebase

## Code Quality Standards

### Maintainability
- Write self-documenting code with clear naming
- Use PascalCase for component names and files (e.g., `Hero.tsx`)
- Use camelCase for variables, functions, and instance methods
- Keep components focused on single responsibilities
- Organize hooks at the top of components
- Use React hooks appropriately (useState, useEffect, useCallback)
- Follow the same folder structure for new features

### Performance
- Use useCallback for event handlers in components
- Implement appropriate memoization using React.memo or useMemo
- Optimize images using Next.js Image component
- Apply loading states and skeletons for async operations
- Use efficient state management techniques
- Implement pagination or virtualization for large lists

### Security
- Validate all user inputs
- Use Supabase's built-in security features
- Never expose sensitive information in client-side code
- Follow secure authentication patterns as seen in auth components
- Implement proper security checks in API routes

### Accessibility
- Use semantic HTML elements (buttons for actions, anchors for navigation)
- Include proper ARIA attributes where necessary
- Ensure keyboard navigation support
- Maintain sufficient color contrast
- Provide text alternatives for images
- Respect user preferences (like reduced motion)

### Testability
- Write code that is easy to test
- Keep components small and focused
- Avoid complex side effects
- Allow for dependency injection where appropriate
- Use clear interfaces and props

## Documentation Requirements

- Follow JSDoc style comments for functions and components
- Document non-obvious behaviors
- Add inline comments for complex logic
- Use consistent format for parameter descriptions
- Include example usage for complex components or functions

## Testing Approach

### Unit Testing
- Focus on testing component behavior and functionality
- Use appropriate mocking for external dependencies
- Follow the testing patterns established in the codebase

## Technology-Specific Guidelines

### Next.js Guidelines
- Use App Router pattern with page.tsx and layout.tsx
- Properly differentiate between Server and Client Components
- Use "use client" directive only when necessary
- Leverage built-in Next.js features (Image, Link, etc.)
- Follow the metadata pattern for SEO
- Use dynamic imports for code splitting

### TypeScript Guidelines
- Use strict type checking
- Define interfaces for component props
- Use type inference where appropriate
- Avoid any type unless absolutely necessary
- Use proper type guards
- Use functional programming patterns with TypeScript features

### React Guidelines
- Use functional components with hooks
- Follow the hook rules (don't call hooks conditionally)
- Use controlled components for forms
- Implement proper error boundaries
- Use context API appropriately for global state
- Keep components pure when possible

### Supabase Guidelines
- Use the patterns established in lib/supabase
- Follow the Server Component pattern for data fetching
- Use Row Level Security (RLS) policies
- Apply proper error handling for database operations
- Use TypeScript types for database entities
- Validate data before sending to Supabase

### MCP GitHub Guidelines
- Use to directly access repository files, issues, pull requests, and discussions without manual copy-paste.
- Leverage MCP GitHub to retrieve information documented in `.github/copilot` and architecture files.
- Always review and validate retrieved data before generating code.

### MCP Supabase Guidelines
- Use to query the database, inspect the schema, or apply migrations directly from Copilot.
- Strictly respect Row Level Security (RLS) policies and server-side validations.
- Prefer secure, predefined queries over free-form SQL in prompts.

### Tailwind CSS Guidelines
- Use the established color palette and design tokens
- Follow the utility-first approach
- Use consistent spacing and sizing
- Apply responsive design patterns using breakpoints
- Use shadcn/ui component library styling conventions

## General Best Practices

- Follow naming conventions exactly as they appear in existing code
- Match code organization patterns from similar files
- Apply error handling consistent with existing patterns
- Match logging patterns from existing code
- Use the same approach to configuration as seen in the codebase
- Implement consistent loading states and error states

## Project-Specific Guidance

### Rouge Cardinal Company Website
This project is a website for a theater company with these key features:
- Public-facing website with information about shows and events
- Authentication for admin users
- Content management capabilities
- Press resources and media library

The project focuses on:
- Professional presentation of the company
- Easy access to show information
- Media resources for professionals
- Administrative capabilities

When implementing features, ensure they match the existing style and are aligned with these goals.
