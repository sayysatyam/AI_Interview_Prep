const axios = require("axios");
require("dotenv").config();

const JUDGE0_URL =
  process.env.RAPIDAPI_JUDGE0_URL ||
  "https://judge0-ce.p.rapidapi.com";

const JUDGE0_HOST =
  process.env.RAPIDAPI_JUDGE0_HOST ||
  "judge0-ce.p.rapidapi.com";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

const PYTHON_LANG_ID =  71;

const MAX_REPAIR_ATTEMPTS = 3;

const judgeHeaders = () => ({
  "Content-Type": "application/json",
  "X-RapidAPI-Key": RAPIDAPI_KEY,
  "X-RapidAPI-Host": JUDGE0_HOST,
});


// ============================================================
// 1. RUN PYTHON CODE ON JUDGE0
// ============================================================

const runReferenceSolution = async (sourceCode, input) => {
  try {
    const submissionResponse = await axios.post(
      `${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`,
      {
        language_id: PYTHON_LANG_ID,
        source_code: sourceCode,
        stdin: input,
      },
      {
        headers: judgeHeaders(),
      }
    );

    const token = submissionResponse.data.token;

    if (!token) {
      throw new Error("Judge0 did not return submission token");
    }

    let result;

    while (true) {
      const response = await axios.get(
        `${JUDGE0_URL}/submissions/${token}?base64_encoded=false`,
        {
          headers: judgeHeaders(),
        }
      );

      result = response.data;

      /*
        Judge0 status:

        1 = In Queue
        2 = Processing
        3 = Accepted
        >3 = Error
      */

      if (result.status && result.status.id > 2) {
        break;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );
    }

    // --------------------------------------------------------
    // Judge0 execution failed
    // --------------------------------------------------------

    if (result.status?.id !== 3) {
      const errorMessage = [
        `Reference solution failed: ${
          result.status?.description || "Unknown Judge0 error"
        }`,
        result.stderr || "",
        result.compile_output || "",
      ]
        .filter(Boolean)
        .join("\n");

      throw new Error(errorMessage);
    }

    return result.stdout ?? "";

  } catch (error) {

    throw new Error(
      `Judge0 reference execution failed: ${
        error.response?.data?.message ||
        error.message
      }`
    );
  }
};


// ============================================================
// 2. BASIC STATIC VALIDATION
// ============================================================

