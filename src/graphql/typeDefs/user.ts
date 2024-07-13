const userTypeDefs = `#graphql
  type User {
    id: ID
    name: String
    email: String
    verified: Boolean
    roles: [Role]
  }

  type UserData {
    data: [User]
    meta: Meta
  }

  type AuthData {
    token: String
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


  type Query {
    users(pagination: Pagination): UserData
    user(id: ID!): User
    me: User
  }

  type Mutation {
    register(input: RegisterInput!): AuthData
    login(input: LoginInput!): AuthData
    updateUser(input: UpdateUserInput!): User
    deleteUser(id: ID!): User
  }
`;

export default userTypeDefs;
