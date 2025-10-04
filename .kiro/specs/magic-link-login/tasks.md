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

- [ ] 6. Create authentication configuration system
- [ ] 6.1 Implement authentication configuration service

  - Create AuthConfig service to manage GraphQL vs REST mode settings
  - Add environment variable parsing for authentication flow configuration
  - Implement URL generation methods for both frontend and API magic links
  - _Requirements: 8.1, 8.2, 8.3, 11.2_

- [ ] 6.2 Add configuration for redirect URLs and user data inclusion

  - Implement frontend success and error redirect URL configuration
  - Add optional user data inclusion in redirect URL parameters
  - Create URL parameter sanitization and validation utilities
  - _Requirements: 8.4, 8.5, 11.4, 11.5_

- [ ] 7. Implement REST endpoints for magic link authentication
- [ ] 7.1 Create REST routes and controller structure

  - Set up Express routes for magic link REST endpoints
  - Create AuthController class with magic link REST methods
  - Implement proper middleware integration for REST endpoints
  - _Requirements: 7.1, 9.5_

- [ ] 7.2 Implement magic link request REST endpoint

  - Create POST /auth/magic-link/request endpoint
  - Integrate with existing MagicLinkService for token generation
  - Implement JSON response handling for REST magic link requests
  - _Requirements: 7.1, 9.1, 9.4_

- [ ] 7.3 Implement magic link verification REST endpoint

  - Create GET /auth/magic-link/verify endpoint with token parameter
  - Implement token validation using existing service methods
  - Add redirect functionality with auth tokens as URL parameters
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 9.1, 9.2, 9.3_

- [ ] 8. Implement REST endpoints for Google OAuth authentication
- [ ] 8.1 Create Google OAuth initiation REST endpoint

  - Create GET /auth/google/login endpoint for OAuth initiation
  - Generate Google OAuth authorization URL with proper parameters
  - Implement state parameter for CSRF protection
  - _Requirements: 10.1, 10.2_

- [ ] 8.2 Implement Google OAuth callback REST endpoint

  - Create GET /auth/google/callback endpoint for OAuth callback handling
  - Integrate with existing GoogleAuthService for code exchange
  - Add user authentication and JWT token generation
  - _Requirements: 10.1, 10.3, 10.4, 10.5_

- [ ] 8.3 Add redirect handling for Google OAuth flow

  - Implement successful authentication redirect with tokens in URL
  - Add error handling with redirect to configured error page
  - Ensure consistent redirect behavior with magic link endpoints
  - _Requirements: 10.4, 10.5, 11.3, 11.4_

- [ ] 9. Update email service for configurable URL generation
- [ ] 9.1 Modify magic link email generation

  - Update email template generation to use configurable URLs
  - Implement logic to generate either frontend or API URLs based on configuration
  - Ensure backward compatibility with existing GraphQL-only setups
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 9.2 Add environment variable integration

  - Update email service to read authentication mode configuration
  - Implement proper fallback behavior when configuration is missing
  - Add validation for required configuration values
  - _Requirements: 8.1, 8.2, 11.1_

- [ ] 10. Integration and final testing
- [ ] 10.1 Test integration with existing authentication methods

  - Verify magic link authentication works alongside email/password login
  - Ensure compatibility with existing Google OAuth authentication
  - Test that all authentication methods produce consistent JWT tokens and user sessions
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 9.2_

- [ ] 10.2 Test REST endpoint functionality and security

  - Verify REST endpoints use same security measures as GraphQL
  - Test redirect functionality with various token and error scenarios
  - Ensure rate limiting and security logging work for REST endpoints
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 9.1, 9.4, 9.5_

- [ ]\* 10.3 Perform end-to-end security testing

  - Test token timing attack prevention and constant-time comparison
  - Verify rate limiting enforcement and abuse prevention
  - Test expired and invalid token handling scenarios across both GraphQL and REST
  - _Requirements: 6.1, 6.2, 6.3, 6.5, 9.1, 9.4_

- [ ] 10.4 Add cleanup utilities and maintenance tasks
  - Implement automatic cleanup of expired tokens using TTL indexes
  - Add manual cleanup utilities for maintenance
  - Ensure proper database performance with appropriate indexing
  - _Requirements: 3.3, 3.4_
