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
  partner(userId: String!): User!
  games: [Game]!
}

type Game {
  id: Int!
  word: String!
  cluerId: String!
  isCluer(userId: String!): Boolean!
  clues: [String]!
  guesses: [String]!
  replayed: Boolean
  partnership: Partnership!
}

type Query {
  user(id: String!): User
  partnership(id: Int!): Partnership
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

  giveClues(
    gameId: Int!,
    clues: [String]!,
  ) : Game

  makeGuesses(
    gameId: Int!,
    guesses: [String]!,
  ) : Game
}

schema {
  query: Query
  mutation: Mutation
}
`;

module.exports = schema
