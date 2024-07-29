import ApiKeyResolvers from "./apiKey.resolvers.js";
import googleAuthResolvers from "./google.auth.resolvers.js";
import OTPResolvers from "./otp.resolvers.js";
import roleResolvers from "./role.resolvers.js";
import URLResolvers from "./url.resolvers.js";
import userResolvers from "./user.resolvers.js";

const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...roleResolvers.Query,
    ...OTPResolvers.Query,
    ...ApiKeyResolvers.Query,
    ...URLResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...roleResolvers.Mutation,
    ...OTPResolvers.Mutation,
    ...ApiKeyResolvers.Mutation,
    ...URLResolvers.Mutation,
    ...googleAuthResolvers.Mutation,
  },
};

export default resolvers;
