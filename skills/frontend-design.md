# Frontend Design & Visual Excellence

Standard for building high-fidelity, premium, and accessible web interfaces. **WOW the user at first glance.**

## 1. Visual Hierarchy & Typography
- **Contrast**: Use weight (font-bold) and color (slate-900 vs slate-500) to define hierarchy.
- **Scale**: Use a consistent spacing scale (Tailwind's 4px/8px based system).
- **Line Height**: Ensure `leading-relaxed` for body text and `tracking-tight` for large headings.

## 2. The Premium Feel (The "Antigravity" Standard)
- **Glassmorphism**: Use `backdrop-blur-md` and `bg-white/70` for overlays and drawers.
- **Layered Shadows**: Avoid harsh shadows. Use multi-layered soft shadows (`shadow-sm`, `shadow-xl`) to create depth.
- **Subtle Gradients**: Use 2-stop gradients for primary buttons and active states (e.g., `bg-gradient-to-br from-brand-blue to-blue-600`).

## 3. Interaction & Animation
- **Micro-interactions**: Every clickable element MUST have a hover state and active state.
- **Transitions**: Use `transition-all duration-300` for smooth state changes.
- **Loading States**: Never show a blank screen. Use skeleton loaders or spinning icons.

## 4. Layout & Responsibility
- **Mobile-First**: Design for 320px width first. Use `md:` and `lg:` prefixes for scaling up.
- **Padding Consistency**: All main sections should use `p-4 md:p-8`.
- **Side Drawers**: Use the right-side slide-over pattern for all entity management (Add/Edit forms).

## 5. Accessibility (A11y)
- **Semantic HTML**: Use `<header>`, `<main>`, `<footer>`, `<section>`, `<nav>`.
- **Keyboard Nav**: Ensure all interactive elements are focusable (`focus-visible:ring-2`).
- **Alt Text**: Every image MUST have descriptive alt text.

## 6. Visual Quality Gate
- Before submitting UI code, verify:
    - [ ] Interface feels "premium" and "modern".
    - [ ] Padding and margins are consistent.
    - [ ] Hover states are implemented.
    - [ ] Responsive behavior is smooth across all breakpoints.
