# Express TypeScript GraphQL Starter

A starter project for setting up a TypeScript Express server with Apollo GraphQL.

---

## Features

- **TypeScript**: Strongly typed language for writing scalable and maintainable code.
- **Express**: Fast, unopinionated, minimalist web framework for Node.js.
- **Apollo Server**: Spec-compliant and production-ready JavaScript GraphQL server.
- **PostgreSQL**: Database integration using Prisma ORM.
- **Authentication**: JWT-based authentication and Google OAuth.
- **Role Management**: Role-based access control for users.
- **Email Services**: Multi-provider email service with Nodemailer, ZeptoMail, and Resend support.
- **API Key Management**: Secure API key generation and validation.
- **Password Reset**: Secure password reset functionality.
- **Environment Configuration**: `.env` file support for managing sensitive configurations.

---

## Installation

### Prerequisites

- Node.js (v20 or later)
- PostgreSQL (local or cloud instance, e.g., Supabase)
- A `.env` file with the required environment variables (see below).

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/miracleonyenma/express-ts-graphql-starter.git
   ```

2. Navigate to the project directory:

   ```bash
   cd express-ts-graphql-starter
   ```

3. Install the dependencies:

```bash
express-ts-graphql-starter/
├── prisma/                # Prisma schema and migrations
├── src/
│   ├── config/                # Configuration files (e.g., database connection)
│   ├── graphql/               # GraphQL type definitions and resolvers
│   │   ├── typeDefs/          # GraphQL schema definitions
│   │   ├── resolvers/         # GraphQL resolvers
│   ├── middlewares/           # Express middlewares
│   ├── services/              # Business logic and service layer
│   ├── utils/                 # Utility functions (e.g., email, token generation)
│   │   ├── emails/            # Email service with multiple providers
│   ├── index.ts               # Entry point of the application
├── .env                       # Environment variables
├── tsconfig.json              # TypeScript configuration
├── package.json               # Project metadata and dependencies
├── Dockerfile                 # Docker configuration
├── docker-compose.dev.yml     # Docker Compose for development
├── docker-compose.prod.yml    # Docker Compose for production
├── README.md                  # Project documentation
```

---

## Key Features and Modules

### 1. **GraphQL API**

- **Type Definitions**: Located in `src/graphql/typeDefs/`.
- **Resolvers**: Located in `src/graphql/resolvers/`.

#### Example Queries and Mutations

- **User Queries**:

  ```graphql
  query {
    users {
      data {
        id
        firstName
        lastName
        email
      }
    }
  }
  ```

- **User Mutations**:

  ```graphql
  mutation {
    register(
      input: {
        firstName: "John"
        lastName: "Doe"
        email: "john.doe@example.com"
        password: "password123"
      }
    ) {
      user {
        id
        email
      }
    }
  }
  ```

### 2. **Authentication**

- **JWT Authentication**: Implemented in `src/utils/token.ts` and `src/middlewares/auth.middleware.ts`.
- **Google OAuth**: Handled in `src/services/google.auth.services.ts`.

### 3. **Role Management**

- Roles are defined in `prisma/schema.prisma`.
- Role setup is automated in `src/services/role.services.ts`.

### 4. **Email Services**

The email service module provides a flexible, provider-agnostic way to send emails with support for multiple email providers:

- **Multiple Provider Support**:

  - Nodemailer (Default) - Traditional SMTP-based email delivery
  - ZeptoMail - Transactional email API
  - Resend - Modern email API for developers

- **Email Templates**: Pre-built responsive templates for common use cases like welcome emails and password reset

- **Features**:
  - Template-based emails
  - Attachment support
  - CC/BCC functionality
  - Reply-to settings
  - Type-safe interfaces
  - Error handling
  - Social media links
  - Button actions

#### Basic Usage

```typescript
import { EmailService } from "./src/utils/emails";

// Create email service with preferred provider
const emailService = new EmailService("resend"); // or 'nodemailer' or 'zeptomail'

// Send a simple email
await emailService.sendEmail({
  subject: "Welcome to our service",
  htmlBody: "<h1>Hello there!</h1><p>Welcome to our platform.</p>",
  to: {
    email: "user@example.com",
    name: "John Doe",
  },
});
```

#### Using Templates

```typescript
import { EmailService } from "./src/utils/emails";

const emailService = new EmailService();

