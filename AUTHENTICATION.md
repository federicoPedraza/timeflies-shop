# Authentication Flow

This document explains the TiendaNube authentication flow implemented in the Timeflies app.

## Overview

The app implements a client-side authentication flow that checks for the presence of `tiendanube_user_id` in localStorage. If this value is missing, users are automatically redirected to the TiendaNube authorization flow.

## Components

### AuthProvider
- **Location**: `components/AuthProvider.tsx`
- **Purpose**: Manages authentication state and provides auth context to the entire app
- **Key Features**:
  - Checks localStorage for `tiendanube_user_id`
  - Redirects to TiendaNube authorization if not authenticated
  - Provides logout functionality
  - Excludes callback page from redirects

### ProtectedRoute
- **Location**: `components/ProtectedRoute.tsx`
- **Purpose**: Wraps protected pages and shows loading state during auth checks
- **Key Features**:
  - Shows loading spinner while checking authentication
  - Only renders children if authenticated
  - Handles both loading and unauthenticated states

### AuthStatus
- **Location**: `components/AuthStatus.tsx`
- **Purpose**: Visual indicator of authentication status in the dashboard header
- **States**:
  - Loading: Shows spinner while checking auth
  - Connected: Green badge with checkmark
  - Not Connected: Red badge with X

## Flow

1. **Initial Load**: App checks localStorage for `tiendanube_user_id`
2. **Not Authenticated**: Redirects to `/api/tiendanube/authorize`
3. **TiendaNube OAuth**: User authorizes the app on TiendaNube
4. **Callback**: TiendaNube redirects to `/tiendanube/callback` with authorization code
5. **Token Exchange**: App exchanges code for access token via `/api/tiendanube/callback`
6. **Storage**: `tiendanube_user_id` is stored in localStorage
7. **Redirect**: User is redirected to dashboard
8. **Protected Access**: All pages are now accessible

## Implementation Details

### Environment Variables Required
```env
TIENDANUBE_APP_ID=your_app_id
TIENDANUBE_APP_SECRET=your_app_secret
TIENDANUBE_ACCESS_TOKEN=access_token_from_callback
TIENDANUBE_USER_ID=user_id_from_callback
TIENDANUBE_USER_AGENT=your_user_agent
```

### localStorage Keys
- `tiendanube_user_id`: Stores the TiendaNube user ID
- `tiendanube_business_id`: Stores the business ID (set by API calls)

### Protected Pages
All main pages are wrapped with `ProtectedRoute`:
- Dashboard (`/`)
- Orders (`/orders`)
- Products (`/products`)
- Customers (`/customers`)
- Analytics (`/analytics`)
- Settings (`/settings`)
- Individual order/product pages

### Logout
- Clears localStorage
- Redirects to TiendaNube authorization
- Resets authentication state

## Security Considerations

- Authentication is client-side only (localStorage)
- Access tokens are stored server-side in environment variables
- No sensitive data is exposed in localStorage
- Logout clears all stored authentication data

## Future Improvements

- Server-side session management
- Token refresh mechanism
- More secure storage options
- Multi-tenant support
