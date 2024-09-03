import { makeExecutableSchema } from "@graphql-tools/schema";
import supabase from "./index";

const typeDefs = `
  type Query {
    getUser(username: String!): User
  }

  type Mutation {
    addUser(username: String!): User
    updateUserCoins(username: String!, coins: Int!): User
  }

  type User {
    id: ID!
    username: String!
    coins: Int!
  }
`;

const resolvers = {
  Query: {
    getUser: async (_: any, { username }: { username: string }) => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .single();

      if (error) {
        throw new Error("User not found");
      }

      return data;
    },
  },
  Mutation: {
    addUser: async (_: any, { username }: { username: string }) => {
      const { data, error } = await supabase
        .from("users")
        .insert([{ username, coins: 0 }])
        .single();

      if (error) {
        throw new Error("User already exists");
      }

      return data;
    },
    updateUserCoins: async (
      _: any,
      { username, coins }: { username: string; coins: number }
    ) => {
      const { data, error } = await supabase
        .from("users")
        .update({ coins })
        .eq("username", username)
        .single();

      if (error) {
        throw new Error("Error updating coins");
      }

      return data;
    },
  },
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
