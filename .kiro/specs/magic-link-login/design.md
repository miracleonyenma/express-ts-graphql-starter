# Magic Link Login Design Document

## Overview

The magic link login feature will provide passwordless authentication by sending users a secure, time-limited link via email. This feature integrates seamlessly with the existing authentication system, maintaining compatibility with email/password and Google OAuth methods while following established patterns for token management and email delivery.

## Architecture

### High-Level Flow

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant GraphQL
    participant Service
    participant Database
    participant EmailService

    User->>Client: Request magic link
    Client->>GraphQL: requestMagicLink mutation
    GraphQL->>Service: Generate magic link token
    Service->>Database: Store hashed token with expiry
    Service->>EmailService: Send magic link email
    EmailService-->>User: Email with magic link

    User->>Client: Click magic link
    Client->>GraphQL: verifyMagicLink mutation
    GraphQL->>Service: Validate token
    Service->>Database: Check token validity
    Service->>Database: Invalidate token
    Service->>GraphQL: Return auth tokens
    GraphQL-->>Client: JWT tokens + user data
```

### Integration Points

- **Database Layer**: New MagicLinkToken model following existing token patterns (OTP, PasswordResetToken)
- **Service Layer**: New MagicLinkService integrated with existing UserService
- **GraphQL Layer**: New mutations and resolvers following existing authentication patterns
- **Email System**: Leverages existing EmailService infrastructure
- **Authentication Flow**: Produces same JWT tokens as existing login methods

## Components and Interfaces

### 1. Database Model - MagicLinkToken

**File**: `src/models/magicLinkToken.model.ts`

```typescript
interface MagicLinkTokenDocument {
  email: string;
  tokenHash: string; // Hashed version of the token
  expires: Date;
  used: boolean;
  createdAt: Date;
}
```

**Key Features**:

- Follows existing token model patterns (similar to PasswordResetToken)
- Stores hashed tokens for security
- Automatic cleanup via TTL index
- Pre-save middleware for email sending
- Automatic invalidation of existing tokens

### 2. Service Layer - MagicLinkService

**File**: `src/services/magicLink.services.ts`

```typescript
interface MagicLinkService {
  requestMagicLink(
    email: string
  ): Promise<{ success: boolean; message: string }>;
  verifyMagicLink(token: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserDocument;
  }>;
  cleanupExpiredTokens(): Promise<void>;
}
```

**Key Features**:

- Rate limiting (3 requests per 15 minutes per email)
- Cryptographically secure token generation
- Constant-time token comparison
- Integration with existing UserService for authentication
- Security logging for audit trails

### 3. GraphQL Layer

**Type Definitions** (`src/graphql/typeDefs/magicLink.ts`):

```graphql
type MagicLinkResponse {
  success: Boolean!
  message: String!
}

type Mutation {
  requestMagicLink(email: String!): MagicLinkResponse!
  verifyMagicLink(token: String!): AuthResponse!
}
```

**Resolvers** (`src/graphql/resolvers/magicLink.resolvers.ts`):

- `requestMagicLink`: Handles magic link generation and email sending
- `verifyMagicLink`: Handles token validation and user authentication

### 4. Email Templates

**Magic Link Email Template**:

- Professional design using existing EmailService templates
- Clear call-to-action button
- Security messaging about link expiration
- Consistent branding with existing email templates

## Data Models

### MagicLinkToken Schema

```typescript
{
  email: {
    type: String,
    required: true,
    index: true
  },
  tokenHash: {
    type: String,
    required: true,
    unique: true
  },
  expires: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
  },
  used: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 900 // TTL index - 15 minutes
  }
}
```

### Rate Limiting Storage

- Utilize existing patterns or implement simple in-memory rate limiting
- Track requests per email address with sliding window
- Reset counters every 15 minutes

## Error Handling

### Client-Facing Errors

- **Invalid Email**: "Please provide a valid email address"
- **Rate Limited**: "Too many requests. Please try again in X minutes"
- **Invalid/Expired Token**: "This magic link has expired or is invalid"
- **User Not Found**: Generic success message (security consideration)

### Internal Error Handling

- Follow existing ErrorHandler patterns
- Log security events (failed attempts, rate limiting)
- Graceful degradation if email service fails
- Database connection error handling

### Security Considerations

- Never reveal whether an email exists in the system
- Use constant-time comparison for token validation
- Implement proper rate limiting to prevent abuse
- Hash tokens before database storage
- Automatic token cleanup and invalidation

## Testing Strategy

### Unit Tests (Optional)

- Token generation and validation logic
- Rate limiting functionality
- Email template generation
- Error handling scenarios

### Integration Tests (Optional)

- End-to-end magic link flow
- GraphQL mutation testing
- Database operations
- Email service integration

### Security Tests (Optional)

- Rate limiting enforcement
- Token timing attack prevention
- Expired token handling
- Invalid token scenarios

## Implementation Considerations

### Security Best Practices

1. **Token Generation**: Use `crypto.randomBytes()` for cryptographically secure tokens
2. **Token Storage**: Hash tokens using bcrypt before database storage
3. **Token Validation**: Implement constant-time comparison to prevent timing attacks
4. **Rate Limiting**: Implement sliding window rate limiting per email address
5. **Audit Logging**: Log all authentication attempts for security monitoring

### Performance Considerations

1. **Database Indexing**: Index on email and tokenHash fields
2. **TTL Cleanup**: Use MongoDB TTL indexes for automatic token cleanup
3. **Rate Limiting**: Use efficient in-memory storage for rate limit counters
4. **Email Queuing**: Leverage existing email service patterns for reliability

### Scalability Considerations

1. **Stateless Design**: No server-side session storage required
2. **Database Sharding**: Token model supports horizontal scaling
3. **Email Service**: Existing EmailService already handles multiple providers
4. **Caching**: Rate limiting data can be cached for performance

### Monitoring and Observability

1. **Success Metrics**: Track magic link request and verification rates
2. **Security Metrics**: Monitor failed attempts and rate limiting events
3. **Performance Metrics**: Email delivery times and database query performance
4. **Error Tracking**: Comprehensive error logging and alerting

## Migration Strategy

### Database Changes

- Create new MagicLinkToken collection
- Add appropriate indexes
- No changes required to existing User model

### API Changes

- Add new GraphQL mutations (non-breaking)
- Maintain backward compatibility with existing auth methods
- Update API documentation

### Deployment Strategy

- Feature can be deployed incrementally
- No downtime required for existing functionality
- Email templates can be tested in staging environment
