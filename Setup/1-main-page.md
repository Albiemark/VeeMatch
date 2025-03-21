Set up the frontend according to the following prompt:
  <frontend-prompt>
  Create detailed components with these requirements:
  1. Use 'use client' directive for client-side components
  2. Make sure to concatenate strings correctly using backslash
  3. Style with Tailwind CSS utility classes for responsive design
  4. Use Lucide React for icons (from lucide-react package). Do NOT use other UI libraries unless requested
  5. Use stock photos from picsum.photos where appropriate, only valid URLs you know exist
  6. Configure next.config.js image remotePatterns to enable stock photos from picsum.photos
  7. Create root layout.tsx page that wraps necessary navigation items to all pages
  8. MUST implement the navigation elements items in their rightful place i.e. Left sidebar, Top header
  9. Accurately implement necessary grid layouts
  10. Follow proper import practices:
     - Use @/ path aliases
     - Keep component imports organized
     - Update current src/app/page.tsx with new comprehensive code
     - Don't forget root route (page.tsx) handling
     - You MUST complete the entire prompt before stopping
  </frontend-prompt>

  <summary_title>
Dating App Sign-up Screen UI Design
</summary_title>

<image_analysis>
1. Navigation Elements:
- Primary navigation: Privacy Policy, Terms of use, Continue with email, Use phone number, Profile, Profile Details, Notification, Messages, Discover
- App logo "VEEMATCH" centered at top, featuring winged heart icon
- Sign-up buttons stacked vertically
- Social login options arranged horizontally at bottom
- Footer links for Terms and Privacy aligned horizontally

2. Layout Components:
- Main container: Full screen mobile viewport
- Logo container: 120x120px, rounded corners
- Primary CTA button: 80% screen width, 56px height
- Secondary button: 80% screen width, 48px height
- Social login container: 30% screen width per icon
- Vertical spacing: 24px between major elements

3. Content Sections:
- Header section with logo
- Main sign-up section
- Social login section with divider
- Footer section with legal links
- All sections centered aligned

4. Interactive Controls:
- Primary CTA button (Continue with email)
- Secondary button (Use phone number)
- Social login buttons (Facebook, Google, Apple)
- Footer links (Terms, Privacy)
- All buttons feature hover/active states

5. Colors:
- Primary: #FF1493 (Hot Pink)
- Secondary: #40E0D0 (Turquoise)
- Background: #FFFFFF
- Text: #000000
- Button text: #FFFFFF
- Divider: #EEEEEE

6. Grid/Layout Structure:
- Single column layout
- 16px base grid
- 24px vertical spacing
- 20px horizontal margins
- Centered content alignment
</image_analysis>

<development_planning>
1. Project Structure:
```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Container.tsx
│   ├── features/
│   │   ├── auth/
│   │   └── social-login/
│   └── shared/
│       ├── Button.tsx
│       └── Divider.tsx
├── assets/
│   └── images/
├── styles/
│   └── theme.scss
├── hooks/
│   └── useAuth.ts
└── utils/
    └── validators.ts
```

2. Key Features:
- Email sign-up flow
- Phone number verification
- Social authentication
- Form validation
- Error handling
- Loading states

3. State Management:
```typescript
interface AuthState {
  auth: {
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
    error: string | null;
  };
  registration: {
    step: number;
    method: 'email' | 'phone' | 'social';
    data: RegistrationData;
  };
}
```

4. Component Architecture:
- AuthLayout (wrapper)
  - Logo
  - SignupOptions
    - EmailButton
    - PhoneButton
    - SocialLogin
  - LegalLinks

5. Responsive Breakpoints:
```scss
$breakpoints: (
  'mobile': 320px,
  'tablet': 768px,
  'desktop': 1024px,
  'wide': 1440px
);

$container-max-widths: (
  'mobile': 100%,
  'tablet': 720px,
  'desktop': 960px,
  'wide': 1200px
);
```
</development_planning>