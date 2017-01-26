var schema = `
type User {
  id: String!
  name: String!
  firstName: String!
  lastName: String!
  fbToken: String!
  partnerships: [Partnership]!
}

type Partnership {
  id: Int!
  users: [User]!
  games: [Game]!
}

type Game {
  id: Int!
  word: String!
  cluerId: String!
  clues: String
  guesses: String
  replayed: Boolean
  partnership: Partnership!
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

  newGame(
    cluerId: String!,
    guesserId: String!,
  ) : Game
}

schema {
  query: Query
  mutation: Mutation
}
`;

module.exports = schema
