import ratelimit from "../config/upstash.js";

const ratelimiter = async (req, res, next) => {
  try {
    // here we will have to add user_id or ip address
    const { success } = await ratelimit.limit("my-rate-limit");

    if (!success) {
      return res.status(429).json({
        message: "Too many requests, please try agaian later."
      }) 
    }

    next()

  } catch (error) {
    console.log("Rate limit error ", error);
    next(error)
  }
}

export default ratelimiter;