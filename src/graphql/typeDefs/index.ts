import apiKeyTypeDefs from "./apiKey.js";
import otpTypeDefs from "./otp.js";
import roleTypeDefs from "./role.js";
import userTypeDefs from "./user.js";

const globalTypeDefs = `#graphql
  input Pagination {
    page: Int
    limit: Int
  }

  type Meta {
    page: Int
    limit: Int
    pages: Int
    total: Int
  }
`;

const typeDefs = `
  ${globalTypeDefs}
  ${userTypeDefs}
  ${roleTypeDefs}
  ${otpTypeDefs}
  ${apiKeyTypeDefs}
`;

export default typeDefs;
