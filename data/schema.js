var schema = `
type User {
  id: String!
  name: String!
  firstName: String!
  lastName: String!
  fbToken: String!
}

type Query {
  user(id: String!): User
}

type Mutation {
  updateUser(
    id: String!,
    name: String!,
    firstName: String!,
    lastName: String!,
    fbToken: String!
  ) : User
}

schema {
  query: Query
  mutation: Mutation
}
`;

module.exports = schema
