# Requirements Document

## Introduction

This feature adds magic link email authentication to the existing authentication system, providing users with a passwordless login option alongside the current email/password and Google OAuth methods. Magic link authentication allows users to receive a secure, time-limited link via email that grants them access to their account without requiring a password.

## Requirements

### Requirement 1

**User Story:** As a user, I want to request a magic link via email, so that I can log into my account without remembering a password.

#### Acceptance Criteria

1. WHEN a user provides their email address on the magic link request form THEN the system SHALL validate the email format
2. WHEN a valid email is provided THEN the system SHALL generate a unique, cryptographically secure token
3. WHEN a token is generated THEN the system SHALL store it with an expiration time of 15 minutes
4. WHEN the token is stored THEN the system SHALL send an email containing the magic link to the user's email address
5. WHEN the email is sent THEN the system SHALL return a success message without revealing whether the email exists in the system

### Requirement 2

**User Story:** As a user, I want to click on the magic link in my email, so that I can be automatically logged into my account.

#### Acceptance Criteria

1. WHEN a user clicks a magic link THEN the system SHALL validate the token from the URL
2. WHEN the token is valid and not expired THEN the system SHALL authenticate the user and create a session
3. WHEN the token is valid THEN the system SHALL invalidate the token to prevent reuse
4. WHEN authentication is successful THEN the system SHALL redirect the user to the dashboard or intended destination
5. WHEN the token is invalid or expired THEN the system SHALL display an error message and redirect to the login page

### Requirement 3

**User Story:** As a user, I want magic links to expire after a reasonable time, so that my account remains secure if someone else gains access to my email.

#### Acceptance Criteria

1. WHEN a magic link token is generated THEN the system SHALL set an expiration time of 15 minutes
2. WHEN a user attempts to use an expired token THEN the system SHALL reject the authentication attempt
3. WHEN an expired token is used THEN the system SHALL display a clear error message indicating the link has expired
4. WHEN a token expires THEN the system SHALL automatically clean up expired tokens from storage

### Requirement 4

**User Story:** As a user, I want to be able to request a new magic link if my previous one expired, so that I can still access my account.

#### Acceptance Criteria

1. WHEN a user requests a new magic link THEN the system SHALL invalidate any existing unused tokens for that email
2. WHEN multiple magic link requests are made within a short time THEN the system SHALL implement rate limiting to prevent abuse
3. WHEN rate limiting is triggered THEN the system SHALL return an appropriate error message
4. WHEN a new token is generated THEN the system SHALL follow the same security and expiration rules as the initial request

### Requirement 5

**User Story:** As a system administrator, I want magic link authentication to integrate seamlessly with existing authentication methods, so that users can choose their preferred login method.

#### Acceptance Criteria

1. WHEN magic link authentication is implemented THEN the system SHALL maintain compatibility with existing email/password authentication
2. WHEN magic link authentication is implemented THEN the system SHALL maintain compatibility with existing Google OAuth authentication
3. WHEN a user authenticates via magic link THEN the system SHALL create the same session structure as other authentication methods
4. WHEN a user authenticates via magic link THEN the system SHALL return the same user data and JWT tokens as other authentication methods

### Requirement 6

**User Story:** As a developer, I want magic link functionality to be properly secured, so that the authentication system remains robust against attacks.

#### Acceptance Criteria

1. WHEN generating magic link tokens THEN the system SHALL use cryptographically secure random generation
2. WHEN storing tokens THEN the system SHALL hash tokens before database storage
3. WHEN validating tokens THEN the system SHALL use constant-time comparison to prevent timing attacks
4. WHEN a magic link is used THEN the system SHALL log the authentication event for security monitoring
5. WHEN implementing rate limiting THEN the system SHALL limit requests to 3 magic links per email per 15-minute window

### Requirement 7

**User Story:** As a user, I want to be able to click a magic link that directly authenticates me and redirects me to the frontend with my authentication tokens, so that I can have a seamless login experience without additional GraphQL calls.