const staticValidatePython = (code) => {

  if (!code || typeof code !== "string") {
    return {
      valid: false,
      error: "Reference solution is empty or not a string.",
    };
  }

  if (code.trim().length < 10) {
    return {
      valid: false,
      error: "Reference solution is too short.",
    };
  }

  // Remove markdown code fences if AI accidentally returned them
  const cleanedCode = code
    .replace(/^```python\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // Basic checks for obvious platform-dependent code

  const forbiddenPatterns = [
    {
      regex: /from\s+typing\s+import\s+\*/i,
      message: "Invalid wildcard typing import.",
    },
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.regex.test(cleanedCode)) {
      return {
        valid: false,
        error: pattern.message,
      };
    }
  }

  return {
    valid: true,
    code: cleanedCode,
  };
};


// ============================================================
// 3. CALL YOUR AI MODEL TO REPAIR CODE
// ============================================================

const repairReferenceSolution = async ({
  question,
  referenceSolution,
  testInput,
  error,
}) => {

  const prompt = `
You are repairing a Python 3 reference solution.

The program will be executed directly by Judge0.

It is NOT running on LeetCode, HackerRank, CodeChef,
or any other coding platform.

============================================================
PROBLEM
============================================================

Title:
${question.title}

Description:
${question.description}

Constraints:
${question.constraints}

Input Format:
${question.inputFormat}

Output Format:
${question.outputFormat}

Example:
${JSON.stringify(question.examples || [], null, 2)}

============================================================
TEST INPUT
============================================================

${testInput}

============================================================
CURRENT REFERENCE SOLUTION
============================================================

${referenceSolution}

============================================================
JUDGE0 ERROR
============================================================

${error}

============================================================
REPAIR REQUIREMENTS
============================================================

Return ONLY the complete corrected Python 3 program.

The program MUST:

1. Run directly using:

   python3 script.py < input.txt

2. Read input from stdin.

3. Parse the EXACT input format.

4. Construct all required data structures.

5. Define all required classes.

6. Define every variable before using it.

7. Never assume variables are provided by LeetCode.

8. Never assume variables such as:

   root
   head
   nums
   n
   k
   graph
   matrix

   already exist.

9. If a linked list is required, define ListNode.

10. If a binary tree is required, define TreeNode.

11. Construct root/head/etc. from the provided stdin.

12. Do NOT hardcode the answer.

13. Do NOT modify the input.

14. Do NOT require user interaction.

15. Do NOT use external files.

16. Do NOT use external packages.

17. Print ONLY the final answer.

18. The program MUST successfully execute using the
    TEST INPUT shown above.

IMPORTANT:

Do not just explain the problem.

Return the COMPLETE corrected Python code.

============================================================
`;

  /*
    IMPORTANT:

    Replace this section with the SAME OpenRouter/AI function
    that your codeQuesGenerator already uses.
  */

  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openai/gpt-4o-mini",

      messages: [
        {
          role: "system",
          content:
            "You are an expert competitive programming Python developer. Return only executable Python code.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.1,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  let repairedCode =
    response.data?.choices?.[0]?.message?.content;

  if (!repairedCode) {
    throw new Error(
      "AI did not return repaired reference solution."
    );
  }

  // Remove markdown fences
  repairedCode = repairedCode
    .replace(/^```python\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return repairedCode;
};


// ============================================================
// 4. VALIDATE REFERENCE SOLUTION
// ============================================================

const validateReferenceSolution = async (question) => {

  if (
    !question.referenceSolution ||
    !question.referenceSolution.python
  ) {
    throw new Error(
      "Python reference solution is missing."
    );
  }

  if (
    !Array.isArray(question.testCases) ||
    question.testCases.length === 0
  ) {
    throw new Error(
      "No test cases available for reference validation."
    );
  }

  let referenceCode =
    question.referenceSolution.python;

  // ----------------------------------------------------------
  // Try to repair up to 3 times
  // ----------------------------------------------------------

  for (
    let attempt = 1;
    attempt <= MAX_REPAIR_ATTEMPTS;
    attempt++
  ) {

    console.log(
      `\n========================================`
    );

    console.log(
      `REFERENCE VALIDATION ATTEMPT ${attempt}/${MAX_REPAIR_ATTEMPTS}`
    );

    console.log(
      `========================================\n`
    );


    // ========================================================
    // STATIC VALIDATION
    // ========================================================

    const staticResult =
      staticValidatePython(referenceCode);

    if (!staticResult.valid) {

      console.log(
        "Static validation failed:"
      );

      console.log(
        staticResult.error
      );

      if (
        attempt === MAX_REPAIR_ATTEMPTS
      ) {
        throw new Error(
          `Reference solution failed static validation after ${MAX_REPAIR_ATTEMPTS} attempts.`
        );
      }

      referenceCode =
        await repairReferenceSolution({
          question,
          referenceSolution: referenceCode,
          testInput:
            question.testCases[0].input,
          error:
            staticResult.error,
        });

      continue;
    }

    referenceCode =
      staticResult.code;


    // ========================================================
    // RUN FIRST TEST CASE
    // ========================================================

    const firstTestCase =
      question.testCases[0];

    console.log(
      `Testing reference solution with test case ${firstTestCase.testCaseNumber}...`
    );

    try {

      const output =
        await runReferenceSolution(
          referenceCode,
          firstTestCase.input
        );

      console.log(
        "First test case PASSED."
      );

      console.log(
        "Reference solution is valid."
      );

      return referenceCode;

    } catch (error) {

      console.log(
        "\nREFERENCE SOLUTION FAILED\n"
      );

      console.log(
        error.message
      );


      // ------------------------------------------------------
      // Last attempt
      // ------------------------------------------------------

      if (
        attempt === MAX_REPAIR_ATTEMPTS
      ) {
        throw new Error(
          `Reference solution could not be repaired after ${MAX_REPAIR_ATTEMPTS} attempts.\n\n${error.message}`
        );
      }


      // ------------------------------------------------------
      // Ask AI to repair
      // ------------------------------------------------------

      console.log(
        "\nSending error back to AI for repair..."
      );

      referenceCode =
        await repairReferenceSolution({
          question,

          referenceSolution:
            referenceCode,

          testInput:
            firstTestCase.input,

          error:
            error.message,
        });

      console.log(
        "AI generated repaired reference solution."
      );
    }
  }

  throw new Error(
    "Unexpected reference validation failure."
  );
};


// ============================================================
// 5. RUN ALL TEST CASES IN PARALLEL
// ============================================================

const generateExpectedOutput =
  async (question) => {

    console.log(
      "\n========================================"
    );

    console.log(
      "VALIDATING REFERENCE SOLUTION"
    );

    console.log(
      "========================================\n"
    );


    // --------------------------------------------------------
    // STEP 1:
    // Validate and automatically repair reference solution
    // --------------------------------------------------------

    const validReferenceSolution =
      await validateReferenceSolution(
        question
      );


    // Save validated solution
    question.referenceSolution.python =
      validReferenceSolution;


    console.log(
      "\n========================================"
    );

    console.log(
      "REFERENCE SOLUTION VALIDATED"
    );

    console.log(
      "RUNNING ALL TEST CASES"
    );

    console.log(
      "========================================\n"
    );


    // --------------------------------------------------------
    // STEP 2:
    // Run ALL test cases concurrently
    // --------------------------------------------------------

    const updatedTestCases =
      await Promise.all(

        question.testCases.map(
          async (testCase) => {

            console.log(
              `Submitting test case ${testCase.testCaseNumber}...`
            );

            const stdout =
              await runReferenceSolution(
                validReferenceSolution,
                testCase.input
              );

            console.log(
              `Test case ${testCase.testCaseNumber} completed.`
            );

            return {
              ...testCase,

              expectedOutput:
                stdout.trim(),
            };
          }
        )
      );


    console.log(
      "\nAll test cases completed successfully."
    );


    return updatedTestCases;
  };


module.exports = {
  runReferenceSolution,
  staticValidatePython,
  validateReferenceSolution,
  generateExpectedOutput,
};