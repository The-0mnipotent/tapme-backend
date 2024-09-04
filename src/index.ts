// import { createClient } from "@supabase/supabase-js";
// import dotenv from "dotenv";
// import { createYoga } from "graphql-yoga";
// import { createServer } from "http";
// import TelegramBot, { Message } from "node-telegram-bot-api";
// import { schema } from "./schema";

// // Load environment variables from .env file
// dotenv.config();

// // Supabase configuration
// const supabaseUrl = process.env.SUPABASE_URL as string;
// const supabaseKey = process.env.SUPABASE_KEY as string;
// const supabase = createClient(supabaseUrl, supabaseKey);

// // Telegram bot setup
// const bot = new TelegramBot(process.env.TELEGRAM_BOT_ID as string, {
//   polling: true,
// });

// bot.onText(/\/start/, async (msg: Message) => {
//   const chatId = msg.chat.id;
//   const username = msg.chat.username || `user_${chatId}`;

//   try {
//     // Check if the user already exists
//     const { data: existingUser, error: fetchError } = await supabase
//       .from("users")
//       .select("*")
//       .eq("username", username)
//       .single();

//     if (fetchError && fetchError.code !== "PGRST116") {
//       throw fetchError;
//     }

//     if (!existingUser) {
//       // Insert a new user if not already present
//       const { data, error } = await supabase
//         .from("users")
//         .insert([{ username, coins: 0 }]);

//       if (error) {
//         throw error;
//       }

//       console.log("Supabase Insert Response:", { data });
//     }

//     const playUrl = `https://tapme-arpit-frontend.netlify.app/?username=${username}`;

//     bot.sendMessage(
//       chatId,
//       `Welcome to TapMe, ${username}! Your account has been created.`,
//       {
//         reply_markup: {
//           inline_keyboard: [[{ text: "Play TapMe", url: playUrl }]],
//         },
//       }
//     );
//   } catch (error) {
//     console.error("Error processing /start command:", error);

//     bot.sendMessage(chatId, "An error occurred while processing your request.");
//   }
// });

// // GraphQL Yoga server setup
// const yoga = createYoga({
//   schema,
//   cors: {
//     origin: "https://tapme-arpit-frontend.netlify.app",
//     credentials: true,
//   },
//   landingPage: true,
// });
// const server = createServer(yoga);

// server.listen(4000, () => {
//   console.log("Server is running on http://localhost:4000");
// });

// export default supabase;

import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import dotenv from "dotenv";
import { createYoga } from "graphql-yoga";
import { createServer } from "http";
import TelegramBot, { Message } from "node-telegram-bot-api";
import { schema } from "./schema";

// Load environment variables from .env file
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

// Telegram bot setup
const bot = new TelegramBot(process.env.TELEGRAM_BOT_ID as string, {
  polling: true,
});

bot.onText(/\/start/, async (msg: Message) => {
  const chatId = msg.chat.id;
  const username = msg.chat.username || `user_${chatId}`;

  try {
    // Check if the user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    if (!existingUser) {
      // Insert a new user if not already present
      const { data, error } = await supabase
        .from("users")
        .insert([{ username, coins: 0 }]);

      if (error) {
        throw error;
      }

      console.log("Supabase Insert Response:", { data });
    }

    const playUrl = `https://tapme-arpit-frontend.netlify.app/?username=${username}`;

    bot.sendMessage(
      chatId,
      `Welcome to TapMe, ${username}! Your account has been created.`,
      {
        reply_markup: {
          inline_keyboard: [[{ text: "Play TapMe", url: playUrl }]],
        },
      }
    );
  } catch (error) {
    console.error("Error processing /start command:", error);

    bot.sendMessage(chatId, "An error occurred while processing your request.");
  }
});

// GraphQL Yoga server setup with CORS
const corsOptions = {
  origin: "https://tapme-arpit-frontend.netlify.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

const yoga = createYoga({
  schema,
  cors: corsOptions,
  landingPage: true,
});

const server = createServer((req, res) => {
  // Apply CORS middleware
  cors(corsOptions)(req, res, () => {
    // Handle GraphQL requests
    yoga(req, res);
  });
});

server.listen(4000, () => {
  console.log("Server is running on http://localhost:4000");
});

export default supabase;
