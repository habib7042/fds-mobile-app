# FDS Mobile App - TODO

## Phase 1: Setup & Authentication
- [x] Update app branding (name, logo)
- [x] Create API client utility for https://newfds.vercel.app
- [x] Implement auth context and hooks
- [x] Build login screen with mobile number input
- [x] Build PIN input with custom keypad
- [x] Implement remember me functionality
- [x] Handle authentication errors

## Phase 2: Dashboard & Navigation
- [x] Set up bottom tab navigation (Home, Contributions, Profile)
- [x] Add navigation icons to icon-symbol.tsx
- [x] Build dashboard screen layout
- [x] Create account summary card component
- [x] Display member statistics
- [x] Add quick action buttons

## Phase 3: Contributions Screen
- [x] Build contributions list screen
- [x] Create contribution item component
- [x] Implement year grouping
- [x] Display total contributions summary
- [x] Handle empty state

## Phase 4: Profile Screen
- [x] Build profile screen layout
- [x] Display member information
- [x] Show profile photo placeholder
- [x] Implement logout functionality
- [x] Handle session expiry

## Phase 5: Polish & Testing
- [x] Add loading states
- [x] Add error handling
- [x] Implement pull-to-refresh
- [ ] Test on iOS simulator
- [ ] Test on Android
- [ ] Verify all API integrations
- [x] Create first checkpoint

## Bug Fixes
- [x] Fix infinite loading on app start - routing not working
- [x] Change PIN from 6 digits to 4 digits
- [x] Hide tab bar on login screen
- [x] Test API login with provided credentials
- [x] Verify member data fetching
- [x] Update API client to handle actual response structure (no token field)
- [x] Handle fundAdjustments instead of adjustments
- [x] Fix balance calculation to correctly sum contributions and adjustments
- [x] Display profile image from API
- [x] Create adjustments breakdown screen
- [x] Add visual indicator for pull-to-refresh

## New Features
- [x] Create PDF statement generator utility
- [x] Add download button to profile screen
- [x] Handle file permissions and storage
- [x] Show download success/error notifications

## Push Notifications
- [x] Set up push notification permissions
- [x] Create notification service utility
- [x] Schedule monthly statement reminders
- [x] Handle notification responses
- [x] Add notification settings screen
