const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    // query that returns the current user, pulls the user's id from context
    me: async (parent, args, context) => {
      return await User.findOne({ _id: context.user._id });
    },

    // query that returns all users
    users: async () => {
      return await User.find({});
    },
  },

  Mutation: {
    // addUser mutation that returns an Auth object
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },

    // login mutation that returns an Auth object
    login: async (parent, { email, password }) => {
      const user = await User.findOne({
        $or: [{ username: email }, { email: email }],
      });
      if (!user) {
        return { message: "Can't find this user" };
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        return { message: "Wrong password!" };
      }

      const token = signToken(user);
      return { token, user };
    },

    // saveBook mutation that adds a book to the user and returns a User object, pulls the user's id from context
    saveBook: async (parent, args, context) => {
      return await User.findOneAndUpdate(
        { _id: context.user._id },
        { $addToSet: { savedBooks: { ...args } } },
        { new: true, runValidators: true }
      );
    },

    // removeBook mutation removes a book from the user and returns a User object, pulls the user's id from context
    removeBook: async (parent, { bookId }, context) => {
      return await User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks: { bookId: bookId } } },
        { new: true }
      );
    },
  },
};

module.exports = resolvers;