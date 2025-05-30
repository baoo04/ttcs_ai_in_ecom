This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started
//first
npm install

//Create API Key of Gemini then create the .env.local like this 
DB_HOST=localhost    
DB_USER=root
DB_PASS=baodang123   //replace with your password
DB_NAME=inventory_db  // write sql to generate the database first
DB_PORT=3306   // default port
GEMINI_API_KEY=AIzaSyBXTLHoqw-TUvVAzF5zSe5oQmZIJBB5DWA  // gen your own key


after create database, create the inventory_item table (only use this table, i have not create another yet)


First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

