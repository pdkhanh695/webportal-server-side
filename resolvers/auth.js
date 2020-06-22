const { gql } = require("apollo-server-express");
const shortid = require("shortid");
const { authCheck } = require("../helpers/auth");
const User = require("../models/user");
const { DataTimeResolver } = require("graphql-scalars");

const profile = async (parent, args, { req }) => {
  const currentUser = await authCheck(req); // if this line throw error
  // currentUser containt User email, we use that email to query data from MongoDB
  return await User.findOne({ email: currentUser.email }).exec();
};

const publicProfile = async (parent, args, { req }) => {
  //
  return await User.findOne({ username: args.username }).exec();
};

const allUsers = async (parent, args) => {
  return await User.find({}).exec();
};

const userCreate = async (parent, args, { req }) => {
  const currentUser = await authCheck(req);
  const user = await User.findOne({ email: currentUser.email });
  return user
    ? user
    : new User({
        email: currentUser.email,
        username: shortid.generate(),
      }).save();
};
const userUpdate = async (parent, args, { req }) => {
  //{req} = context.req
  const currentUser = await authCheck(req);
  //console.log(args);
  const updatedUser = await User.findOneAndUpdate(
    { email: currentUser.email },
    { ...args.input },
    { new: true }
  ).exec();
  return updatedUser;
};

module.exports = {
  Query: {
    profile: profile,
    publicProfile: publicProfile,
    allUsers: allUsers,
  },
  Mutation: {
    userCreate,
    userUpdate,
  },
};
