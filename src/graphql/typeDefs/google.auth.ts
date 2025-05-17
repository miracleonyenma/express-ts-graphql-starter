// ./src/graphql/typeDefs/google.auth.ts

const googleAuthTypeDefs = `#graphql

# Define the Mutation type
type Mutation {
  googleAuth(code: String!, redirect_uri: String): AuthData
}
`;

export default googleAuthTypeDefs;
