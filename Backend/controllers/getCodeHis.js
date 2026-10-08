const codingDetails = require("../models/codeAI");
const {  redisClient } = require("../config/redis");

const getCodingHistory = async (req, res) => {
  try {
    const userId = req.userId;


    const page = Math.max(parseInt(req.query.page) || 1, 1);

    const limit = Math.min(
      parseInt(req.query.limit) || 10,
      30
    );

    const skip = (page - 1) * limit;

    // -----------------------------
    // Redis cache key
    // -----------------------------
    const cacheKey = `coding-history:${userId}:page:${page}:limit:${limit}`;

    // -----------------------------
    // 1. Check Redis
    // -----------------------------
    try {
      const cachedHistory = await  redisClient.get(cacheKey);

      if (cachedHistory) {
        return res.status(200).json({
          history: JSON.parse(cachedHistory),
          page,
          limit,
          source: "cache",
        });
      }
    } catch (redisError) {
      // Redis failure should NOT break your website
      console.error("Redis read error:", redisError);
    }

    // -----------------------------
    // 2. Get history from MongoDB
    // -----------------------------
    const history = await codingDetails
      .find(
        { createdBy: userId },
        {
          prompt: 1,
          difficulty: 1,
          status: 1,
          numberOfQuestions: 1,
          average: 1,
          finalEvaluation: 1,
          createdAt: 1,
        }
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // -----------------------------
    // 3. Cache result in Redis
    // -----------------------------
    try {
      await  redisClient.set(
        cacheKey,
        JSON.stringify(history),
        {
          EX: 300, // 5 minutes
        }
      );
    } catch (redisError) {
      console.error("Redis write error:", redisError);
    }

    // -----------------------------
    // 4. Send response
    // -----------------------------
    return res.status(200).json({
      history,
      page,
      limit,
      source: "database",
    });

  } catch (error) {
    console.error("Coding history error:", error);

    return res.status(500).json({
      msg: "Something Went Wrong",
    });
  }
};

module.exports = {
  getCodingHistory,
};