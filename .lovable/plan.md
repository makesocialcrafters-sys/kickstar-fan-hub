

## Problem

After registration, users land on `/onboarding` but get no gate-keeping — they can navigate to `/dashboard` without completing their profile. The `ProtectedRoute` only checks if a user is logged in, not if onboarding is complete.

## Solution

Extend `AuthContext` to also load the user's profile (specifically `username`) and expose a `profileComplete` flag. Then create two route wrapper components:

1. **`ProtectedRoute`** (for `/dashboard`, `/dashboard/upload`): Requires login AND `username` set. If logged in but no username → redirect to `/onboarding`. If not logged in → redirect to `/login`.

2. **`OnboardingRoute`** (for `/onboarding`): Requires login. If logged in AND username already set → redirect to `/dashboard`. If not logged in → redirect to `/login`.

## Files to Change

### 1. `src/contexts/AuthContext.tsx`
- After auth state resolves, fetch `profiles.username` for the current user
- Expose `profile: { username: string | null } | null` and a `profileLoading` boolean
- Add a `refreshProfile()` method so Onboarding can trigger a re-fetch after saving

### 2. `src/components/ProtectedRoute.tsx`
- Import `profile` and `profileLoading` from AuthContext
- Wait for both `loading` and `profileLoading` to resolve
- If no user → `/login`
- If user but no `profile?.username` → `/onboarding`
- Otherwise render children

### 3. New: `src/components/OnboardingRoute.tsx`
- Same auth check (no user → `/login`)
- If user AND `profile?.username` exists → `/dashboard`
- Otherwise render children

### 4. `src/App.tsx`
- Wrap `/onboarding` route with `<OnboardingRoute>` instead of `<ProtectedRoute>`

### 5. `src/pages/Onboarding.tsx`
- After successful profile save (step 3 submit), call `refreshProfile()` from AuthContext before navigating to the success step or `/dashboard`

