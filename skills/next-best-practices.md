# Next.js 15 Best Practices

Apply these strict rules when writing or reviewing Next.js code. **NO EXCEPTIONS.**

## 1. File Conventions & Routing
- **Strict Route Segments**: Use `(groups)` for organization without affecting URL structure.
- **Middleware**: Use only for cross-cutting concerns (auth, redirect, logging). Do NOT put heavy logic here.
- **Static vs Dynamic**: Default to static rendering where possible. Use `force-dynamic` only when necessary.

## 2. RSC & Client Boundaries (CRITICAL)
- **Default to Server Components (RSC)**: Every component is an RSC unless it uses:
    - Interactivity (hooks like `useState`, `useEffect`)
    - Browser APIs (`window`, `localStorage`)
    - Event listeners (`onClick`, `onChange`)
- **Keep Client Components at the Leaves**: Push interactivity as far down the tree as possible to maximize server rendering.
- **Serialization**: Props passed from RSC to Client Components MUST be serializable.

## 3. Data Fetching & Mutations
- **Server Actions**: Use for all data mutations (CREATE, UPDATE, DELETE).
    - Always call `await requireAuth()` or `await requireAdmin()` at the top.
    - Always validate input with **Zod**.
    - Always use `revalidatePath()` or `revalidateTag()` after successful mutations.
- **Fetching**: Fetch data directly in Server Components using `await prisma...`. Do not use `useEffect` for initial data load.
- **Data Waterfalls**: Avoid sequential awaits where parallel fetching is possible (`Promise.all`).

## 4. Performance & Optimization
- **Images**: Always use `next/image`. Define `width`/`height` or use `fill`. Set `priority` for LCP images.
- **Fonts**: Use `next/font/google`. Avoid external CSS imports for fonts.
- **Caching**: Use `unstable_cache` for expensive DB queries or external API calls.

## 5. Error Handling
- **Special Files**: Implement `error.tsx` for route-level error boundaries and `not-found.tsx` for 404s.
- **Type Safety**: Use `zod` for parsing unknown API responses or external data.

## 6. Execution Quality Gate
- Before submitting code, verify:
    - [ ] No `use client` where not needed.
    - [ ] All sensitive logic is in a Server Action or RSC.
    - [ ] Proper error boundaries are in place.
    - [ ] Types are strict (no `any`).
