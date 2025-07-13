# Convex-Based Authentication System

This document explains the new authentication system that stores encrypted access tokens in Convex instead of using environment variables.

## Overview

The new system replaces environment variable-based authentication with a secure database storage system using Convex. Access tokens are encrypted and stored per user, allowing for multi-user support and better security.

## Architecture

### Database Schema

#### `tiendanube_user_credentials` Table
```typescript
{
  user_id: string,           // TiendaNube user ID
  access_token: string,      // Encrypted access token
  business_id: string|null,  // Store business ID
  store_info: string|null,   // JSON string of store information
  created_at: number,        // Timestamp
  updated_at: number,        // Timestamp
}
```

### Key Components

#### 1. Convex Functions (`convex/auth.ts`)
- `upsertUserCredentials` - Store/update encrypted credentials
- `getUserCredentials` - Retrieve user credentials
- `deleteUserCredentials` - Remove user credentials
- `getAllUserCredentials` - Admin function (no access tokens)

#### 2. Encryption Utilities (`lib/encryption.ts`)
- `encrypt()` - Encrypt access tokens using AES-256-CBC
- `decrypt()` - Decrypt access tokens for API calls

#### 3. Authentication Utilities (`lib/tiendanube-auth.ts`)
- `getUserCredentials()` - Get and decrypt user credentials
- `updateUserCredentials()` - Update business_id and store_info

#### 4. Updated AuthProvider (`components/AuthProvider.tsx`)
- `makeAuthenticatedRequest()` - Make API calls with user ID header
- Enhanced logout with credential deletion

## Authentication Flow

### 1. Initial Authentication
1. User visits app → AuthProvider checks localStorage
2. If not authenticated → Redirect to TiendaNube OAuth
3. User authorizes → TiendaNube redirects to callback
4. Callback exchanges code for tokens
5. **NEW**: Tokens encrypted and stored in Convex
6. User ID stored in localStorage for session management
7. Redirect to dashboard

### 2. API Requests
1. Frontend makes request via `makeAuthenticatedRequest()`
2. User ID included in `x-tiendanube-user-id` header
3. Backend retrieves encrypted credentials from Convex
4. Access token decrypted for API calls
5. Response returned to frontend

### 3. Logout
1. Credentials deleted from Convex
2. localStorage cleared
3. User redirected to OAuth

## Security Features

### Encryption
- Access tokens encrypted using AES-256-CBC
- Encryption key stored in environment variable
- IV (Initialization Vector) generated for each encryption

### Database Security
- Access tokens never returned in queries (except for decryption)
- Admin functions exclude sensitive data
- Credentials deleted on logout

### API Security
- User ID required in headers for all authenticated requests
- No environment variable dependencies for access tokens
- Automatic credential cleanup

## Environment Variables

### Required
```env
# OAuth Configuration
TIENDANUBE_APP_ID=your_app_id
TIENDANUBE_APP_SECRET=your_app_secret

# Encryption
ENCRYPTION_KEY=your-32-character-secret-key

# API Configuration
TIENDANUBE_USER_AGENT=your_user_agent
NEXT_PUBLIC_CONVEX_URL=your_convex_url
```

### No Longer Required
- `TIENDANUBE_ACCESS_TOKEN` - Now stored in Convex
- `TIENDANUBE_USER_ID` - Now stored in Convex

## API Endpoints

### Updated Endpoints
All API endpoints now require the `x-tiendanube-user-id` header:

- `GET /api/tiendanube/store` - Get store information
- `POST /api/orders/sync` - Sync orders
- `POST /api/products/sync` - Sync products
- All other TiendaNube API endpoints

### Example Request
```javascript
const { makeAuthenticatedRequest } = useAuth();

const response = await makeAuthenticatedRequest('/api/tiendanube/store', {
  headers: {
    'Content-Type': 'application/json',
  }
});
```

## Migration from Environment Variables

### For Existing Users
1. Users will be prompted to re-authenticate
2. New credentials stored in Convex automatically
3. No manual environment variable configuration needed

### For Development
1. Set up Convex project
2. Configure encryption key
3. Update environment variables
4. Test authentication flow

## Benefits

### Security
- ✅ Encrypted token storage
- ✅ No environment variable exposure
- ✅ Automatic credential cleanup
- ✅ Per-user token isolation

### Scalability
- ✅ Multi-user support
- ✅ No environment variable limits
- ✅ Centralized credential management
- ✅ Easy token refresh implementation

### Maintainability
- ✅ No manual environment variable management
- ✅ Automatic credential updates
- ✅ Centralized authentication logic
- ✅ Better error handling

## Future Enhancements

- Token refresh mechanism
- Multi-store support per user
- Advanced encryption options
- Audit logging
- Rate limiting per user
