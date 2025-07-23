const dotenv = require('dotenv');
dotenv.config({ path: "./.env" });
const redis = require("redis");

const redisClient = redis.createClient({
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

async function connectRedis() {
  await redisClient.connect().then(() => {
    console.log("Redis client connected");
  }).catch((err) => {
    console.error("Error connecting to Redis client:", err);
  });
}

module.exports = { redisClient, connectRedis };
