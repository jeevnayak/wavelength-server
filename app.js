var bodyParser = require("body-parser");
var express = require("express");
var graphqlServerExpress = require("graphql-server-express");
var graphqlTools = require("graphql-tools");

var schema = require("./data/schema");
var resolvers = require("./data/resolvers");
var models = require("./data/models");

var app = express();
app.set("port", process.env.PORT || 5000);

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

models.db.sync().then(function() {
  app.listen(app.get("port"), function() {
    console.log("App listening on port", app.get("port"));
  });
});
