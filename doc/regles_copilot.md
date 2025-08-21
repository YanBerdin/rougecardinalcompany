# graph TD

```mermaid
    A[.github/copilot] --> B[Permanentes `alwaysApply: true`]
    A --> C[Contextuelles `alwaysApply: false`]

    %% Permanentes
    B --> B1[0-clean-architecture.md]
    B --> B2[0-feature-based-architecture.md]
    B --> B3[1-clean-code-frontend.md]
    B --> B4[1-clean-code.md]
    B --> B5[1-naming-conventions.md]
    B --> B6[2-typescript-naming-conventions.md]
    B --> B7[2-typescript.md]
    B --> B8[3-tailwind@4.1.md]
    B --> B9[Postgres_SQL_Style_Guide_Instructions.md]
    B --> B10[Project_Architecture_Blueprint.md]
    %% Contextuelles
    C --> C1[4-package-installation.md]
    C --> C2[Bootstrap_Next.js_app_with_Supabase_Auth.md]
    C --> C3[Create_RLS_policies_Instructions.md]
    C --> C4[Create_migration.md]
    C --> C5[Database_Create_functions_Instructions.md]
    C --> C6[Declarative_Database_Schema_Instructions.md]
    C --> C7[edge-functions.md]
    C --> C8[nextjs-supabase-auth.md]
