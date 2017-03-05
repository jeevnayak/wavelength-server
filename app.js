var bodyParser = require("body-parser");
var express = require("express");
var graphqlServerExpress = require("graphql-server-express");
var graphqlTools = require("graphql-tools");

var loaders = require("./data/loaders");
var models = require("./data/models");
var resolvers = require("./data/resolvers");
var schema = require("./data/schema");

var app = express();
app.set("port", process.env.PORT || 5000);

var executableSchema = graphqlTools.makeExecutableSchema({
  typeDefs: schema,
  resolvers: resolvers
});

app.use("/graphql", bodyParser.json(), graphqlServerExpress.graphqlExpress({
  schema: executableSchema,
  context: {
    loaders: loaders.createLoaders()
  }
}));

app.use("/graphiql", graphqlServerExpress.graphiqlExpress({
  endpointURL: "/graphql"
}));

models.db.sync().then(() => {
  app.listen(app.get("port"), () => {
    console.log("App listening on port", app.get("port"));
  });
});
