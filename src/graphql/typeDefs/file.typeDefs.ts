const fileTypeDefs = `#graphql
  type File {
    id: ID!
    name: String!
    type: String!
    size: Int!
    provider: String!
    key: String!
    url: String!
    user: User
    purpose: String
    createdAt: String!
    updatedAt: String!
  }

  type FileEdge {
    cursor: String!
    node: File!
  }

  type PaginatedFiles {
    totalCount: Int!
    edges: [FileEdge!]!
    pageInfo: PageInfo!
  }

  extend type Query {
    getFile(id: ID!): File
    getFiles(page: Int, limit: Int): PaginatedFiles
  }

  extend type Mutation {
    deleteFile(id: ID!): SuccessResponse!
  }
`;

export default fileTypeDefs;
