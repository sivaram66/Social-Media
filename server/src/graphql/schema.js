const { gql } = require("apollo-server-express");
const { getFeedPosts, getPostById } = require("../models/post");
const { getUserById } = require("../models/user");

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    full_name: String
    email: String
  }

  type Post {
    id: ID!
    user_id: Int!
    content: String!
    media_url: String
    comments_enabled: Boolean!
    created_at: String!
    username: String
    full_name: String
    like_count: Int
    comment_count: Int
  }

  type Query {
    # Requires a valid JWT. Returns posts from the user and people they follow.
    feed(page: Int = 1, limit: Int = 10): [Post]

    # Fetch a single post (no auth required)
    post(id: ID!): Post

    # Current logged-in user (null if not logged in)
    me: User
  }
`;

const resolvers = {
  Query: {
    feed: async (_, { page, limit }, { user }) => {
      if (!user) throw new Error("Unauthorized");
      const offset = (page - 1) * limit;
      return getFeedPosts(user.userId, limit, offset);
    },
    post: async (_, { id }) => {
      const numericId = Number(id);
      if (!Number.isInteger(numericId)) return null;
      return getPostById(numericId);
    },
    me: async (_, __, { user }) => {
      if (!user) return null;
      return getUserById(user.userId);
    },
  },
};

module.exports = { typeDefs, resolvers };
