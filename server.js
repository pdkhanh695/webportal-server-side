const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");

const http = require("http");
const path = require("path");

const mongoose = require("mongoose");
const {
  fileLoader,
  mergeTypes,
  mergeResolvers,
} = require("merge-graphql-schemas");

require("dotenv").config();

const { authCheck } = require("./helpers/auth");
//express server
const app = express();

//db
const db = async () => {
  try {
    const success = await mongoose.connect(process.env.DATABASE, {
      useNewUrlParse: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log("DB connected");
  } catch (error) {
    console.log("DB connection error", error);
  }
};

// execute database connection
db();

// typeDefs
const typeDefs = mergeTypes(fileLoader(path.join(__dirname, "./typeDefs")));
const resolvers = mergeResolvers(
  fileLoader(path.join(__dirname, "./resolvers"))
);

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ req, res }),
});

// applyMiddleware mothod connect ApolloServer to a specific HTTP framework is: express
apolloServer.applyMiddleware({ app }); // if we have the same key and value we jusy need key

const httpserver = http.createServer(app);
// now we can use as GraphQl and Rest server
//before execute function we apply middleware
app.get("/rest", authCheck, function (req, res) {
  res.json({
    data: "you hit rest endpoint great!",
  });
});

httpserver.listen(process.env.PORT, function () {
  console.log(`Server is ready at http://localhost:${process.env.PORT}`);
  console.log(
    `GraphQL server is ready at http://localhost:${process.env.PORT}${apolloServer.graphqlPath}`
  );
});
