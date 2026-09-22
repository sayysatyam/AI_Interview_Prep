const axios = require("axios");
const CodingDetails = require("../models/codeAI");
const { redisClient } = require("../config/redis");

const JUDGE0_URL =
  process.env.RAPIDAPI_JUDGE0_URL || "https://judge0-ce.p.rapidapi.com";

const JUDGE0_HOST =
  process.env.RAPIDAPI_JUDGE0_HOST || "judge0-ce.p.rapidapi.com";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

const LANGUAGE_IDS = {
  cpp: 54,
  python: 71,
  javascript: 63,
};

const getJudge0Headers = () => {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-RapidAPI-Key": RAPIDAPI_KEY,
    "X-RapidAPI-Host": JUDGE0_HOST,
  };
};

const normalizeOutput = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();
};

const expectedOutputToString = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
};

const createJudge0Submission = async ({
  code,
  languageId,
  input,
  timeLimit,
  memoryLimit,
}) => {
  if (!RAPIDAPI_KEY) {
    throw new Error("RAPIDAPI_KEY is missing in environment variables.");
  }

  const numericTimeLimit = Number(timeLimit);
  const numericMemoryLimit = Number(memoryLimit);

  const safeMemoryLimit =
    Number.isFinite(numericMemoryLimit) && numericMemoryLimit >= 2048
      ? numericMemoryLimit
      : 128000;

  const safeTimeLimit =
    Number.isFinite(numericTimeLimit) && numericTimeLimit > 0
      ? numericTimeLimit
      : 5;

  const payload = {
    source_code: code,
    language_id: languageId,
    stdin: input || "",
    cpu_time_limit: safeTimeLimit,
    memory_limit: safeMemoryLimit,
  };

  try {
    const response = await axios.post(
      `${JUDGE0_URL}/submissions/?base64_encoded=false&wait=false`,
      payload,
      {
        headers: getJudge0Headers(),
        timeout: 15000,
      },
    );

    if (!response.data || !response.data.token) {
      throw new Error("Judge0 did not return a submission token.");
    }

    return response.data.token;
  } catch (error) {
    console.error(
      "❌ Judge0 submission error:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

const getJudge0Result = async (token) => {
  const maxAttempts = 30;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await axios.get(
        `${JUDGE0_URL}/submissions/${token}?base64_encoded=false`,
        {
          headers: getJudge0Headers(),
          timeout: 15000,
        },
      );

      const result = response.data;

      if (result.status?.id === 1 || result.status?.id === 2) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        continue;
      }

      return result;
    } catch (error) {
      console.error(
        "❌ Judge0 polling error:",
        error.response?.data || error.message,
      );

      throw error;
    }
  }

  throw new Error("Judge0 execution timed out while waiting for result.");
};

