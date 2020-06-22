const express = require("express");
const { ApolloServer, gql, PubSub } = require("apollo-server-express");

const http = require("http");
const path = require("path");

const mongoose = require("mongoose");
const {
  fileLoader,
  mergeTypes,
  mergeResolvers,
} = require("merge-graphql-schemas");

require("dotenv").config();

const { authCheckMiddleware } = require("./helpers/auth");
const cors = require("cors");
const bodyPaser = require("body-parser");
const cloudinary = require("cloudinary");

const pubsub = new PubSub();

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

//middlewares
app.use(cors());
app.use(bodyPaser.json({ limit: "5mb" }));
// typeDefs
const typeDefs = mergeTypes(fileLoader(path.join(__dirname, "./typeDefs")));
const resolvers = mergeResolvers(
  fileLoader(path.join(__dirname, "./resolvers"))
);

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req, pubsub }),
});

// applyMiddleware mothod connect ApolloServer to a specific HTTP framework is: express
apolloServer.applyMiddleware({ app }); // if we have the same key and value we jusy need key

const httpserver = http.createServer(app);
apolloServer.installSubscriptionHandlers(httpserver);
// now we can use as GraphQl and Rest server
//before execute function we apply middleware
app.get("/rest", authCheckMiddleware, function (req, res) {
  res.json({
    data: "you hit rest endpoint great!",
  });
});

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload endpoint
app.post("/uploadimages", authCheckMiddleware, (req, res) => {
  cloudinary.uploader.upload(
    req.body.image,
    (result) => {
      //console.log(result);
      // function callback

      res.send({
        url: result.secure_url, //result.url, //for HTTP
        public_id: result.public_id,
      });
    },
    {
      public_id: `${Date.now()}`, // public name
      resource_type: "auto", // JPEG, PNG
    }
  );
});

// remove the image
app.post("/removeimage", authCheckMiddleware, (req, res) => {
  let image_id = req.body.public_id; //we first need image ID

  cloudinary.uploader.destroy(image_id, (error, result) => {
    if (error) return res.json({ success: false, error });
    res.send("ok");
  });
});

httpserver.listen(process.env.PORT, function () {
  console.log(`Server is ready at http://localhost:${process.env.PORT}`);
  console.log(
    `GraphQL server is ready at http://localhost:${process.env.PORT}${apolloServer.graphqlPath}`
  );
  console.log(
    `Subcription is ready at http://localhost:${process.env.PORT}${apolloServer.subscriptionsPath}`
  );
});
