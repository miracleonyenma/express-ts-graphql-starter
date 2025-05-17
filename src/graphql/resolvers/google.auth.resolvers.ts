// ./src/graphql/resolvers/google.auth.resolvers.ts

import {
  getGoogleOAuthTokens,
  getGoogleUser,
} from "../../services/google.auth.services.js";
import User from "../../models/user.model.js";
import {
  accessTokenData,
  createAccessToken,
  createRefreshToken,
} from "../../utils/token.js";

const googleAuthResolvers = {
  Mutation: {
    googleAuth: async (parent, args, context, info) => {
      try {
        const code = args?.code;
        const redirect_uri = args?.redirect_uri;

        if (!code) {
          throw new Error("Invalid code");
        }
        const authTokens = await getGoogleOAuthTokens({ code, redirect_uri });

        if (authTokens.error) {
          throw new Error(authTokens.error);
        }
        const googleUser = await getGoogleUser({
          access_token: authTokens.access_token,
          id_token: authTokens.id_token,
        });

        // upsert user
        const user = await User.upsertGoogleUser({
          email: googleUser.email,
          firstName: googleUser.given_name,
          lastName: googleUser.family_name,
          picture: googleUser.picture,
          verified_email: googleUser.verified_email,
        });

        const accessToken = createAccessToken(accessTokenData(user));
        const refreshToken = createRefreshToken({ id: user._id });

        return { accessToken, refreshToken, user };
      } catch (error) {
        console.log("Mutation.googleAuth error", error);
        throw error;
      }
    },
  },
};

export default googleAuthResolvers;
