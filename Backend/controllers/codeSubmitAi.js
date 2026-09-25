const axios = require("axios");
const CodingDetails = require("../models/codeAI");
const { redisClient } = require("../config/redis");

// ============================================================
// JUDGE0 CONFIG
// ============================================================

const JUDGE0_URL =
  process.env.RAPIDAPI_JUDGE0_URL ||
  "https://judge0-ce.p.rapidapi.com";

const JUDGE0_HOST =
  process.env.RAPIDAPI_JUDGE0_HOST ||
  "judge0-ce.p.rapidapi.com";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// ============================================================
// LANGUAGE IDS
// ============================================================

const LANGUAGE_IDS = {
  cpp: 54,
  python: 71,
  javascript: 63,
};

// ============================================================
// JUDGE0 HEADERS
// ============================================================

const getJudge0Headers = () => {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-RapidAPI-Key": RAPIDAPI_KEY,
    "X-RapidAPI-Host": JUDGE0_HOST,
  };
};

// ============================================================
// DECODE JUDGE0 BASE64 OUTPUT
// ============================================================

const decodeJudge0Output = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  try {
    return Buffer.from(value, "base64").toString("utf8");
  } catch (error) {
    console.error("❌ Base64 decode error:", error.message);
    return String(value);
  }
};

// ============================================================
// NORMALIZE OUTPUT
// ============================================================

const normalizeOutput = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/\r\n/g, "\n")
    .trim();
};

// ============================================================
// EXPECTED OUTPUT -> STRING
// ============================================================

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

// ============================================================
// NORMALIZE TEST INPUT
// ============================================================

const normalizeTestInput = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  let input = String(value).trim();

  if (!input) {
    return "";
  }

  input = input.replace(/\\r\\n/g, "\n");
  input = input.replace(/\\n/g, "\n");

  // Convert comma-separated numeric input to whitespace.
  // Example: 1,2,3 -> 1 2 3
  input = input.replace(/,/g, " ");

  input = input.replace(/^\s*\[\s*/, "");
  input = input.replace(/\s*\]\s*$/, "");

  input = input.replace(/[ \t]+/g, " ");

  input = input
    .split("\n")
    .map((line) => line.trim())
    .join("\n");

  return input.trim();
};

// ============================================================
// CREATE JUDGE0 SUBMISSION
// ============================================================

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
        timeout: 30000,
      }
    );

    if (!response.data || !response.data.token) {
      throw new Error("Judge0 did not return a submission token.");
    }

    return response.data.token;
  } catch (error) {
    console.error(
      "❌ Judge0 submission error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// ============================================================
// GET JUDGE0 RESULT
// ============================================================

const getJudge0Result = async (token) => {
  const maxAttempts = 30;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // IMPORTANT:
      // Poll with base64_encoded=true
      const response = await axios.get(
        `${JUDGE0_URL}/submissions/${token}?base64_encoded=true`,
        {
          headers: getJudge0Headers(),
          timeout: 30000,
        }
      );

      const result = response.data;

      // 1 = In Queue
      // 2 = Processing
      if (result.status?.id === 1 || result.status?.id === 2) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      return result;
    } catch (error) {
      console.error(
        "❌ Judge0 polling error:",
        error.response?.data || error.message
      );

      throw error;
    }
  }

  throw new Error(
    "Judge0 execution timed out while waiting for result."
  );
};

// ============================================================
// SUBMIT CODE
// ============================================================

