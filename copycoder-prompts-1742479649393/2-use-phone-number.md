
<summary_title>Use phone number</summary_title>

<image_analysis>
Core Purpose:
- Enable users to input/verify phone numbers
- Provide phone-based authentication
- Manage phone number preferences

Key Components:
- Phone input field with country code selector
- Validation indicators
- Verification code input
- Submit/Verify buttons
- Status messages
- Error handling displays

Layout Structure:
- Single column form layout
- Progressive disclosure of verification steps
- Mobile-first responsive design
- Clear visual feedback states

Component Architecture:
```jsx
<PhoneNumberSection>
  <PhoneInput />
  <CountrySelector />
  <ValidationMessage />
  <VerificationCodeInput />
  <ActionButtons />
  <StatusIndicator />
</PhoneNumberSection>
```

Design System:
- Input height: 48px
- Spacing: 16px between elements
- Font: System default, 16px base
- Colors: Primary action, error, success states

Style Architecture:
```css
.phone-section {
  max-width: 480px;
  margin: 0 auto;
  padding: 24px;
}

.phone-input {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .phone-section {
    padding: 16px;
  }
}
```

Quality Assurance:
- Input format validation
- International number support
- WCAG 2.1 AA compliance
- Error state testing
- Loading state handling
- Cross-browser compatibility
</image_analysis>

<development_planning>
Component Architecture:
- Component breakdown
- State management
- Data flow
</development_planning>