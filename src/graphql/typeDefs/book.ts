const bookTypeDefs = `#graphql
  type Book {
    title: String
  }

  type Query {
    books: [Book]
  }
`;

export default bookTypeDefs;
