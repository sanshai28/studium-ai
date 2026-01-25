# Mobile & Tablet API Documentation

This document provides information for integrating the Studium AI backend with mobile (iOS/Android) and tablet applications.

## Base URL

### Development
```
http://localhost:5001/api/v1
```

### Production
```
https://api.studium-ai.com/api/v1
```

## API Versioning

The API uses URL-based versioning. Current version: `v1`

All endpoints are prefixed with `/api/v1/`

### Version Info Endpoint
```http
GET /api/version
```

Response:
```json
{
  "version": "1.0.0",
  "apiVersions": ["v1"],
  "supportedPlatforms": ["web", "ios", "android", "tablet"]
}
```

## Required Headers

### Authentication
```
Authorization: Bearer <jwt_token>
```

### Client Identification (Recommended)
```
X-Client-Type: ios | android | tablet | web
X-App-Version: 1.0.0
X-Device-ID: <unique_device_identifier>
```

These headers help with:
- Analytics and usage tracking
- Version compatibility checks
- Platform-specific features
- Debugging and logging

## CORS Configuration

The API supports cross-origin requests from:
- Web applications (localhost and production domains)
- Mobile apps (capacitor://, ionic://, http://localhost)
- Tablet applications

Allowed methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`

## Authentication Endpoints

### Sign Up
```http
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe" // optional
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    }
  },
  "meta": {
    "timestamp": "2026-01-25T19:30:00.000Z",
    "version": "1.0.0"
  }
}
```

**Error Response (400/409):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email and password are required"
  },
  "meta": {
    "timestamp": "2026-01-25T19:30:00.000Z",
    "version": "1.0.0"
  }
}
```

### Sign In
```http
POST /api/v1/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Signed in successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    }
  },
  "meta": {
    "timestamp": "2026-01-25T19:30:00.000Z",
    "version": "1.0.0"
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 422 | Request validation failed |
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `SERVER_ERROR` | 500 | Internal server error |
| `UPGRADE_REQUIRED` | 426 | App version too old |

## Response Format

All API responses follow this standardized format:

### Success Response
```json
{
  "success": true,
  "message": "Optional success message",
  "data": { /* response data */ },
  "meta": {
    "timestamp": "ISO 8601 timestamp",
    "version": "API version",
    "platform": "Detected platform" // optional
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Only in development
  },
  "meta": {
    "timestamp": "ISO 8601 timestamp",
    "version": "API version"
  }
}
```

## Mobile-Specific Considerations

### Token Storage
- **iOS**: Use Keychain for secure token storage
- **Android**: Use EncryptedSharedPreferences
- **Never** store tokens in plain text

### Network Handling
- Implement retry logic for failed requests
- Handle network timeouts (default: 30 seconds)
- Support offline mode with local caching

### Error Handling
```typescript
// Example TypeScript error handling
try {
  const response = await api.post('/auth/signin', credentials);
  if (response.data.success) {
    // Handle success
    saveToken(response.data.data.token);
  }
} catch (error) {
  if (error.response) {
    // Server responded with error
    const { code, message } = error.response.data.error;
    handleError(code, message);
  } else if (error.request) {
    // Network error
    showNetworkError();
  }
}
```

### Request Size Limits
- Maximum request body size: 10MB
- Recommended for mobile: < 1MB per request
- Use pagination for large data sets

### Version Compatibility
The backend checks app version and returns `426 Upgrade Required` if the app is outdated.

Example header:
```
X-App-Version: 1.2.3
```

## Testing

### Health Check
```http
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "message": "Server is running",
  "version": "1.0.0",
  "timestamp": "2026-01-25T19:30:00.000Z"
}
```

## Rate Limiting

(To be implemented)
- Rate limits will be enforced per device/user
- Headers will include remaining requests
- 429 status code for rate limit exceeded

## Support

For mobile integration support:
- Email: dev@studium-ai.com
- Documentation: https://docs.studium-ai.com
- API Status: https://status.studium-ai.com