const submitCode = async (req, res) => {
  const startTime = Date.now();

  try {
    const { codingId, questionIndex, code, language } = req.body;

    if (!codingId) {
      return res.status(400).json({
        success: false,
        msg: "codingId is required.",
      });
    }

    if (questionIndex === undefined || questionIndex === null) {
      return res.status(400).json({
        success: false,
        msg: "questionIndex is required.",
      });
    }

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        msg: "Code is required.",
      });
    }

    if (!language) {
      return res.status(400).json({
        success: false,
        msg: "Language is required.",
      });
    }

    const languageId = LANGUAGE_IDS[language];

    if (!languageId) {
      return res.status(400).json({
        success: false,
        msg: `Unsupported language: ${language}`,
      });
    }

    const cacheKey = `coding:testCases:${codingId}:${Number(questionIndex)}`;

    let testCases;
    let question;

    try {
      const cachedTestCases = await redisClient.get(cacheKey);

      if (cachedTestCases) {
        testCases = JSON.parse(cachedTestCases);
      }
    } catch (redisError) {
      console.error("❌ Redis GET ERROR:", redisError.message);
    }

    if (!testCases) {
      const session = await CodingDetails.findById(codingId);

      if (!session) {
        return res.status(404).json({
          success: false,
          msg: "Coding session not found.",
        });
      }

      question = session.codingDetails?.[Number(questionIndex)];

      if (!question) {
        return res.status(404).json({
          success: false,
          msg: "Question not found.",
        });
      }

      testCases = question.testCases;

      if (!Array.isArray(testCases)) {
        return res.status(500).json({
          success: false,
          msg: "Test cases are not available.",
        });
      }

      try {
        await redisClient.set(cacheKey, JSON.stringify(testCases), {
          EX: 60 * 60,
        });
      } catch (redisError) {
        console.error("❌ Redis SET ERROR:", redisError.message);
      }
    }

    if (!Array.isArray(testCases)) {
      return res.status(500).json({
        success: false,
        msg: "Test cases must be an array.",
      });
    }

    if (testCases.length === 0) {
      return res.status(500).json({
        success: false,
        msg: "No test cases found.",
      });
    }

    if (!question) {
      try {
        const session = await CodingDetails.findById(codingId);

        if (!session) {
          return res.status(404).json({
            success: false,
            msg: "Coding session not found.",
          });
        }

        question = session.codingDetails?.[Number(questionIndex)];

        if (!question) {
          return res.status(404).json({
            success: false,
            msg: "Question not found.",
          });
        }
      } catch (mongoError) {
        console.error("❌ MongoDB question fetch error:", mongoError.message);

        return res.status(500).json({
          success: false,
          msg: "Unable to load question settings.",
        });
      }
    }

    const sortedTestCases = [...testCases].sort(
      (a, b) => a.testCaseNumber - b.testCaseNumber,
    );

    for (let i = 0; i < sortedTestCases.length; i++) {
      const testCase = sortedTestCases[i];

      const testCaseNumber = testCase.testCaseNumber || i + 1;

      const input =
        testCase.input === null || testCase.input === undefined
          ? ""
          : String(testCase.input);

      const expectedOutput = expectedOutputToString(testCase.expectedOutput);

      let token;

      try {
        token = await createJudge0Submission({
          code,
          languageId,
          input,
          timeLimit: question.timeLimit,
          memoryLimit: question.memoryLimit,
        });
      } catch (judgeError) {
        console.error(
          `❌ Test Case ${testCaseNumber} submission failed:`,
          judgeError.response?.data || judgeError.message,
        );

        return res.status(502).json({
          success: false,
          status: "Judge0 Submission Error",
          msg:
            judgeError.response?.data?.error ||
            judgeError.response?.data?.message ||
            judgeError.message ||
            "Unable to submit code to Judge0.",
          testCaseNumber,
        });
      }

      let result;

      try {
        result = await getJudge0Result(token);
      } catch (judgeError) {
        console.error(
          `❌ Test Case ${testCaseNumber} result failed:`,
          judgeError.response?.data || judgeError.message,
        );

        return res.status(502).json({
          success: false,
          status: "Judge0 Result Error",
          msg: "Unable to get execution result from Judge0.",
          testCaseNumber,
        });
      }

      const actualOutput = result.stdout || "";

      const stderr = result.stderr || "";

      const compileOutput = result.compile_output || "";

      const statusId = result.status?.id;

      const statusDescription = result.status?.description || "Unknown";

      if (result.message) {
        console.error(
          `❌ Judge0 message for Test Case ${testCaseNumber}:`,
          result.message,
        );
      }

      if (statusId === 13) {
        console.error(
          `❌ Test Case ${testCaseNumber}: Judge0 Internal Error`,
          result.message,
        );

        return res.status(502).json({
          success: false,
          status: "Judge0 Internal Error",
          failedTestCase: testCaseNumber,
          isHidden: testCase.isHidden,
          message:
            result.message || "Judge0 encountered an internal execution error.",
          executionTime: Date.now() - startTime,
        });
      }

      if (statusId === 6) {
        return res.status(200).json({
          success: false,
          status: "Compilation Error",
          failedTestCase: testCaseNumber,
          isHidden: testCase.isHidden,
          message: compileOutput || "Compilation error.",
          executionTime: Date.now() - startTime,
        });
      }

      if (statusId === 5) {
        return res.status(200).json({
          success: false,
          status: "Time Limit Exceeded",
          failedTestCase: testCaseNumber,
          isHidden: testCase.isHidden,
          executionTime: Date.now() - startTime,
        });
      }

      if (
        statusId === 7 ||
        statusId === 8 ||
        statusId === 9 ||
        statusId === 10 ||
        statusId === 11
      ) {
        return res.status(200).json({
          success: false,
          status: "Runtime Error",
          failedTestCase: testCaseNumber,
          isHidden: testCase.isHidden,
          message: stderr || statusDescription,
          executionTime: Date.now() - startTime,
        });
      }

      if (statusId !== 3) {
        return res.status(200).json({
          success: false,
          status: statusDescription,
          failedTestCase: testCaseNumber,
          isHidden: testCase.isHidden,
          message:
            result.message || stderr || compileOutput || statusDescription,
          executionTime: Date.now() - startTime,
        });
      }

      const normalizedActual = normalizeOutput(actualOutput);

      const normalizedExpected = normalizeOutput(expectedOutput);

      if (normalizedActual !== normalizedExpected) {
        return res.status(200).json({
          success: false,
          status: "Wrong Answer",
          failedTestCase: testCaseNumber,
          isHidden: testCase.isHidden,
          expectedOutput: testCase.isHidden ? undefined : expectedOutput,
          actualOutput: testCase.isHidden ? undefined : actualOutput,
          executionTime: Date.now() - startTime,
        });
      }
    }

    const totalTime = Date.now() - startTime;

    return res.status(200).json({
      success: true,
      status: "Accepted",
      message: "All test cases passed.",
      totalTestCases: sortedTestCases.length,
      passedTestCases: sortedTestCases.length,
      executionTime: totalTime,
    });
  } catch (error) {
    console.error(
      "❌ SUBMIT CODE ERROR:",
      error.response?.data || error.message,
    );

    console.error("Error name:", error.name);

    console.error("Error code:", error.code);

    console.error("Stack:", error.stack);

    return res.status(500).json({
      success: false,
      status: "Server Error",
      msg: "Something went wrong while executing your code.",
    });
  }
};

module.exports = {
  submitCode,
};