#### Acceptance Criteria

1. WHEN a magic link is configured for REST endpoint verification THEN the system SHALL provide a GET endpoint that accepts the token as a URL parameter
2. WHEN a user clicks a REST-based magic link THEN the system SHALL validate the token using the same security measures as GraphQL verification
3. WHEN token validation is successful THEN the system SHALL redirect the user to a configured frontend URL with access and refresh tokens as URL parameters
4. WHEN token validation fails THEN the system SHALL redirect the user to a configured error page with an appropriate error message
5. WHEN redirecting with tokens THEN the system SHALL optionally include user data as URL parameters based on configuration

### Requirement 8

**User Story:** As a system administrator, I want to configure whether magic links point to the API REST endpoint or the frontend GraphQL flow, so that I can choose the authentication flow that best fits my application architecture.

#### Acceptance Criteria

1. WHEN generating magic links THEN the system SHALL check configuration to determine whether to generate API REST URLs or frontend URLs
2. WHEN REST endpoint mode is enabled THEN the system SHALL generate magic links pointing to the API's REST verification endpoint
3. WHEN frontend mode is enabled THEN the system SHALL generate magic links pointing to the frontend application for GraphQL-based verification
4. WHEN REST endpoint mode is configured THEN the system SHALL allow configuration of the frontend redirect URL for successful authentication
5. WHEN REST endpoint mode is configured THEN the system SHALL allow configuration of the error redirect URL for failed authentication

### Requirement 9

**User Story:** As a developer, I want the REST endpoint magic link verification to maintain the same security and compatibility standards as the GraphQL implementation, so that both authentication flows are equally secure and functional.

#### Acceptance Criteria

1. WHEN implementing REST endpoints THEN the system SHALL use the same token validation logic as GraphQL mutations
2. WHEN REST authentication is successful THEN the system SHALL generate the same JWT tokens as GraphQL authentication
3. WHEN REST authentication is successful THEN the system SHALL invalidate the magic link token to prevent reuse
4. WHEN REST endpoints are implemented THEN the system SHALL maintain the same rate limiting and security logging as GraphQL endpoints
5. WHEN REST endpoints are implemented THEN the system SHALL integrate with existing authentication middleware and error handling patterns

### Requirement 10

**User Story:** As a user, I want to be able to complete Google OAuth authentication through a REST endpoint that redirects me to the frontend with my authentication tokens, so that I can have a seamless OAuth login experience similar to magic links.

#### Acceptance Criteria

1. WHEN Google OAuth is configured for REST endpoint flow THEN the system SHALL provide GET endpoints for OAuth initiation and callback handling
2. WHEN a user initiates Google OAuth through REST endpoint THEN the system SHALL redirect to Google's OAuth authorization URL with proper parameters
3. WHEN Google OAuth callback is received THEN the system SHALL validate the authorization code and exchange it for user information
4. WHEN OAuth validation is successful THEN the system SHALL redirect the user to a configured frontend URL with access and refresh tokens as URL parameters
5. WHEN OAuth validation fails THEN the system SHALL redirect the user to a configured error page with an appropriate error message

### Requirement 11

**User Story:** As a system administrator, I want to configure whether OAuth flows use REST endpoints or GraphQL mutations, so that I can maintain consistent authentication patterns across all login methods.

#### Acceptance Criteria

1. WHEN configuring authentication methods THEN the system SHALL allow enabling REST endpoints for both magic link and Google OAuth flows
2. WHEN REST endpoint mode is enabled for OAuth THEN the system SHALL generate OAuth initiation URLs pointing to the API's REST endpoints
3. WHEN REST endpoint mode is enabled THEN the system SHALL use the same frontend redirect URLs for both magic link and OAuth successful authentication
4. WHEN REST endpoint mode is enabled THEN the system SHALL use the same error redirect URLs for both magic link and OAuth failed authentication
5. WHEN REST endpoint mode is configured THEN the system SHALL allow optional inclusion of user data in redirect URL parameters for both authentication methods
