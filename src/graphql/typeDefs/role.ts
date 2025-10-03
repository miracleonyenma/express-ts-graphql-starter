// ./src/graphql/role.ts

const roleTypeDefs = `#graphql
  type Role {
    id: ID!
    name: String!
  }

  type Query {
    roles: [Role]
  }

  type Mutation {
    createRole(name: String!): Role
    deleteRole(id: ID!): Role
  }
`;

export default roleTypeDefs;