// Generate standard template
const template = emailService.generateStandardTemplate({
  title: "Welcome to Our Platform",
  content:
    "<p>Thank you for signing up! We hope you enjoy using our service.</p>",
  buttonText: "Get Started",
  buttonUrl: "https://example.com/dashboard",
  socialLinks: [
    { name: "Twitter", url: "https://twitter.com/example" },
    { name: "Instagram", url: "https://instagram.com/example" },
  ],
});

// Send email with template
await emailService.sendEmail({
  subject: "Welcome to Our Platform",
  htmlBody: template,
  to: {
    email: "user@example.com",
    name: "John Doe",
  },
});
```

#### Pre-made Email Templates

```typescript
import { EmailService } from "./src/utils/emails";

const emailService = new EmailService();

// Send welcome email
const welcomeTemplate = emailService.generateWelcomeEmail({
  userName: "John",
  verificationUrl: "https://example.com/verify?token=abc123",
  additionalContent: "<p>Here are some tips to get started...</p>",
});

// Send password reset email
const resetTemplate = emailService.generatePasswordResetEmail({
  userName: "Jane",
  resetUrl: "https://example.com/reset?token=xyz789",
  expiryTime: "24 hours",
});
```

#### Legacy Support

```typescript
import { mailSender, generateEmailTemplate } from "./src/utils/emails";

// Your existing code will continue to work
const emailBody = generateEmailTemplate(
  "Welcome",
  "<p>Thank you for signing up!</p>"
);

await mailSender("user@example.com", "Welcome", emailBody);
```

### 5. **API Key Management**

- API keys are generated and validated in `src/services/apiKey.services.ts` and `src/middlewares/apiKey.middleware.ts`.

### 6. **Password Reset**

- Password reset functionality is implemented in `src/services/passwordResetToken.services.ts`.

---

## Environment Variables

| Variable                    | Description                                                            |
| --------------------------- | ---------------------------------------------------------------------- |
| `PORT`                      | Port on which the server runs                                          |
| `DATABASE_URL`              | PostgreSQL connection string (pooling)                                 |
| `DIRECT_URL`                | PostgreSQL connection string (direct)                                  |
| `JWT_SECRET`                | Secret for signing JWT tokens                                          |
| `ACCESS_TOKEN_SECRET`       | Secret for access tokens                                               |
| `REFRESH_TOKEN_SECRET`      | Secret for refresh tokens                                              |
| `MAIL_USER`                 | Email address for sending emails                                       |
| `MAIL_PASS`                 | Password for the email account                                         |
| `MAIL_LOGO`                 | URL of the logo used in email templates                                |
| `APP_NAME`                  | Name of the application                                                |
| `APP_URL`                   | Base URL of the application                                            |
| `GOOGLE_CLIENT_ID`          | Google OAuth client ID                                                 |
| `GOOGLE_CLIENT_SECRET`      | Google OAuth client secret                                             |
| `GOOGLE_OAUTH_REDIRECT_URI` | Redirect URI for Google OAuth                                          |
| `ZOHO_KEY`                  | ZeptoMail API key for email service                                    |
| `RESEND_API_KEY`            | Resend API key for email service                                       |
| `DEFAULT_MAIL_PROVIDER`     | Default email provider to use ('nodemailer', 'zeptomail', or 'resend') |

---

## Scripts

- `npm run dev`: Run the development server with nodemon.
- `npm run build`: Build the project.
- `npm start`: Start the built project.

---

## Docker Support

### Development

To run the application in a Docker container for development:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Production

To run the application in a Docker container for production:

```bash
docker-compose -f docker-compose.prod.yml up --build
```

---

## Testing

Currently, no tests are implemented. You can add tests using a framework like **Jest** or **Mocha**.

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

## License

This project is licensed under the MIT License.

---

## Troubleshooting

### Common Issues

1. **Database Connection Error**:

   - Ensure PostgreSQL is running and the `DATABASE_URL` is correct.
   - If using Supabase, ensure you have both `DATABASE_URL` (pooling) and `DIRECT_URL` (direct) configured.

2. **Environment Variables Missing**:

   - Ensure you have a `.env` file with all required variables.

3. **Email Sending Issues**:
   - Verify your email credentials and ensure less secure app access is enabled for your email account.
   - For Gmail, you may need to generate an "App Password" if 2FA is enabled.
   - Check that the correct email provider is configured (DEFAULT_MAIL_PROVIDER).

---

## Future Improvements

- Add unit and integration tests.
- Implement rate limiting for API endpoints.
- Add support for more OAuth providers.
- Improve error handling and logging.
- Add more email templates for different scenarios.
- Support for AWS SES as an additional email provider.
