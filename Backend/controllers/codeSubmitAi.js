const axios = require("axios");
const CodingDetails = require("../models/codeAI");

// Piston API configurations
const PISTON_LANGUAGES = {
  python: { language: "python", version: "3.10.0" },
  cpp: { language: "c++", version: "10.2.0" },
  javascript: { language: "javascript", version: "18.15.0" }
};

// HELPER: Safely convert anything to a trimmed string
const safeString = (val) => {
  if (val === null || val === undefined) return "";
  return String(val).trim();
};

const submitCode = async (req, res) => {
  try {
    const { codingId, questionIndex, language, code } = req.body;

    const session = await CodingDetails.findById(codingId);
    if (!session || !session.codingDetails[questionIndex]) {
      console.error(`Submit Error: Question not found for codingId: ${codingId}, index: ${questionIndex}`);
      return res.status(404).json({ success: false, msg: "Question not found" });
    }

    const question = session.codingDetails[questionIndex];

    if (!question.testCases || question.testCases.length === 0) {
      console.error(`Submit Error: No test cases found for question: "${question.title}"`);
      return res.status(400).json({ success: false, msg: "No test cases found for this question." });
    }

    const langConfig = PISTON_LANGUAGES[language];
    if (!langConfig) {
      console.error(`Submit Error: Unsupported language requested: "${language}"`);
      return res.status(400).json({ success: false, msg: "Unsupported language" });
    }

    // =========================================================
    // STEP 1: FIRE ALL TEST CASES AT ONCE
    // =========================================================
    const executionPromises = question.testCases.map(async (testCase) => {
      const safeInput = safeString(testCase.input);
      
      try {
        const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
          language: langConfig.language,
          version: langConfig.version,
          files: [{ name: "main", content: code }],
          stdin: safeInput, 
          compile_timeout: 10000,
          run_timeout: (question.timeLimit || 2) * 1000,
        });
        
        return { testCase, result: response.data, error: null };
      } catch (err) {
        // Log the specific Piston API network/server error
        console.error(`Piston API Request Failed for test case #${testCase.testCaseNumber}:`, err.message);
        return { testCase, result: null, error: err.message };
      }
    });

    // Wait for all simultaneous executions to finish
    const executionResults = await Promise.all(executionPromises);

    // =========================================================
    // STEP 2: EVALUATE RESULTS IN ORDER
    // =========================================================
    let passedCount = 0;
    let failedTestCase = null;

    // Ensure we evaluate in order of test case number
    executionResults.sort((a, b) => (a.testCase.testCaseNumber || 0) - (b.testCase.testCaseNumber || 0));

    for (const execution of executionResults) {
      if (execution.error) {
        console.error(`Evaluation Error: Aborting evaluation due to Piston API error on test case #${execution.testCase.testCaseNumber}:`, execution.error);
        return res.status(500).json({ success: false, msg: "Piston API Error: " + execution.error });
      }

      const { run = {}, compile = {} } = execution.result || {};

      // 1. Compile Error (Fails immediately for all)
      if (compile.code && compile.code !== 0) {
        return res.status(200).json({
          success: false,
          verdict: "Compile Error",
          error: safeString(compile.stderr) || "Unknown compilation error"
        });
      }

      // 2. Runtime Error
      if (run.code && run.code !== 0) {
        return res.status(200).json({
          success: false,
          verdict: "Runtime Error",
          error: safeString(run.stderr) || safeString(run.stdout) || "Unknown runtime error"
        });
      }

      // 3. Time Limit Exceeded
      if (run.signal === "SIGKILL") {
        return res.status(200).json({
          success: false,
          verdict: "Time Limit Exceeded"
        });
      }

      // 4. Output Validation
      const actualOutput = safeString(run.stdout);
      const expectedOutput = safeString(execution.testCase.expectedOutput);

      if (actualOutput === expectedOutput) {
        passedCount++;
      } else {
        // We hit a wrong answer! 
        if (execution.testCase.isHidden) {
          failedTestCase = {
            isHidden: true,
            message: `Failed on hidden test case #${execution.testCase.testCaseNumber}`
          };
        } else {
          failedTestCase = {
            isHidden: false,
            testCaseNumber: execution.testCase.testCaseNumber,
            input: safeString(execution.testCase.input),
            expected: expectedOutput,
            actual: actualOutput
          };
        }
        // Stop checking further test cases once one fails
        break; 
      }
    }

    // =========================================================
    // STEP 3: RETURN FINAL VERDICT
    // =========================================================
    if (passedCount === question.testCases.length) {
      return res.status(200).json({
        success: true,
        verdict: "Accepted",
        passedCount,
        total: question.testCases.length
      });
    } else {
      return res.status(200).json({
        success: false,
        data: {
            verdict: "Wrong Answer",
            passedCount, 
            total: question.testCases.length,
            failedTestCase
        }
      });
    }

  } catch (error) {
    // Catch-all for unexpected server/database errors
    console.error("Execution Controller Error:", error);
    return res.status(500).json({ success: false, msg: "Failed to execute code" });
  }
};

module.exports = { submitCode };