const { gql } = require("apollo-server-express");
const shortid = require("shortid");
const { authCheck } = require("../helpers/auth");
const User = require("../models/user");

const profile = async (parent, args, { req }) => {
  const currentUser = await authCheck(req); // if this line throw error
  // currentUser containt User email, we use that email to query data from MongoDB
  return await User.findOne({ email: currentUser.email }).exec();
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
  },
  Mutation: {
    userCreate,
    userUpdate,
  },
};
