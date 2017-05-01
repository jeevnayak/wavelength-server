var schema = `
type User {
  id: String!
  name: String!
  firstName: String!
  lastName: String!
  fbToken: String!
  partnerships: [Partnership]!
  dailyChallengeInfo: DailyChallengeInfo!
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
  lastUpdated: String!
  replayed: Boolean
  partnership: Partnership!
}

type DailyChallengeInfo {
  incomingRequests: [DailyChallengeRequest]!
  outgoingRequests: [DailyChallengeRequest]!
  games: [Game]!
}

type DailyChallengeRequest {
  id: Int!
  partner(userId: String!): User!
}

type Query {
  user(id: String!): User
  partnership(id: Int!): Partnership
  game(id: Int!): Game
  possibleWords(cluerId: String!, guesserId: String!, numWords: Int!): [String]!
}

type Mutation {
  updateUser(
    id: String!,
    name: String!,
    firstName: String!,
    lastName: String!,
    fbToken: String!
  ) : User

  addPushToken(
    userId: String!,
    pushToken: String!
  ) : User

  newGame(
    cluerId: String!,
    guesserId: String!,
    word: String!
  ) : Game

  giveClues(
    gameId: Int!,
    clues: [String]!,
  ) : Game

  makeGuesses(
    gameId: Int!,
    guesses: [String]!,
  ) : Game

  sendDailyChallengeRequest(
    fromUserId: String!,
    toUserId: String!,
  ) : DailyChallengeRequest

  acceptDailyChallengeRequest(
    requestId: Int!,
  ) : [Game]
}

schema {
  query: Query
  mutation: Mutation
}
`;

module.exports = schema
