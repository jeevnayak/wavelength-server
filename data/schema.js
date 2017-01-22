var schema = `
type User {
  id: String
  name: String
  firstName: String
  lastName: String
  fbToken: String
}

type Query {
  user(id: String): User
}

schema {
  query: Query
}
`;

module.exports = schema
