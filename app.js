var bodyParser = require("body-parser");
var express = require("express");
var graphqlServerExpress = require("graphql-server-express");
var graphqlTools = require("graphql-tools");

var schema = require("./data/schema");
var resolvers = require("./data/resolvers");

var app = express();

var executableSchema = graphqlTools.makeExecutableSchema({
  typeDefs: schema,
  resolvers: resolvers
});

app.use("/graphql", bodyParser.json(), graphqlServerExpress.graphqlExpress({
  schema: executableSchema
}));

app.use("/graphiql", graphqlServerExpress.graphiqlExpress({
  endpointURL: "/graphql"
}));

app.listen(5000, function() {
  console.log("App listening on port 5000");
});
