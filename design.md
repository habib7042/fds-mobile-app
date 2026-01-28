# FDS Mobile App - Design Document

## App Overview
A mobile application for FDS (Friends Development Society) members to access their account information, view contributions, and manage their financial data. The app connects to the existing API at https://newfds.vercel.app and provides a simplified, English-only interface focused on member functionality.

## Design Principles
- **Mobile-first**: Optimized for portrait orientation (9:16) and one-handed usage
- **iOS HIG Compliant**: Follows Apple Human Interface Guidelines for native feel
- **Simple & Clean**: Minimal interface with clear information hierarchy
- **English Only**: All content in English (no Bengali font requirements)

## Screen List

### 1. Login Screen
- **Purpose**: Authenticate member using mobile number and PIN
- **Content**: 
  - App logo and branding
  - Mobile number input field
  - 6-digit PIN input with custom keypad
  - Login button
  - Remember me option
- **Functionality**: POST to /api/auth/member-login with phone and pin

### 2. Dashboard (Home) Screen
- **Purpose**: Overview of member account and quick actions
- **Content**:
  - Welcome message with member name
  - Account summary card (account number, total contributions, balance)
  - Quick stats (total paid, pending months)
  - Quick action buttons (View Statement, Contributions)
- **Functionality**: GET /api/member/[accountNumber] for member data

### 3. Contributions Screen
- **Purpose**: Detailed list of all monthly contributions
- **Content**:
  - List of contributions by month/year
  - Each item shows: month, year, amount, payment date
  - Total contribution summary at top
  - Filter/sort options (by year)
- **Functionality**: Display contributions array from member data

### 4. Profile Screen
- **Purpose**: View and manage member profile information
- **Content**:
  - Profile photo (if available)
  - Personal details (name, phone, email, address)
  - Account information (account number, member since)
  - Logout button
- **Functionality**: Display member data, handle logout

## Key User Flows

### Login Flow
1. User opens app
2. If remembered, mobile number is pre-filled
3. User enters/confirms mobile number
4. User enters 6-digit PIN using keypad
5. App calls /api/auth/member-login
6. On success, navigate to Dashboard
7. Store auth token and account number locally

### View Contributions Flow
1. User taps "Contributions" from Dashboard
2. App displays list of all contributions
3. User can scroll through history
4. User can filter by year
5. User can tap back to return to Dashboard

### Logout Flow
1. User navigates to Profile screen
2. User taps "Logout" button
3. App clears stored credentials
4. App navigates back to Login screen

## Color Scheme
- **Primary**: #0a7ea4 (teal blue - matches FDS branding)
- **Background**: #ffffff (light) / #151718 (dark)
- **Surface**: #f5f5f5 (light) / #1e2022 (dark)
- **Text**: #11181C (light) / #ECEDEE (dark)
- **Success**: #22C55E (for positive balances)
- **Warning**: #F59E0B (for pending items)
- **Error**: #EF4444 (for errors)

## Navigation Structure
Bottom Tab Navigation:
- **Home** (Dashboard) - house icon
- **Contributions** - list icon
- **Profile** - person icon

## API Integration
- **Base URL**: https://newfds.vercel.app
- **Authentication**: JWT token stored in SecureStore
- **Endpoints Used**:
  - POST /api/auth/member-login (phone, pin)
  - GET /api/member/[accountNumber] (with auth token)

## Data Storage
- **Auth Token**: SecureStore (encrypted)
- **Account Number**: SecureStore
- **Remember Me**: AsyncStorage
- **Member Data**: React Query cache (with 5-minute stale time)

## Special Considerations
- No admin features required
- No community features (posts, polls) needed
- Focus on account and contribution viewing only
- Offline support not required (always fetch fresh data)
- No PDF generation in app (can be added later if needed)
