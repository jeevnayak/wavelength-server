var bodyParser = require("body-parser");
var express = require("express");
var graphqlServerExpress = require("graphql-server-express");
var graphqlTools = require("graphql-tools");
var raven = require("raven");

var loaders = require("./data/loaders");
var models = require("./data/models");
var resolvers = require("./data/resolvers");
var schema = require("./data/schema");

var app = express();
app.set("port", process.env.PORT || 5000);

raven.config("https://2708fb4da3074c499c891cd4a50040c9:4f69d03fd5ea47158b367a74fdafeb39@sentry.io/178891").install();
app.use(raven.requestHandler());
app.use(raven.errorHandler());

var executableSchema = graphqlTools.makeExecutableSchema({
  typeDefs: schema,
  resolvers: resolvers
});

app.use("/graphql", bodyParser.json(), graphqlServerExpress.graphqlExpress(
  (req) => ({
    schema: executableSchema,
    context: {
      loaders: loaders.createLoaders()
    }
  })));

app.use("/graphiql", graphqlServerExpress.graphiqlExpress({
  endpointURL: "/graphql"
}));

models.db.sync().then(() => {
  app.listen(app.get("port"), () => {
    console.log("App listening on port", app.get("port"));
  });
});
