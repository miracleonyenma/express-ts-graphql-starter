import ApiKeyResolvers from "./apiKey.resolvers.js";
import OTPResolvers from "./otp.resolvers.js";
import roleResolvers from "./role.resolvers.js";
import userResolvers from "./user.resolvers.js";

const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...roleResolvers.Query,
    ...OTPResolvers.Query,
    ...ApiKeyResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...roleResolvers.Mutation,
    ...OTPResolvers.Mutation,
    ...ApiKeyResolvers.Mutation,
  },
};

export default resolvers;
