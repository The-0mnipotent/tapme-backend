declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
      SUPABASE_URL: string;
      SUPABASE_KEY: string;
      TELEGRAM_BOT_ID: string;
      // add more environment variables and their types here
    }
  }
}
