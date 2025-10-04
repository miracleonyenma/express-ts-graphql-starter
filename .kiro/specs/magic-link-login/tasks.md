# Implementation Plan

- [x] 1. Create magic link token model and database schema

  - Create MagicLinkToken model with proper schema, indexes, and TTL cleanup
  - Implement pre-save middleware for automatic email sending and token cleanup
  - Add proper validation and security measures for token storage
  - _Requirements: 1.2, 1.3, 3.1, 3.3, 6.2_

- [x] 2. Implement magic link service layer
- [x] 2.1 Create core MagicLinkService class with token generation

  - Implement cryptographically secure token generation using crypto.randomBytes
  - Add token hashing functionality using bcrypt before database storage
  - Create service class structure following existing service patterns
  - _Requirements: 1.2, 1.3, 6.1, 6.2_

- [x] 2.2 Implement magic link request functionality with rate limiting

  - Add requestMagicLink method with email validation and rate limiting
  - Implement sliding window rate limiting (3 requests per 15 minutes per email)
  - Add proper error handling and security logging
  - _Requirements: 1.1, 1.4, 1.5, 4.2, 4.3, 6.5_

- [x] 2.3 Implement magic link verification and authentication

  - Add verifyMagicLink method with constant-time token comparison
  - Implement token validation, expiration checking, and automatic invalidation
  - Integrate with existing UserService for JWT token generation
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.3, 5.4, 6.3, 6.4_

- [ ]\* 2.4 Write unit tests for MagicLinkService methods

  - Create unit tests for token generation, validation, and rate limiting
  - Test error handling scenarios and security edge cases
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 3. Create email template and integration
- [x] 3.1 Design magic link email template

  - Create professional email template using existing EmailService patterns
  - Include clear call-to-action button and security messaging
  - Ensure consistent branding with existing email templates
  - _Requirements: 1.4, 1.5_

- [x] 3.2 Implement email sending functionality

  - Integrate magic link email sending with existing EmailService
  - Add proper error handling for email delivery failures
  - Implement email template rendering with dynamic magic link URLs
  - _Requirements: 1.4, 1.5_

- [x] 4. Create GraphQL schema and resolvers
- [x] 4.1 Define GraphQL type definitions for magic link operations

  - Create type definitions for magic link request and verification
  - Define input types and response types following existing patterns
  - Add proper GraphQL schema documentation
  - _Requirements: 1.1, 2.1, 5.1, 5.2_

- [x] 4.2 Implement magic link GraphQL resolvers

  - Create requestMagicLink mutation resolver with proper error handling
  - Implement verifyMagicLink mutation resolver with authentication flow
  - Ensure resolvers follow existing authentication patterns and return same token structure
  - _Requirements: 1.1, 1.5, 2.1, 2.4, 5.3, 5.4_

- [x] 4.3 Update GraphQL resolver index and type definition exports

  - Add magic link resolvers to main resolver index
  - Export new type definitions in main GraphQL schema
  - Ensure proper integration with existing GraphQL setup
  - _Requirements: 5.1, 5.2_

- [ ]\* 4.4 Write integration tests for GraphQL mutations

  - Create integration tests for requestMagicLink and verifyMagicLink mutations
  - Test end-to-end magic link authentication flow
  - _Requirements: 1.1, 2.1, 2.4_

- [ ] 5. Add security logging and monitoring
- [ ] 5.1 Implement security event logging

  - Add logging for magic link requests, verifications, and failed attempts
  - Implement audit trail for security monitoring
  - Use existing logging infrastructure and patterns
  - _Requirements: 6.4, 6.5_

- [ ] 5.2 Add rate limiting monitoring and alerts

  - Implement monitoring for rate limiting events and abuse detection
  - Add proper error responses for rate-limited requests
  - Create alerts for suspicious authentication patterns
  - _Requirements: 4.2, 4.3, 6.5_

- [ ] 6. Integration and final testing
- [ ] 6.1 Test integration with existing authentication methods

  - Verify magic link authentication works alongside email/password login
  - Ensure compatibility with existing Google OAuth authentication
  - Test that all authentication methods produce consistent JWT tokens and user sessions
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ]\* 6.2 Perform end-to-end security testing

  - Test token timing attack prevention and constant-time comparison
  - Verify rate limiting enforcement and abuse prevention
  - Test expired and invalid token handling scenarios
  - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [ ] 6.3 Add cleanup utilities and maintenance tasks
  - Implement automatic cleanup of expired tokens using TTL indexes
  - Add manual cleanup utilities for maintenance
  - Ensure proper database performance with appropriate indexing
  - _Requirements: 3.3, 3.4_
