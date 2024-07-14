const userTypeDefs = `#graphql
  type User {
    id: ID
    name: String
    email: String
    emailVerified: Boolean
    roles: [Role]
  }

  type UserData {
    data: [User]
    meta: Meta
  }

  type AuthData {
    accessToken: String
    refreshToken: String
    user: User
  }

  type RegisterData {
    user: User
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateUserInput {
    name: String
    email: String
  }

  type RefreshPayload {
    accessToken: String!
  }


  type Query {
    users(pagination: Pagination): UserData
    user(id: ID!): User
    me: User
  }

  type Mutation {
    register(input: RegisterInput!): RegisterData
    login(input: LoginInput!): AuthData
    refreshToken(token: String!): RefreshPayload!
    updateUser(input: UpdateUserInput!): User
    deleteUser(id: ID!): User
  }
`;

export default userTypeDefs;
