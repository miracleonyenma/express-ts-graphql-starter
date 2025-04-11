# Express TypeScript GraphQL Starter

A starter project for setting up a TypeScript Express server with Apollo GraphQL.

---

## Features

- **TypeScript**: Strongly typed language for writing scalable and maintainable code.
- **Express**: Fast, unopinionated, minimalist web framework for Node.js.
- **Apollo Server**: Spec-compliant and production-ready JavaScript GraphQL server.
- **MongoDB**: Database integration using Mongoose.
- **Authentication**: JWT-based authentication and Google OAuth.
- **Role Management**: Role-based access control for users.
- **Email Services**: Nodemailer integration for sending emails.
- **API Key Management**: Secure API key generation and validation.
- **Password Reset**: Secure password reset functionality.
- **Environment Configuration**: `.env` file support for managing sensitive configurations.

---

## Installation

### Prerequisites

- Node.js (v20 or later)
- MongoDB (local or cloud instance)
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
    npm install
    ```

4. Create a `.env` file in the root directory and configure the following variables:

    ```env
    PORT=4000
    MONGO_URI=mongodb://localhost:27017/your-database
    JWT_SECRET=your-jwt-secret
    ACCESS_TOKEN_SECRET=your-access-token-secret
    REFRESH_TOKEN_SECRET=your-refresh-token-secret
    MAIL_USER=your-email@example.com
    MAIL_PASS=your-email-password
    MAIL_LOGO=https://example.com/logo.png
    APP_NAME=YourAppName
    APP_URL=http://localhost:4000
    GOOGLE_CLIENT_ID=your-google-client-id
    GOOGLE_CLIENT_SECRET=your-google-client-secret
    GOOGLE_OAUTH_REDIRECT_URI=http://localhost:4000/auth/google/callback
    ```

5. Start the development server:

    ```bash
    npm run dev
    ```

6. The server will be running on `http://localhost:4000`.

---

## Project Structure

```bash
express-ts-graphql-starter/
├── src/
│   ├── config/                # Configuration files (e.g., database connection)
│   ├── graphql/               # GraphQL type definitions and resolvers
│   │   ├── typeDefs/          # GraphQL schema definitions
│   │   ├── resolvers/         # GraphQL resolvers
│   ├── middlewares/           # Express middlewares
│   ├── models/                # Mongoose models
│   ├── services/              # Business logic and service layer
│   ├── utils/                 # Utility functions (e.g., email, token generation)
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
      register(input: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123"
      }) {
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

- Roles are defined in `src/models/role.model.ts`.
- Role setup is automated in `src/services/role.services.ts`.

### 4. **Email Services**

- Email templates and sending logic are implemented in `src/utils/mail.ts`.
- Used for:
  - Email verification
  - Password reset

### 5. **API Key Management**

- API keys are generated and validated in `src/models/apiKey.model.ts` and `src/middlewares/apiKey.middleware.ts`.

### 6. **Password Reset**

- Password reset functionality is implemented in `src/services/passwordResetToken.services.ts`.

---

## Environment Variables

| Variable                  | Description                                   |
|---------------------------|-----------------------------------------------|
| `PORT`                    | Port on which the server runs                |
| `MONGO_URI`               | MongoDB connection string                    |
| `JWT_SECRET`              | Secret for signing JWT tokens                |
| `ACCESS_TOKEN_SECRET`     | Secret for access tokens                     |
| `REFRESH_TOKEN_SECRET`    | Secret for refresh tokens                    |
| `MAIL_USER`               | Email address for sending emails             |
| `MAIL_PASS`               | Password for the email account               |
| `MAIL_LOGO`               | URL of the logo used in email templates      |
| `APP_NAME`                | Name of the application                      |
| `APP_URL`                 | Base URL of the application                  |
| `GOOGLE_CLIENT_ID`        | Google OAuth client ID                       |
| `GOOGLE_CLIENT_SECRET`    | Google OAuth client secret                   |
| `GOOGLE_OAUTH_REDIRECT_URI` | Redirect URI for Google OAuth              |

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

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running and the `MONGO_URI` is correct.

2. **Environment Variables Missing**:
   - Ensure you have a `.env` file with all required variables.

3. **Email Sending Issues**:
   - Verify your email credentials and ensure less secure app access is enabled for your email account.

---

## Future Improvements

- Add unit and integration tests.
- Implement rate limiting for API endpoints.
- Add support for more OAuth providers.
- Improve error handling and logging.
