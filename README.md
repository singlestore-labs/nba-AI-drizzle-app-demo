# NBA 2016 Finals Game 7 Analysis

An AI-powered app to generate comments and statistics about the NBA 2016 Finals Game 7 using Drizzle ORM and SingleStore.

## Features

- Generate insightful comments on the game using an AI agent
- Provide detailed statistics and analysis based on the video clip
- Utilize Drizzle ORM for database interactions
- Powered by SingleStore for efficient data handling

## Installation

1. Clone the repository:

   ```bash
   git clone git@github.com:singlestore-labs/nba-AI-drizzle-app-demo.git
   ```

2. Navigate to the project directory:

   ```bash
   cd nba-AI-drizzle-app-demo
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

## Setup

1. Rename the `default.env` file into `.env`:

   ```bash
   mv default.env .env
   ```

2. Get the `DB_URL` from [SingleStore Portal](https://portal.singlestore.com) and add it to your `.env` file:

   ```env
   DB_URL=your_singlestore_db_url
   ```

3. Create the `commentary_table` in the SingleStore database using Drizzle

   ```shell
   pnpm migrate
   ```

4. Get the Gemini API key from [Google Gemini API Documentation](https://ai.google.dev/gemini-api/docs/api-key) and add it to your `.env` file:

   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ```

## Usage

1. Start the application:
   ```bash
   pnpm dev
   ```
2. Open your browser and navigate to [http://localhost:3001](http://localhost:3001)
