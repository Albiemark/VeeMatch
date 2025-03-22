# VeeMatch Architectural Principles

This document outlines the architectural principles and project rules for the VeeMatch dating application. These guidelines should be followed to maintain code quality, ensure scalability, and promote consistent development practices.

## 1. Security & Privacy First

- **Zero Trust Architecture**: Validate all data access through Row Level Security (RLS) policies in Supabase
- **Client-Side Security**: Never expose sensitive data or API keys in client-side code
- **Data Minimization**: Collect and store only necessary user information
- **Authorization Checks**: Implement authorization checks at every API endpoint
- **Sensitive Data Handling**: Hash/encrypt sensitive user data before storage
- **External Service Security**: Use environment variables for all API keys and credentials
- **Storage Policies**: Follow established Supabase storage policies for photo uploads and user access

## 2. Code Organization & Structure

- **Feature-Based Organization**: Group files by feature domain rather than technical type
  - Example: `/src/components/features/auth/` instead of `/src/components/buttons/`
- **Component Hierarchy**:
  - `ui/`: Reusable UI components (buttons, inputs, modals)
  - `shared/`: Cross-feature components with business logic
  - `features/`: Feature-specific components
  - `layout/`: Page layout components
- **Path Aliasing**: Use consistent path aliases (`@/components`, `@/lib`, etc.)
- **File Naming Convention**: Use descriptive names with PascalCase for components, camelCase for utilities
- **Consistent Directory Structure**: Maintain a consistent directory structure across the project
- **App Router Conventions**: Follow Next.js App Router conventions for routing and layouts

## 3. State Management

- **Context Segregation**: Create separate contexts for domain-specific state (like ProfileContext)
- **Data Flow Direction**: Maintain unidirectional data flow
- **State Locality**: Keep state as close as possible to where it's used
- **Server State**: Use React Query for server state management
- **Client State**: Use React Context for global client state
- **Form State**: Use dedicated form state libraries for complex forms
- **Prop Drilling Limitations**: Limit prop drilling to 2 levels, then use context

## 4. Data & API Layer

- **API Route Organization**: Structure `/app/api` routes to mirror database entities
- **Data Validation**: Validate all data at API boundaries using schemas
- **Error Handling**: Standardize error responses across all API endpoints
- **Data Fetching**: Implement consistent data fetching patterns
- **Database Access**: Use Row Level Security (RLS) as primary security mechanism
- **Type Safety**: Maintain strict TypeScript type definitions for all data structures
- **Supabase Integration**: Follow established patterns for Supabase database and storage access
- **Transformation Layer**: Add consistent data transformation between API and UI layers

## 5. Component Design Patterns

- **Composition Over Inheritance**: Prefer component composition over inheritance
- **Container/Presenter Pattern**: Separate data fetching (containers) from presentation
- **Pure Components**: Maximize use of pure functional components
- **Custom Hooks**: Extract reusable logic into custom hooks
- **Single Responsibility**: Each component should have a single responsibility
- **Client Components**: Use 'use client' directive only for components that require client-side features
- **Stateless When Possible**: Keep components stateless unless state is necessary

## 6. Performance Optimization

- **Code Splitting**: Use dynamic imports for code splitting
- **Image Optimization**: Optimize and properly size all images
- **Memoization**: Use React.memo, useMemo, and useCallback appropriately
- **Bundle Size Monitoring**: Regularly audit bundle size
- **Lazy Loading**: Implement lazy loading for images and heavy components
- **Service Worker**: Leverage service worker for offline capabilities and caching
- **Font Optimization**: Optimize font loading and rendering
- **Network Requests**: Minimize and batch network requests when possible

## 7. Authentication & User Management

- **Authentication Delegation**: Delegate authentication logic to Clerk
- **User Sessions**: Handle user sessions consistently across the application
- **Protected Routes**: Implement middleware for route protection
- **Profile Synchronization**: Keep Clerk user data in sync with application user data
- **Auth State Management**: Use Clerk's hooks and context consistently
- **Sign Up/In Flows**: Maintain clear, consistent authentication flows

## 8. UI/UX Standards

- **Responsive Design**: Design mobile-first with responsive breakpoints
- **Accessibility**: Ensure WCAG compliance (minimum AA standard)
- **Theme Consistency**: Follow consistent theming through Tailwind configuration
- **Loading States**: Handle loading states elegantly with skeletons
- **Error States**: Provide clear error feedback to users
- **Animation Guidelines**: Use consistent animation patterns
- **Color Palette**: Adhere to the established color palette in the design system
- **Typography System**: Follow the defined typography hierarchy

## 9. Testing Strategy

- **Component Testing**: Write tests for UI components
- **Integration Testing**: Test feature workflows end-to-end
- **API Testing**: Test API endpoints for correct behavior
- **Test Coverage**: Maintain minimum test coverage thresholds
- **Mock Strategy**: Consistent approach to mocking external dependencies
- **Authentication Testing**: Test authentication flows with appropriate mocks

## 10. Error Handling & Logging

- **Error Boundaries**: Implement React error boundaries for component errors
- **Standardized Error Format**: Use consistent error format across the application
- **User-Friendly Errors**: Present user-friendly error messages
- **Logging Strategy**: Implement structured logging for debugging
- **Monitoring**: Set up monitoring for production errors
- **Fallback UI**: Provide graceful fallback UIs for error states

## 11. Deployment & DevOps

- **Environment Configuration**: Use environment-specific configurations
- **CI/CD Pipeline**: Maintain automated CI/CD pipeline via Vercel
- **Database Migrations**: Version control all database migrations
- **Feature Flags**: Implement feature flags for controlled rollouts
- **Monitoring & Alerting**: Set up performance and error monitoring
- **Backup Strategy**: Implement regular database backup strategy

## 12. Dating App Specific Patterns

- **Profile Management**: Consistent patterns for user profile creation and management
- **Matching Algorithm**: Encapsulate matching logic in dedicated services
- **Privacy Controls**: Implement robust privacy controls for user data
- **Messaging System**: Follow real-time messaging patterns with Supabase
- **Location Services**: Handle location data securely and efficiently
- **Photo Management**: Consistent patterns for photo upload, storage, and display
- **User Preferences**: Structured approach to handling user preferences and settings

## 13. Documentation

- **Code Comments**: Document complex logic and component interfaces
- **API Documentation**: Document all API endpoints
- **Type Definitions**: Maintain comprehensive TypeScript definitions
- **Architecture Documentation**: Keep high-level architecture documentation updated
- **Development Guides**: Provide clear guides for common development tasks
- **Onboarding Documentation**: Maintain documentation for new developers

## Implementation Checklist

When implementing new features or making changes, consider this checklist:

- [ ] Does the implementation follow the feature-based organization structure?
- [ ] Are components properly categorized in the component hierarchy?
- [ ] Is state managed at the appropriate level?
- [ ] Are API routes organized and documented properly?
- [ ] Does the implementation follow the established component design patterns?
- [ ] Have performance optimizations been considered?
- [ ] Does the implementation maintain security and privacy standards?
- [ ] Are UI/UX standards being followed?
- [ ] Is there appropriate test coverage?
- [ ] Is error handling implemented properly?
- [ ] Is the implementation properly documented?

## Technology Stack Reference

- **Frontend Framework**: Next.js 15 with App Router
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Authentication**: Clerk
- **Styling**: Tailwind CSS
- **State Management**: React Query, React Context
- **Typing**: TypeScript
- **Real-time Features**: Supabase Subscriptions
- **Deployment**: Vercel
