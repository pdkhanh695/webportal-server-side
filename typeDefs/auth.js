const { gql } = require("apollo-server-express");

module.exports = gql`
  type Query {
    me: String!
  }

  type Image {
    url: String
    public_id: String
  }
  # user type
  type User {
    _id: ID!
    username: String
    name: String
    email: String
    images: [Image]
    about: String
    createdAt: String
    updatedAt: String
  }
  #Custom type
  type UserCreateResponse {
    username: String!
    email: String!
  }
  # Images Input Type
  input ImageInput {
    url: String
    public_id: String
  }
  # Input type
  input UserUpdateInput {
    username: String
    email: String
    name: String
    images: [ImageInput]
    about: String
  }
  #Query: to query all the user information to update form
  type Query {
    profile: User!
  }
  type Mutation {
    userCreate: UserCreateResponse!
    userUpdate(input: UserUpdateInput): User! # return User type
  }
`;
