---
applyTo: "**"
description: Guidelines for writing Supabase database functions
---

# Database: Create functions

You're a Supabase Postgres expert in writing database functions. Generate **high-quality PostgreSQL functions** that adhere to the following best practices:

## General Guidelines

### 1. **Default to `SECURITY INVOKER`:**

- Functions should run with the permissions of the user invoking the function, ensuring safer access control.
- Use `SECURITY DEFINER` only when explicitly required and **MUST** include a detailed security header explaining the rationale (see SECURITY DEFINER Template below).

### 2. **Set the `search_path` Configuration Parameter:**

- Always set `search_path` to an empty string (`set search_path = '';`).
- This avoids unexpected behavior and security risks caused by resolving object references in untrusted or unintended schemas.
- Use fully qualified names (e.g., `schema_name.table_name`) for all database objects referenced within the function.

### 3. **Adhere to SQL Standards and Validation:**

- Ensure all queries within the function are valid PostgreSQL SQL queries and compatible with the specified context (ie. Supabase).

## Best Practices

### 1. **Minimize Side Effects:**

- Prefer functions that return results over those that modify data unless they serve a specific purpose (e.g., triggers).

### 2. **Use Explicit Typing:**

- Clearly specify input and output types, avoiding ambiguous or loosely typed parameters.

### 3. **Default to Immutable or Stable Functions:**

- Where possible, declare functions as `IMMUTABLE` or `STABLE` to allow better optimization by PostgreSQL. Use `VOLATILE` only if the function modifies data or has side effects.

### 4. **Triggers (if Applicable):**

- If the function is used as a trigger, include a valid `CREATE TRIGGER` statement that attaches the function to the desired table and event (e.g., `BEFORE INSERT`).

## Example Templates

### Simple Function with `SECURITY INVOKER`

```sql
create or replace function my_schema.hello_world()
returns text
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return 'hello world';
end;
$$;
```

### Function with Parameters and Fully Qualified Object Names

```sql
create or replace function public.calculate_total_price(order_id bigint)
returns numeric
language plpgsql
security invoker
set search_path = ''
as $$
declare
  total numeric;
begin
  select sum(price * quantity)
  into total
  from public.order_items
  where order_id = calculate_total_price.order_id;

  return total;
end;
$$;
```

### Function as a Trigger

```sql
create or replace function my_schema.update_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Update the "updated_at" column on row modification
  new.updated_at := now();
  return new;
end;
$$;

create trigger update_updated_at_trigger
before update on my_schema.my_table
for each row
execute function my_schema.update_updated_at();
```

### Function with Error Handling

```sql
create or replace function my_schema.safe_divide(numerator numeric, denominator numeric)
returns numeric
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if denominator = 0 then
    raise exception 'Division by zero is not allowed';
  end if;

  return numerator / denominator;
end;
$$;
```

### Immutable Function for Better Optimization

```sql
create or replace function my_schema.full_name(first_name text, last_name text)
returns text
language sql
security invoker
set search_path = ''
immutable
as $$
  select first_name || ' ' || last_name;
$$;
```

## SECURITY DEFINER Requirements

**CRITICAL**: `SECURITY DEFINER` functions run with the privileges of the function creator (typically superuser). This is a powerful feature that must be used with extreme caution.

### When to Use SECURITY DEFINER

- Trigger functions that need to modify protected tables (e.g., auth.users → profiles sync)
- Functions that must bypass RLS policies for specific administrative tasks
- Helper functions that need reliable access to system tables (e.g., auth.uid())
- Health check functions that must work for anon users

### Mandatory Security Header Template

**ALL functions using `SECURITY DEFINER` MUST include this header:**

```sql
/*
 * Security Model: SECURITY DEFINER
 * 
 * Rationale:
 *   1. [Explain why SECURITY DEFINER is necessary]
 *   2. [Explain what elevated privileges are needed]
 *   3. [Explain why SECURITY INVOKER is insufficient]
 *   4. [Explain the legitimate use case]
 * 
 * Risks Evaluated:
 *   - Authorization: [How is access controlled? Is there an explicit auth check?]
 *   - Input validation: [How are inputs validated? SQL injection risk?]
 *   - Privilege escalation: [What operations are allowed? Any arbitrary code execution?]
 *   - Concurrency: [Any race conditions? Advisory locks needed?]
 *   - Data integrity: [Transaction handling? Rollback on error?]
 * 
 * Validation:
 *   - [Describe testing performed]
 *   - [Describe authorization tests (admin vs non-admin)]
 *   - [Describe edge cases tested]
 *   - [Describe concurrent access tests if applicable]
 * 
 * Grant Policy: (if function has GRANT statements)
 *   - [Explain who can execute this function and why]
 *   - [Explain any restrictions (e.g., not granted to anon)]
 */
create or replace function public.my_secure_function()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Implementation
end;
$$;
```

### SECURITY DEFINER Example (Complete)

```sql
-- Example: Admin-only batch update function
/*
 * Security Model: SECURITY DEFINER
 * 
 * Rationale:
 *   1. Performs atomic batch updates across multiple rows
 *   2. Must bypass RLS policies to update all matching rows efficiently
 *   3. Uses advisory locking to prevent concurrent update conflicts
 *   4. Legitimate use case: Admin dashboard bulk operations
 * 
 * Risks Evaluated:
 *   - Authorization: Explicit is_admin() check enforces admin-only access (defense-in-depth)
 *   - Input validation: Validates input array structure and rejects invalid data
 *   - SQL injection: Uses parameterized queries only, no dynamic SQL concatenation
 *   - Concurrency: Advisory lock prevents race conditions
 *   - Data integrity: Single transaction ensures all-or-nothing updates
 * 
 * Validation:
 *   - Tested with admin user: updates succeed
 *   - Tested with non-admin user: authorization denied
 *   - Tested with invalid inputs: proper error messages
 *   - Tested concurrent updates: advisory lock prevents conflicts
 * 
 * Grant Policy:
 *   - EXECUTE granted to authenticated role only (not anon)
 *   - Requires explicit admin check inside function (defense-in-depth)
 *   - Manual review required before granting to additional roles
 */
create or replace function public.batch_update_items(items jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  item_record record;
begin
  -- Authorization check (defense-in-depth)
  if not (select public.is_admin()) then
    raise exception 'permission denied: admin role required';
  end if;

  -- Advisory lock to prevent concurrent updates
  perform pg_advisory_xact_lock(hashtext('batch_update_items'));

  -- Input validation
  if jsonb_typeof(items) is distinct from 'array' then
    raise exception 'items must be a json array';
  end if;

  -- Process updates
  for item_record in select * from jsonb_to_recordset(items) as x(id int, value text)
  loop
    update public.my_table 
    set value = item_record.value 
    where id = item_record.id;
  end loop;
end;
$$;

-- Grant execute to authenticated users only (admin check happens inside function)
grant execute on function public.batch_update_items(jsonb) to authenticated;
```

### Security Review Checklist

Before using `SECURITY DEFINER`, verify:

- [ ] **Rationale documented** in header (why DEFINER is needed)
- [ ] **Risks evaluated** in header (authorization, injection, escalation)
- [ ] **Validation described** in header (testing performed)
- [ ] **Authorization check** implemented (e.g., `is_admin()` call)
- [ ] **Input validation** implemented (reject invalid/malicious inputs)
- [ ] **SQL injection prevented** (no string concatenation, use parameters)
- [ ] **search_path set** to empty string (`set search_path = ''`)
- [ ] **Fully qualified names** used (e.g., `public.table_name`)
- [ ] **Grant policy documented** (who can execute, why)
- [ ] **Comment added** with summary of security model
