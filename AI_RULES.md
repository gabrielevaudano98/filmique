# AI Development Rules for Filmique App

This document outlines the rules, conventions, and technology stack for the Filmique application. Adhering to these guidelines is crucial for maintaining code quality, consistency, and predictability.

## Tech Stack Overview

The application is built on a modern, lightweight tech stack. Here are the key technologies:

- **Framework**: React 18+
- **Build Tool**: Vite for fast development and optimized builds.
- **Language**: TypeScript for type safety and improved developer experience.
- **Styling**: Tailwind CSS for all UI styling, following a utility-first approach.
- **Icons**: `lucide-react` for a consistent and clean set of SVG icons.
- **State Management**: React Context API for global state and `useState`/`useReducer` for local state.
- **Routing**: A custom, state-based routing system managed within `AppContext` and `App.tsx`.
- **Linting**: ESLint with specific rules for React and TypeScript to enforce code quality.

## Development Rules & Conventions

### 1. File Structure

- **Views/Pages**: All main application views (e.g., `HomeView`, `ProfileView`) are located in `src/components/`.
- **Reusable Components**: All general-purpose, reusable components (e.g., `TopBar`, `RangeSelector`) are located in `src/components/`.
- **Global State**: All global context and providers are located in `src/context/`. The primary context is `AppContext.tsx`.
- **Custom Hooks**: Custom hooks should be placed in a `src/hooks/` directory.
- **Utilities**: General helper functions (like `debounce`) are located in `src/utils/`.
- **Assets**: Static assets like images and fonts should be placed in `src/assets/`.

### 2. Component Development

- **Component Library**: While the project currently uses custom components, for any new UI elements, **prioritize using `shadcn/ui` components**. If a suitable component does not exist, create a new, reusable component from scratch.
- **Responsiveness**: All components must be designed with a mobile-first approach and be fully responsive across various screen sizes.
- **File Granularity**: Create a new file for every component, no matter how small. Do not nest component definitions within other files.
- **Props**: Use TypeScript interfaces to define component props for strong type-checking.

### 3. Styling

- **Utility-First**: All styling **must** be done using Tailwind CSS utility classes.
- **No Custom CSS**: Avoid writing custom CSS in `.css` files. The `index.css` file is reserved for Tailwind directives, font imports, and base global styles only.
- **No Inline Styles**: Do not use the `style` attribute for styling. The only exception is for dynamic values that cannot be handled by Tailwind classes (e.g., calculating a width percentage in JavaScript).

### 4. State Management

- **Global State**: For state that needs to be shared across multiple views (e.g., `user`, `activeRoll`, `currentView`), use the existing React Context in `src/context/AppContext.tsx`.
- **Local State**: For state that is confined to a single component or its immediate children, use the `useState` or `useReducer` hooks. Do not clutter the global context with local state.

### 5. Icons

- **Icon Library**: Only use icons from the `lucide-react` package. This ensures visual consistency throughout the application.
- **Usage**: Import icons directly, e.g., `import { Camera } from 'lucide-react';`.

### 6. Code Style & Linting

- **Follow ESLint**: The project is configured with ESLint. All code must adhere to the defined linting rules.
- **TypeScript**: Leverage TypeScript features for robust code. Use specific types instead of `any`.
- **Simplicity**: Write simple, elegant, and readable code. Avoid over-engineering solutions. Focus on delivering the requested feature cleanly and efficiently.