const app = require('./app.js');
const dotenv = require('dotenv');
dotenv.config("./.env");
const connectToDatabase = require('./db/database.js');
const http = require('http');
const server = http.createServer(app);
const { initilizeSocket } = require("./socket.js");
const { connectRedis } = require("./redisClient.js");

connectToDatabase().then(() => {
  initilizeSocket(server);  
  connectRedis();
  server.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
  });
})
.catch((error) => {
  console.error('Database connection failed:', error);
});
