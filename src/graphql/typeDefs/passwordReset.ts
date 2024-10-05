const passwordResetTypeDefs = `#graphql
type PasswordResetToken {
  id: ID
  userId: ID!
  token: String!
  expires: String!
}

type Mutation {
  requestPasswordReset(email: String!): Boolean
  resetPassword(token: String!, password: String!): Boolean
}

`;

export default passwordResetTypeDefs;
