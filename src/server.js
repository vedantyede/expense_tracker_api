import express from "express";
import dotenv from "dotenv";
import { initDB } from "./config/db.js";
import ratelimiter from "./middleware/rateLimiter.js";
import transactionsRoute from './routes/transactionsRoute.js'
import job from './config/cron.js'

dotenv.config()

const app = express();

// Start the cron job
if (process.env.NODE_ENV === "production") job.start();

// middleware
app.use(ratelimiter)
app.use(express.json())

app.get("/api/health", (req, res) => {
  res.status(200).json({
    message: "Server is healthy",
    timestamp: new Date().toISOString()
  });
})

app.use("/api/transactions", transactionsRoute)

// we are starting server only if database initialized
// after this, in neon db table will get created
initDB().then(() => {
  app.listen(process.env.PORT || 5001, () => {
    console.log("Server is up and running on PORT: ", process.env.PORT || 5001);
  });
})
