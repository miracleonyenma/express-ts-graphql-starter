const googleAuthTypeDefs = `#graphql

# Define the Mutation type
type Mutation {
  googleAuth(code: String!): AuthData
}
`;

export default googleAuthTypeDefs;
