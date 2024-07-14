const apiKeyTypeDefs = `#graphql

type ApiKey {
  id: ID
  key: String
  owner: User
  createdAt: String
}

type Query {
  apiKeys: [ApiKey]
  apiKey(id: ID!): ApiKey
}

# Define the Mutation type
type Mutation {
  generateApiKey: ApiKey
  revokeApiKey(id: ID!): ApiKey
}
`;

export default apiKeyTypeDefs;
