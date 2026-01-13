// ./src/index.ts

import { Request, RequestHandler, Response, NextFunction } from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import { config } from "dotenv";
import connectDB from "./config/db.js";
import loggerMiddleware from "./middlewares/logger.middleware.js";
import typeDefs from "./graphql/typeDefs/index.js";
import resolvers from "./graphql/resolvers/index.js";
import { authenticate } from "./middlewares/auth.middleware.js";
import {
  validateApiKey,
  ApiKeyRequest,
} from "./middlewares/apiKey.middleware.js";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middlewares/error.middleware.js";
import { ApiError } from "./services/error.services.js";
import ApiKey from "./models/apiKey.model.js";
import s3Router from "./routes/upload.routes.js";
import authRouter from "./routes/auth.routes.js";
import { formatIPUrl } from "@untools/ip-url";

interface MyContext {
  token?: string;
  user?: any;
}

config();

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;

// Required logic for integrating with Express
const app = express();
// Our httpServer handles incoming requests to our Express app.
// Below, we tell Apollo Server to "drain" this httpServer,
// enabling our servers to shut down gracefully.
const httpServer = http.createServer(app);

// Same ApolloServer initialization as before, plus the drain plugin
// for our httpServer.
const server = new ApolloServer<MyContext>({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  introspection: true,
});
// Ensure we wait for our server to start
await server.start();

// our loggerMiddleware.
app.use(loggerMiddleware);

app.use("/api/s3", validateApiKey({ populateOwner: true }), s3Router);

// Auth routes (magic link and OAuth REST endpoints)
app.use("/api/auth", authRouter);

// validate API Key middleware
app.use(validateApiKey() as RequestHandler);

// Set up our Express middleware to handle CORS, body parsing,
// and our expressMiddleware function.
app.use(
  "/graphql",
  authenticate({
    soft: true,
    skipPaths: [
      { path: "/graphql", method: "GET" },
      { path: "/graphql", method: "OPTIONS" },
      { path: "/", method: "GET" },
      { path: "/", method: "OPTIONS" },
    ],
  }),
  cors<cors.CorsRequest>(),
  express.json(),
  (req, res, next) => {
    // set req.body to {} if it is not set
    req.body = req.body || {};
    next();
  }
);

// Create a separate middleware for Apollo Server to avoid type conflicts
const apolloMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Using 'as any' to bypass TypeScript's type checking for Express/Apollo compatibility
    const middleware = expressMiddleware(server, {
      context: async ({ req: apolloReq }) => {
        // Access the user from the request
        const user = (apolloReq as any).user;
        return { user } as MyContext;
      },
    }) as any;

    // Invoke the middleware function with the request/response/next objects
    return middleware(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Apply the Apollo middleware
app.use("/graphql", apolloMiddleware as RequestHandler);

// // API routes
// app.use('/api/v1', routes);

// health check
app.get("/health", (req, res) => {
  res.send("OK");
});

// Handle 404 errors for any other routes
app.use(notFoundMiddleware);

// Global error handler - must be last
app.use(
  (err: Error | ApiError, req: Request, res: Response, next: NextFunction) => {
    errorMiddleware(err, req, res, next);
  }
);

// connect database
connectDB();

// Modified server startup
await new Promise<void>((resolve) =>
  httpServer.listen({ port: PORT }, resolve)
);
console.log(`🚀 Server ready at http://localhost:${PORT}/`);
console.log(`🚀 Server ready on network at ${formatIPUrl(PORT as number)}`);