const submitCode = async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      codingId,
      questionIndex,
      code,
      language,
    } = req.body;

    // ========================================================
    // VALIDATION
    // ========================================================

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

    const index = Number(questionIndex);

    if (!Number.isInteger(index) || index < 0) {
      return res.status(400).json({
        success: false,
        msg: "Invalid questionIndex.",
      });
    }

    // ========================================================
    // REDIS CACHE
    // ========================================================

    const cacheKey = `coding:questionDetails:${codingId}:${index}`;

    let testCases = null;
    let timeLimit = null;
    let memoryLimit = null;

    try {
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        const parsedData = JSON.parse(cachedData);

        testCases = parsedData.testCases;
        timeLimit = parsedData.timeLimit;
        memoryLimit = parsedData.memoryLimit;
      }
    } catch (redisError) {
      console.error(
        "❌ Redis GET ERROR:",
        redisError.message
      );
    }

    // ========================================================
    // MONGODB FALLBACK
    // ========================================================

    if (!testCases) {
      const session = await CodingDetails.findById(codingId);

      if (!session) {
        return res.status(404).json({
          success: false,
          msg: "Coding session not found.",
        });
      }

      const question = session.codingDetails?.[index];

      if (!question) {
        return res.status(404).json({
          success: false,
          msg: "Question not found.",
        });
      }

      testCases = question.testCases;
      timeLimit = question.timeLimit;
      memoryLimit = question.memoryLimit;

      if (!Array.isArray(testCases) || testCases.length === 0) {
        return res.status(500).json({
          success: false,
          msg: "Test cases are not available or empty.",
        });
      }

      // Cache for 1 hour
      try {
        await redisClient.set(
          cacheKey,
          JSON.stringify({
            testCases,
            timeLimit,
            memoryLimit,
          }),
          {
            EX: 60 * 60,
          }
        );
      } catch (redisError) {
        console.error(
          "❌ Redis SET ERROR:",
          redisError.message
        );
      }
    }

    // ========================================================
    // SORT TEST CASES
    // ========================================================

    const sortedTestCases = [...testCases].sort(
      (a, b) =>
        Number(a.testCaseNumber || 0) -
        Number(b.testCaseNumber || 0)
    );

    // ========================================================
    // RUN EVERY TEST CASE
    // ========================================================

    for (let i = 0; i < sortedTestCases.length; i++) {
      const testCase = sortedTestCases[i];

      const testCaseNumber =
        testCase.testCaseNumber || i + 1;

      const input = normalizeTestInput(testCase.input);

      const expectedOutput =
        expectedOutputToString(
          testCase.expectedOutput
        );

      let token;

      // ======================================================
      // CREATE SUBMISSION
      // ======================================================

      try {
        token = await createJudge0Submission({
          code,
          languageId,
          input,
          timeLimit,
          memoryLimit,
        });
      } catch (judgeError) {
        return res.status(502).json({
          success: false,
          status: "Judge0 Submission Error",
          msg:
            judgeError.response?.data?.error ||
            judgeError.message ||
            "Unable to submit code to Judge0.",
          testCaseNumber,
        });
      }

      console.log(
        `Judge0 submission token: ${token}`
      );

      // ======================================================
      // POLL RESULT
      // ======================================================

      let result;

      try {
        result = await getJudge0Result(token);
      } catch (judgeError) {
        return res.status(502).json({
          success: false,
          status: "Judge0 Result Error",
          msg:
            judgeError.response?.data?.error ||
            judgeError.message ||
            "Unable to get execution result from Judge0.",
          testCaseNumber,
        });
      }

      // ======================================================
      // DECODE BASE64 OUTPUT
      // ======================================================

      const actualOutput = decodeJudge0Output(
        result.stdout
      );

      const stderr = decodeJudge0Output(
        result.stderr
      );

      const compileOutput = decodeJudge0Output(
        result.compile_output
      );

      const statusId = result.status?.id;

      const statusDescription =
        result.status?.description || "Unknown";

      // ======================================================
      // DEBUG
      // ======================================================

      console.log(
        `========== TEST CASE ${testCaseNumber} ==========`
      );

      console.log(
        "INPUT:",
        JSON.stringify(input)
      );

      console.log(
        "EXPECTED:",
        JSON.stringify(expectedOutput)
      );

      console.log(
        "ACTUAL:",
        JSON.stringify(actualOutput)
      );

      console.log(
        "STATUS:",
        statusDescription
      );

      // ======================================================
      // JUDGE0 INTERNAL ERROR
      // ======================================================

      if (statusId === 13) {
        return res.status(502).json({
          success: false,
          status: "Judge0 Internal Error",
          failedTestCase: testCaseNumber,
          isHidden: testCase.isHidden,
          message:
            result.message ||
            "Judge0 encountered an internal execution error.",
          executionTime: Date.now() - startTime,
        });
      }

      // ======================================================
      // COMPILATION ERROR
      // ======================================================

      if (statusId === 6) {
        return res.status(200).json({
          success: false,
          status: "Compilation Error",
          failedTestCase: testCaseNumber,
          isHidden: testCase.isHidden,
          message:
            compileOutput || "Compilation error.",
          executionTime: Date.now() - startTime,
        });
      }

      // ======================================================
      // TIME LIMIT
      // ======================================================

      if (statusId === 5) {
        return res.status(200).json({
          success: false,
          status: "Time Limit Exceeded",
          failedTestCase: testCaseNumber,
          isHidden: testCase.isHidden,
          executionTime: Date.now() - startTime,
        });
      }

      // ======================================================
      // RUNTIME ERRORS
      // ======================================================

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
          message:
            stderr || statusDescription,
          executionTime: Date.now() - startTime,
        });
      }

      // ======================================================
      // UNKNOWN STATUS
      // ======================================================

      if (statusId !== 3) {
        return res.status(200).json({
          success: false,
          status: statusDescription,
          failedTestCase: testCaseNumber,
          isHidden: testCase.isHidden,
          message:
            result.message ||
            stderr ||
            compileOutput ||
            statusDescription,
          executionTime: Date.now() - startTime,
        });
      }

      // ======================================================
      // COMPARE OUTPUT
      // ======================================================

      const normalizedActual =
        normalizeOutput(actualOutput);

      const normalizedExpected =
        normalizeOutput(expectedOutput);

      console.log(
        "NORMALIZED ACTUAL:",
        JSON.stringify(normalizedActual)
      );

      console.log(
        "NORMALIZED EXPECTED:",
        JSON.stringify(normalizedExpected)
      );

      // ======================================================
      // WRONG ANSWER
      // ======================================================

      if (
        normalizedActual !== normalizedExpected
      ) {
        return res.status(200).json({
          success: false,
          status: "Wrong Answer",
          failedTestCase: testCaseNumber,
          isHidden: testCase.isHidden,
          ...(testCase.isHidden
            ? {}
            : {
                expectedOutput,
                actualOutput,
              }),
          executionTime:
            Date.now() - startTime,
        });
      }
    }

    // ========================================================
    // ALL TEST CASES PASSED
    // ========================================================

    return res.status(200).json({
      success: true,
      status: "Accepted",
      message: "All test cases passed.",
      totalTestCases: sortedTestCases.length,
      passedTestCases: sortedTestCases.length,
      executionTime: Date.now() - startTime,
    });
  } catch (error) {
    console.error(
      "❌ SUBMIT CODE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      status: "Server Error",
      msg:
        "Something went wrong while executing your code.",
    });
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  submitCode,
};