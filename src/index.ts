// import { createClient } from "@supabase/supabase-js";
// import dotenv from "dotenv";
// import { createYoga } from "graphql-yoga";
// import { createServer } from "http";
// import TelegramBot, { Message } from "node-telegram-bot-api";
// import { schema } from "./schema";
// import { NextFunction, Request, Response } from "express";

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

//     // Use ngrok or any public URL for testing instead of localhost
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

// // Middleware to add CORS headers
// const addCorsHeaders = (req: Request, res: Response, next: NextFunction) => {
//   res.setHeader('Access-Control-Allow-Origin', 'https://tapme-arpit-frontend.netlify.app');
//   res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   res.setHeader('Access-Control-Allow-Credentials', 'true');

//   // Handle preflight requests
//   if (req.method === 'OPTIONS') {
//     return res.sendStatus(204);
//   }

//   next();
// };

// // GraphQL Yoga server setup
// const yoga = createYoga({ schema });

// // const server = createServer(yoga);
// // Create and configure the HTTP server
// const server = createServer((req, res) => {
//   addCorsHeaders(req, res, () => {

//     yoga.requestListener(req, res);
//   });
// });

// server.listen(4000, () => {
//   console.log("Server is running on http://localhost:4000");
// });

// export default supabase;

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
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

// Express app and middleware
const app = express();

// Middleware to add CORS headers
const addCorsHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://tapme-arpit-frontend.netlify.app"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
};

app.use(addCorsHeaders);

// GraphQL Yoga server setup with Express
const yoga = createYoga({
  schema,
  context: ({ req }: { req: Request }) => ({ req }),
  graphqlEndpoint: "/", // GraphQL endpoint
});

app.use(yoga.graphqlEndpoint, yoga.requestListener);

// Create and start the HTTP server
const server = createServer(app);

server.listen(4000, () => {
  console.log("Server is running on http://localhost:4000");
});

export default supabase;
