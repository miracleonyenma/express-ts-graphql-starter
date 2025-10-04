// src/graphql/resolvers/magicLink.resolvers.ts

import MagicLinkService from "../../services/magicLink.services.js";
import { ErrorHandler } from "../../services/error.services.js";

const magicLinkResolvers = {
  Mutation: {
    /**
     * Request a magic link to be sent to the specified email address
     * Handles rate limiting and email validation
     * Returns success status without revealing if email exists in system
     */
    requestMagicLink: async (parent, args, context, info) => {
      try {
        const magicLinkService = new MagicLinkService();
        const { email } = args.input;

        return await magicLinkService.requestMagicLink(email);
      } catch (error) {
        console.log("Mutation.requestMagicLink error", error);
        throw ErrorHandler.handleError(error);
      }
    },

    /**
     * Verify a magic link token and authenticate the user
     * Validates token, checks expiration, and returns authentication data
     * Returns same token structure as other authentication methods
     */
    verifyMagicLink: async (parent, args, context, info) => {
      try {
        const magicLinkService = new MagicLinkService();
        const { token } = args.input;

        return await magicLinkService.verifyMagicLink(token);
      } catch (error) {
        console.log("Mutation.verifyMagicLink error", error);
        throw ErrorHandler.handleError(error);
      }
    },
  },
};

export default magicLinkResolvers;
