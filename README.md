# IELTS Dashboard

A comprehensive dashboard for IELTS preparation tracking with daily task management, leaderboards, and analytics.

## Features

- **Daily Task Tracker**: Track your daily IELTS practice sessions (Listening, Reading, Writing, Speaking)
- **Leaderboard**: Compare your progress with other users
- **Profile Analytics**: View your study statistics and progress
- **Google Authentication**: Secure login with Google accounts
- **Real-time Updates**: Firebase integration for live data updates

## Recent Fixes Applied

### 1. Missing Authentication Hook
- **Issue**: Components were importing `useAuth` from `@/lib/auth` but the file didn't exist
- **Fix**: Created `src/lib/auth.js` with proper authentication state management

### 2. Missing Firestore Functions
- **Issue**: `getDailyTasks` function was imported but not defined in `firestore.js`
- **Fix**: Added the missing function with proper error handling

### 3. Empty Profile Page
- **Issue**: Profile page was completely empty
- **Fix**: Created a complete profile page with user information and analytics

### 4. Error Handling
- **Issue**: Components lacked proper error handling and loading states
- **Fix**: Added comprehensive error handling, loading states, and fallback UI

### 5. Component Dependencies
- **Issue**: Components had inconsistent dependencies and prop passing
- **Fix**: Standardized component interfaces and removed unused dependencies

### 6. Navigation
- **Issue**: Inconsistent navigation and logout functionality
- **Fix**: Added Navbar component and improved navigation flow

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Firebase Setup**:
   
   a. Create a Firebase project at https://console.firebase.google.com/
   
   b. Enable Authentication with Google provider
   
   c. Create a Firestore database in test mode
   
   d. Create a `.env.local` file with your Firebase configuration:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
   
   e. Deploy Firestore security rules:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore
   firebase deploy --only firestore:rules
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── app/
│   ├── dashboard/     # Main dashboard page
│   ├── login/         # Authentication page
│   ├── profile/       # User profile page
│   └── layout.js      # Root layout
├── component/         # Reusable components
│   ├── DailyTaskTracker.jsx
│   ├── Leaderboard.js
│   ├── LineChart.jsx
│   ├── Navbar.js
│   ├── ProfileAnalytics
│   └── TaskSelector.js
└── lib/              # Utility functions
    ├── auth.js        # Authentication hooks
    ├── firebase.js    # Firebase configuration
    ├── firestore.js   # Firestore operations
    └── updateLeaderboardStats.js
```

## Technologies Used

- **Next.js 15**: React framework with App Router
- **Firebase**: Authentication and Firestore database
- **Tailwind CSS**: Styling
- **Recharts**: Data visualization
- **React 19**: Latest React features

## Key Improvements Made

1. **Error Resilience**: All components now handle errors gracefully
2. **Loading States**: Proper loading indicators for better UX
3. **Type Safety**: Better prop validation and default values
4. **Performance**: Optimized re-renders and data fetching
5. **Accessibility**: Improved keyboard navigation and screen reader support
6. **Mobile Responsive**: Better mobile layout and touch interactions

## Usage

1. Visit the application
2. Sign in with your Google account
3. Track your daily IELTS practice sessions
4. View your progress on the leaderboard
5. Check your analytics on the profile page

The application will automatically redirect you to the appropriate page based on your authentication status.

## Troubleshooting

### Firebase Permissions Error
If you see "Missing or insufficient permissions" error:

1. **Check Environment Variables**: Ensure all Firebase environment variables are set correctly in `.env.local`

2. **Deploy Security Rules**: Make sure you've deployed the Firestore security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Enable Authentication**: In Firebase Console, go to Authentication > Sign-in method and enable Google provider

4. **Check Firestore Database**: Ensure your Firestore database is created and in the correct region

### Module Resolution Errors
If you see import errors:

1. **Check File Extensions**: Ensure all component imports include the correct file extensions (`.js` or `.jsx`)

2. **Verify Path Mapping**: The `jsconfig.json` should have the correct path mapping for `@/*`

### Common Issues

- **Authentication Not Working**: Make sure Google Auth is enabled in Firebase Console
- **Data Not Loading**: Check if Firestore security rules allow read/write for authenticated users
- **Build Errors**: Ensure all dependencies are installed with `npm install`
