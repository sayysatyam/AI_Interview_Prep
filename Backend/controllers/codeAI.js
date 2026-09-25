const axios = require("axios");
const CodingDetails = require("../models/codeAI");
const userDetails = require("../models/auth");
const { redisClient } = require("../config/redis");
const OPENROUTER_HEADERS = {
  Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
  "Content-Type": "application/json",
};

const OPENROUTER_URL =
  "https://openrouter.ai/api/v1/chat/completions";

const codeQuesGenerator = async (req, res) => {
  const totalStart = Date.now();

  try {
    const userId = req.userId;
    const { prompt } = req.body;

    const quesNo = 5;

    // ==================================================
    // BASIC VALIDATION
    // ==================================================

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        msg: "Prompt is empty or undefined",
      });
    }

    // ==================================================
    // USER CHECK
    // ==================================================

    const userDbStart = Date.now();

    const user = await userDetails.findById(userId);

    console.log(`User DB Time: ${Date.now() - userDbStart} ms`);

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    // ==================================================
    // CREDIT CHECK
    // ==================================================

    if (user.credits < 50) {
      return res.status(400).json({
        success: false,
        msg: "Minimum 50 credits are required",
      });
    }

    // ==================================================
    // API KEY CHECK
    // ==================================================

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({
        success: false,
        msg: "OPENROUTER_API_KEY is not configured",
      });
    }

    // ==================================================
    // ORIGINAL PROMPT
    // ==================================================

    const message = `You are an AI Coding Interview Question Generator.

USER REQUEST:
${prompt}

Generate exactly ${quesNo} coding questions.

==================================================
1. GENERAL REQUIREMENTS
==================================================

Generate exactly ${quesNo} unique, logically correct, solvable coding questions.

Questions may be:
- Original/custom
- Platform-inspired
- Platform-associated

When ${quesNo} > 1, include a reasonable mixture of original/custom and platform-associated questions whenever possible.

NEVER fabricate platform information.

For verified platform questions:
"redirectUrl": "verified URL",
"platformImage": "verified logo URL"

For original/custom or unverified platform questions:
"redirectUrl": null,
"platformImage": null

==================================================
2. REQUIRED FIELDS
==================================================

Every question MUST contain:

- title
- difficulty
- topic
- description
- constraints
- inputFormat
- outputFormat
- examples
- testCases
- allowedLanguages
- starterCode
- timeLimit
- memoryLimit
- redirectUrl
- platformImage

==================================================
3. CONSTRAINTS
==================================================

constraints MUST be a non-empty array of relevant, accurate strings.

Constraints MUST correctly describe the valid input space.

They MUST be consistent with:
- description
- inputFormat
- examples
- testCases

If n represents the number of elements, every generated input MUST contain exactly n elements.

If dimensions/counts are specified, the actual input MUST match them exactly.

Every example and test case MUST satisfy ALL constraints.

==================================================
4. EXAMPLES
==================================================

Every question MUST contain at least 2 examples.

Every example MUST contain:

- input
- output
- explanation

Example input MUST:
- be a non-empty string
- follow inputFormat exactly
- satisfy all constraints

Example output MUST:
- always be a string
- be the correct output for that exact input
- follow outputFormat exactly
- never be null

NEVER guess or copy example output.

==================================================
5. TEST CASES
==================================================

testCases MUST be an array.

The number of test cases is flexible. Do NOT enforce a fixed count.

Generate more than 5 when reasonable.

Every test case MUST contain:

- testCaseNumber
- input
- expectedOutput
- isHidden

Rules:

- testCaseNumber → number
- input → string
- expectedOutput → string
- isHidden → boolean

input MUST be valid raw stdin that can be directly passed to Judge0.

Do NOT use JSON, programming-language syntax, labels, comments, or explanations unless explicitly required by inputFormat.

==================================================
6. CRITICAL INPUT/OUTPUT VALIDATION
==================================================

This is mandatory.

For EVERY example and EVERY test case, independently verify:

constraints
    ↓
inputFormat
    ↓
exact input
    ↓
problem rules
    ↓
correct result
    ↓
outputFormat
    ↓
output / expectedOutput

The input and expectedOutput MUST be verified as a pair.

For every input:

- Verify all required values exist.
- Verify no values are missing or extra.
- Verify n/counts/dimensions match the actual input.
- Verify every value satisfies its constraints.
- Verify the input follows inputFormat exactly.

For every output:

- Independently solve/derive the result for that exact input.
- Do NOT guess the result.
- Do NOT copy the result from another case.
- Do NOT assume a generated result is correct.
- Convert the result to the exact stdout format.
- expectedOutput MUST be the exact correct stdout string.

A valid input does NOT mean its expectedOutput is correct.

==================================================
7. MANDATORY RE-VERIFICATION
==================================================

Before returning the JSON, perform a final independent verification of EVERY example and EVERY test case.

For each one, verify:

1. Input is valid.
2. Input satisfies constraints.
3. Input follows inputFormat.
4. The problem is solved using that exact input.
5. Output is correctly calculated.
6. Output follows outputFormat.
7. Input and output are consistent.

If ANY error is found, FIX it and verify again.

Do NOT return the JSON until all input/output pairs are verified.

==================================================
8. TEST CASE COVERAGE
==================================================

When reasonable, include:

- minimum valid case
- normal case
- boundary case
- edge case
- duplicate/special cases when relevant
- large or near-maximum valid case when reasonable

NEVER violate constraints to create an edge case.

==================================================
9. DIFFICULTY
==================================================

Question difficulty MUST be one of:

"easy"
"medium"
"hard"

Overall difficulty MUST be one of:

"easy"
"medium"
"hard"
"mixed"

==================================================
10. LANGUAGES
==================================================

Every question MUST support exactly:

"cpp"
"python"
"javascript"

==================================================
11. STARTER CODE
==================================================

Generate executable starterCode for:

- cpp
- python
- javascript

Starter code MUST:

- read from stdin
- write to stdout
- contain the required entry point
- contain NO solution logic
- NOT use class Solution
- NOT use LeetCode-style wrappers

C++ MUST contain main().

Python MUST contain main() and:
if __name__ == "__main__":

JavaScript MUST use:
fs.readFileSync(0, "utf-8")

==================================================
12. TIME AND MEMORY
==================================================

timeLimit MUST be a positive number representing seconds.

memoryLimit MUST be a positive number representing MB.

==================================================
13. JSON RULES
==================================================

Return ONLY valid JSON.

Do NOT return:
- Markdown
- code fences
- explanations outside JSON
- comments
- extra fields

==================================================
14. FINAL VALIDATION
==================================================

Before returning, verify:

- Exactly ${quesNo} questions.
- No duplicate questions.
- All required fields exist.
- constraints are valid and non-empty.
- At least 2 valid examples per question.
- Every example input is valid.
- Every example output is correct.
- testCases is an array.
- Every test case input is valid raw stdin.
- Every test case satisfies constraints.
- Every test case expectedOutput is correct for its exact input.
- expectedOutput is always a string.
- n/counts/dimensions match actual input.
- inputFormat matches actual input.
- outputFormat matches actual output.
- Starter code exists for all 3 languages.
- Starter code is executable and contains no solution.
- difficulty values are valid.
- allowedLanguages are correct.
- timeLimit and memoryLimit are positive.
- Platform URLs are not fabricated.
- Original/custom questions use null platform fields.

If ANY requirement fails, FIX it before returning.

==================================================
JSON STRUCTURE
==================================================

Return exactly:

{
  "questions": [
    {
      "title": "Example title",
      "difficulty": "medium",
      "topic": "Arrays",
      "redirectUrl": null,
      "platformImage": null,
      "description": "Complete problem description",
      "constraints": [
        "1 <= n <= 100000"
      ],
      "inputFormat": "Description of input",
      "outputFormat": "Description of output",
      "examples": [
        {
          "input": "valid raw input",
          "output": "correct output",
          "explanation": "Explanation"
        },
        {
          "input": "valid raw input",
          "output": "correct output",
          "explanation": "Explanation"
        }
      ],
      "testCases": [
        {
          "testCaseNumber": 1,
          "input": "valid raw stdin",
          "expectedOutput": "exact correct stdout",
          "isHidden": false
        },
        {
          "testCaseNumber": 2,
          "input": "valid raw stdin",
          "expectedOutput": "exact correct stdout",
          "isHidden": true
        }
      ],
      "allowedLanguages": [
        "cpp",
        "python",
        "javascript"
      ],
      "starterCode": {
        "cpp": "executable C++ stdin/stdout template",
        "python": "executable Python stdin/stdout template",
        "javascript": "executable JavaScript stdin/stdout template"
      },
      "timeLimit": 2,
      "memoryLimit": 256
    }
  ],
  "difficulty": "medium"
}

FINAL REQUIREMENT:

Return ONLY the JSON object.

Most importantly, NEVER return an input/output pair without independently verifying that the expectedOutput is the correct result for that exact input.`;

    const generateOneQuestion = async (
      questionNumber,
      extraInstruction,
    ) => {
      const questionMessage = `${message}

==================================================
PARALLEL GENERATION INSTRUCTION
==================================================

This is parallel generation request ${questionNumber} of ${quesNo}.

For THIS request only, generate exactly ONE coding question.

DO NOT generate ${quesNo} questions.

Generate ONLY ONE question.

==================================================
CRITICAL CONSTRAINT REQUIREMENT
==================================================

The "constraints" field MUST be a NON-EMPTY ARRAY.

It MUST contain at least ONE meaningful constraint.

NEVER return:

"constraints": []

NEVER return:

"constraints": null

NEVER omit "constraints".

NEVER return "constraints" as a string.

Correct:

"constraints": [
  "1 <= n <= 100000",
  "1 <= nums[i] <= 1000000000"
]

Incorrect:

"constraints": []

Incorrect:

"constraints": null

Incorrect:

"constraints": "1 <= n <= 100000"

Before returning the JSON, verify that the constraints array contains at least one non-empty string.

==================================================
REQUIRED ONE-QUESTION STRUCTURE
==================================================

{
  "questions": [
    {
      "title": "...",
      "difficulty": "medium",
      "topic": "...",
      "redirectUrl": null,
      "platformImage": null,
      "description": "...",
      "constraints": [
        "1 <= n <= 100000"
      ],
      "inputFormat": "...",
      "outputFormat": "...",
      "examples": [
        {
          "input": "...",
          "output": "...",
          "explanation": "..."
        },
        {
          "input": "...",
          "output": "...",
          "explanation": "..."
        }
      ],
      "testCases": [
        {
          "testCaseNumber": 1,
          "input": "",
          "expectedOutput": "...",
          "isHidden": false
        },
        {
          "testCaseNumber": 2,
          "input": "...",
          "expectedOutput": "...",
          "isHidden": true
        }
      ],
      "allowedLanguages": [
        "cpp",
        "python",
        "javascript"
      ],
      "starterCode": {
        "cpp": "...",
        "python": "...",
        "javascript": "..."
      },
      "timeLimit": 2,
      "memoryLimit": 256
    }
  ],
  "difficulty": "medium"
}

IMPORTANT:

- Exactly ONE question.
- constraints MUST contain at least one string.
- At least TWO examples.
- All three languages are required.
- No solution code.
- No extra fields.
- testCases MUST be present.
- The number of test cases is flexible.
- Try to generate more than 5 test cases when reasonable.
- Empty input is allowed when valid.
- Empty expectedOutput is allowed when valid.
- Every test case must contain testCaseNumber, input, expectedOutput and isHidden.
- isHidden MUST be boolean.

${extraInstruction}
`;

      const response = await axios.post(
        OPENROUTER_URL,
        {
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: questionMessage,
            },
          ],
          response_format: {
            type: "json_object",
          },
        },
        {
          headers: OPENROUTER_HEADERS,
          timeout: 120000,
        },
      );

      const text = response?.data?.choices?.[0]?.message?.content;

      if (!text) {
        throw new Error(
          `AI returned empty response for question ${questionNumber}`,
        );
      }

      let cleanText = text.trim();

      // Remove markdown code fence if model returns one
      if (cleanText.startsWith("```")) {
        cleanText = cleanText
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();
      }

      let parsed;

      try {
        parsed = JSON.parse(cleanText);
      } catch (parseError) {
        throw new Error(
          `Invalid JSON for question ${questionNumber}: ${parseError.message}`,
        );
      }

      if (
        !parsed ||
        !Array.isArray(parsed.questions) ||
        parsed.questions.length !== 1
      ) {
        throw new Error(
          `AI returned invalid question count for question ${questionNumber}`,
        );
      }

      const question = parsed.questions[0];

      // ==================================================
      // IMMEDIATE AI RESPONSE VALIDATION
      // ==================================================

      if (
        !Array.isArray(question.constraints) ||
        question.constraints.length === 0 ||
        question.constraints.some(
          (constraint) =>
            typeof constraint !== "string" || !constraint.trim(),
        )
      ) {
        throw new Error(
          `Question ${questionNumber}: constraints invalid`,
        );
      }

      if (
        !Array.isArray(question.examples) ||
        question.examples.length < 2
      ) {
        throw new Error(
          `Question ${questionNumber}: insufficient examples`,
        );
      }

      // ==================================================
      // TEST CASE VALIDATION
      // ==================================================

      if (!Array.isArray(question.testCases)) {
        throw new Error(
          `Question ${questionNumber}: testCases must be an array`,
        );
      }

      for (const [testCaseIndex, testCase] of question.testCases.entries()) {
        const testCaseNumber = testCaseIndex + 1;

        if (
          typeof testCase.testCaseNumber !== "number" ||
          !Number.isInteger(testCase.testCaseNumber)
        ) {
          throw new Error(
            `Question ${questionNumber}, Test Case ${testCaseNumber}: testCaseNumber invalid`,
          );
        }

        if (typeof testCase.input !== "string") {
          throw new Error(
            `Question ${questionNumber}, Test Case ${testCaseNumber}: input must be a string`,
          );
        }

        if (
          testCase.expectedOutput === undefined ||
          testCase.expectedOutput === null
        ) {
          throw new Error(
            `Question ${questionNumber}, Test Case ${testCaseNumber}: expectedOutput missing`,
          );
        }

        if (typeof testCase.isHidden !== "boolean") {
          throw new Error(
            `Question ${questionNumber}, Test Case ${testCaseNumber}: isHidden must be boolean`,
          );
        }
      }

      if (
        !Array.isArray(question.allowedLanguages) ||
        question.allowedLanguages.length !== 3
      ) {
        throw new Error(
          `Question ${questionNumber}: allowedLanguages invalid`,
        );
      }

      if (
        !question.starterCode ||
        typeof question.starterCode !== "object"
      ) {
        throw new Error(
          `Question ${questionNumber}: starterCode missing`,
        );
      }

      if (
        question.redirectUrl !== null &&
        typeof question.redirectUrl !== "string"
      ) {
        throw new Error(
          `Question ${questionNumber}: invalid redirectUrl`,
        );
      }

      if (
        question.platformImage !== null &&
        typeof question.platformImage !== "string"
      ) {
        throw new Error(
          `Question ${questionNumber}: invalid platformImage`,
        );
      }

      return {
        question,
        difficulty: parsed.difficulty,
      };
    };

    // ==================================================
    // RETRY ONLY FAILED QUESTION
    // ==================================================

    const generateWithRetry = async (
      questionNumber,
      instruction,
      maxRetries = 2,
    ) => {
      let lastError;

      for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
        try {
          const result = await generateOneQuestion(
            questionNumber,
            `${instruction}

FINAL REMINDER FOR THIS REQUEST:

The constraints field MUST NOT be empty.

It MUST look like:

"constraints": [
  "1 <= n <= 100000"
]

Generate meaningful constraints based on the actual problem.

testCases MUST be present.

The number of test cases is flexible.

Try to generate more than 5 test cases when reasonable.

Every test case MUST contain:

- testCaseNumber
- input
- expectedOutput
- isHidden

Empty input is allowed when valid for the problem.`,
          );

          return result;
        } catch (error) {
          lastError = error;

          if (attempt < maxRetries + 1) {
            console.log(
              `Question ${questionNumber}: retrying...`,
            );
          }
        }
      }

      throw new Error(
        `Question ${questionNumber} failed after ${
          maxRetries + 1
        } attempts: ${
          lastError?.message || "Unknown error"
        }`,
      );
    };

    // ==================================================
    // PARALLEL AI GENERATION
    // ==================================================

    const aiStart = Date.now();

    console.log("Starting 5 parallel AI question generations...");

    const results = await Promise.all(
      [
        {
          number: 1,
          instruction:
            "Prefer an original/custom coding problem for this question.",
        },

        {
          number: 2,
          instruction:
            "Prefer a platform-associated coding problem only if the platform association and URL can be confidently provided. Otherwise generate an original/custom problem and use null for redirectUrl and platformImage.",
        },

        {
          number: 3,
          instruction:
            "Prefer a platform-associated coding problem only if the platform association and URL can be confidently provided. Otherwise generate an original/custom problem and use null for redirectUrl and platformImage.",
        },

        {
          number: 4,
          instruction:
            "Prefer a platform-associated coding problem only if the platform association and URL can be confidently provided. Otherwise generate an original/custom problem and use null for redirectUrl and platformImage.",
        },

        {
          number: 5,
          instruction:
            "Prefer an original/custom coding problem for this question.",
        },
      ].map(({ number, instruction }) =>
        generateWithRetry(number, instruction),
      ),
    );

    console.log(
      `Parallel AI Time: ${Date.now() - aiStart} ms`,
    );

    // ==================================================
    // COMBINE RESULTS
    // ==================================================

    const difficulties = results.map(
      (result) => result.question.difficulty,
    );

    const uniqueDifficulties = [...new Set(difficulties)];

    const overallDifficulty =
      uniqueDifficulties.length === 1
        ? uniqueDifficulties[0]
        : "mixed";

    const parsed = {
      questions: results.map(
        (result) => result.question,
      ),
      difficulty: overallDifficulty,
    };

    // ==================================================
    // COMBINED RESPONSE VALIDATION
    // ==================================================

    if (
      !parsed ||
      !Array.isArray(parsed.questions)
    ) {
      return res.status(500).json({
        success: false,
        msg: "AI response does not contain valid questions.",
      });
    }

    if (parsed.questions.length !== quesNo) {
      return res.status(500).json({
        success: false,
        msg: `AI must generate exactly ${quesNo} questions.`,
      });
    }

    // ==================================================
    // VALID VALUES
    // ==================================================

    const validDifficulties = [
      "easy",
      "medium",
      "hard",
      "mixed",
    ];

    const validQuestionDifficulties = [
      "easy",
      "medium",
      "hard",
    ];

    const validLanguages = [
      "cpp",
      "python",
      "javascript",
    ];

    // ==================================================
    // OVERALL DIFFICULTY
    // ==================================================

    if (!validDifficulties.includes(parsed.difficulty)) {
      return res.status(500).json({
        success: false,
        msg: "AI generated an invalid overall difficulty.",
      });
    }

    // ==================================================
    // QUESTION VALIDATION
    // ==================================================

    const questionTitles = new Set();

    for (const [
      questionIndex,
      question,
    ] of parsed.questions.entries()) {
      const questionNumber = questionIndex + 1;

      if (
        typeof question.title !== "string" ||
        question.title.trim() === ""
      ) {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: title is missing.`,
        });
      }

      const normalizedTitle =
        question.title.trim().toLowerCase();

      if (questionTitles.has(normalizedTitle)) {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: duplicate question detected.`,
        });
      }

      questionTitles.add(normalizedTitle);

      // ----------------------------------------------
      // DIFFICULTY
      // ----------------------------------------------

      if (
        !validQuestionDifficulties.includes(
          question.difficulty,
        )
      ) {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: invalid difficulty.`,
        });
      }

      // ----------------------------------------------
      // TOPIC
      // ----------------------------------------------

      if (
        typeof question.topic !== "string" ||
        question.topic.trim() === ""
      ) {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: topic is missing.`,
        });
      }

      // ----------------------------------------------
      // DESCRIPTION
      // ----------------------------------------------

      if (
        typeof question.description !== "string" ||
        question.description.trim() === ""
      ) {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: description is missing.`,
        });
      }

      // ----------------------------------------------
      // CONSTRAINTS
      // ----------------------------------------------

      if (
        !Array.isArray(question.constraints) ||
        question.constraints.length === 0 ||
        question.constraints.some(
          (constraint) =>
            typeof constraint !== "string" ||
            !constraint.trim(),
        )
      ) {
        return res.status(422).json({
          success: false,
          msg: `Question ${questionNumber}: constraints invalid.`,
        });
      }

      // ----------------------------------------------
      // INPUT FORMAT
      // ----------------------------------------------

      if (
        typeof question.inputFormat !== "string" ||
        question.inputFormat.trim() === ""
      ) {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: inputFormat is missing.`,
        });
      }

      // ----------------------------------------------
      // OUTPUT FORMAT
      // ----------------------------------------------

      if (
        typeof question.outputFormat !== "string" ||
        question.outputFormat.trim() === ""
      ) {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: outputFormat is missing.`,
        });
      }

      // ----------------------------------------------
      // TEST CASES
      // ----------------------------------------------

      if (!Array.isArray(question.testCases)) {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: testCases must be an array.`,
        });
      }

      for (const [
        testCaseIndex,
        testCase,
      ] of question.testCases.entries()) {
        const testCaseNumber =
          testCaseIndex + 1;

        if (
          typeof testCase.testCaseNumber !== "number" ||
          !Number.isInteger(
            testCase.testCaseNumber,
          )
        ) {
          return res.status(500).json({
            success: false,
            msg: `Question ${questionNumber}, Test Case ${testCaseNumber}: testCaseNumber is invalid.`,
          });
        }

        // Empty string is VALID
        if (typeof testCase.input !== "string") {
          return res.status(500).json({
            success: false,
            msg: `Question ${questionNumber}, Test Case ${testCaseNumber}: input must be a string.`,
          });
        }

        if (
          testCase.expectedOutput === undefined ||
          testCase.expectedOutput === null
        ) {
          return res.status(500).json({
            success: false,
            msg: `Question ${questionNumber}, Test Case ${testCaseNumber}: expectedOutput missing.`,
          });
        }

        // Empty string expectedOutput is VALID

        if (
          typeof testCase.isHidden !== "boolean"
        ) {
          return res.status(500).json({
            success: false,
            msg: `Question ${questionNumber}, Test Case ${testCaseNumber}: isHidden must be boolean.`,
          });
        }
      }

      // ----------------------------------------------
      // EXAMPLES
      // ----------------------------------------------

      if (
        !Array.isArray(question.examples) ||
        question.examples.length < 2
      ) {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber} must have at least 2 examples.`,
        });
      }

      for (const [
        exampleIndex,
        example,
      ] of question.examples.entries()) {
        const exampleNumber =
          exampleIndex + 1;

        // Input
        if (
          typeof example.input !== "string" ||
          example.input.trim() === ""
        ) {
          return res.status(500).json({
            success: false,
            msg: `Question ${questionNumber}, Example ${exampleNumber}: input missing.`,
          });
        }

        // Output
        if (
          example.output === undefined ||
          example.output === null
        ) {
          return res.status(500).json({
            success: false,
            msg: `Question ${questionNumber}, Example ${exampleNumber}: output missing.`,
          });
        }

        // Empty string output is invalid for examples
        if (
          typeof example.output === "string" &&
          example.output.trim() === ""
        ) {
          return res.status(500).json({
            success: false,
            msg: `Question ${questionNumber}, Example ${exampleNumber}: output cannot be empty.`,
          });
        }

        // Explanation
        if (
          typeof example.explanation !== "string" ||
          example.explanation.trim() === ""
        ) {
          return res.status(500).json({
            success: false,
            msg: `Question ${questionNumber}, Example ${exampleNumber}: explanation missing.`,
          });
        }
      }

      // ----------------------------------------------
      // LANGUAGES
      // ----------------------------------------------

      if (
        !Array.isArray(question.allowedLanguages) ||
        question.allowedLanguages.length !== 3 ||
        !validLanguages.every(
          (language) =>
            question.allowedLanguages.includes(
              language,
            ),
        )
      ) {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: allowedLanguages is invalid.`,
        });
      }

      // ----------------------------------------------
      // STARTER CODE
      // ----------------------------------------------

      if (
        !question.starterCode ||
        typeof question.starterCode !== "object"
      ) {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: starterCode is missing.`,
        });
      }

      if (
        typeof question.starterCode.cpp !==
          "string" ||
        question.starterCode.cpp.trim() === ""
      ) {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: C++ starterCode is missing.`,
        });
      }

      if (
        typeof question.starterCode.python !==
          "string" ||
        question.starterCode.python.trim() === ""
      ) {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: Python starterCode is missing.`,
        });
      }

      if (
        typeof question.starterCode.javascript !==
          "string" ||
        question.starterCode.javascript.trim() === ""
      ) {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: JavaScript starterCode is missing.`,
        });
      }

      // ----------------------------------------------
      // TIME LIMIT
      // ----------------------------------------------

      if (
        typeof question.timeLimit !== "number" ||
        question.timeLimit <= 0
      ) {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: timeLimit is invalid.`,
        });
      }

      // ----------------------------------------------
      // MEMORY LIMIT
      // ----------------------------------------------

      if (
        typeof question.memoryLimit !==
          "number" ||
        question.memoryLimit <= 0
      ) {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: memoryLimit is invalid.`,
        });
      }

      // ----------------------------------------------
      // REDIRECT URL
      // ----------------------------------------------

      if (
        question.redirectUrl !== null &&
        typeof question.redirectUrl !== "string"
      ) {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: redirectUrl is invalid.`,
        });
      }

      // ----------------------------------------------
      // PLATFORM IMAGE
      // ----------------------------------------------

      if (
        question.platformImage !== null &&
        typeof question.platformImage !== "string"
      ) {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: platformImage is invalid.`,
        });
      }
    }

    // ==================================================
    // PREPARE MONGODB DATA
    // ==================================================

    const quesDetails = parsed.questions.map(
      (question) => ({
        title: question.title,
        difficulty: question.difficulty,
        topic: question.topic,

        redirectUrl:
          question.redirectUrl || "",

        platformImage:
          question.platformImage || "",

        description: question.description,

        constraints: question.constraints,

        inputFormat: question.inputFormat,

        outputFormat: question.outputFormat,

        examples: question.examples,

        testCases: question.testCases,

        allowedLanguages:
          question.allowedLanguages,

        starterCode: {
          cpp: question.starterCode.cpp,

          python:
            question.starterCode.python,

          javascript:
            question.starterCode.javascript,
        },

        timeLimit: question.timeLimit,

        memoryLimit:
          question.memoryLimit,
      }),
    );

    // ==================================================
    // CREATE CODING QUESTION DOCUMENT
    // ==================================================

    const codeQuestion = new CodingDetails({
      createdBy: userId,
      prompt: prompt,
      difficulty: parsed.difficulty,
      numberOfQuestions: quesNo,
      startedAt: new Date(),
      codingDetails: quesDetails,
    });
    // ==================================================
    // SAVE CODING ROUND
    // ==================================================

    try {
      await codeQuestion.save();
    } catch (mongoError) {
      console.error(
        "MONGODB SAVE ERROR:",
        mongoError.message,
      );

      throw mongoError;
    }

    //-----REDIS------
      try {

  console.log("⚡ Caching test cases in Redis...");

  for (
    let idx = 0;
    idx < codeQuestion.codingDetails.length;
    idx++
  ) {

    const question =
      codeQuestion.codingDetails[idx];

    const cacheKey =
      `coding:testCases:${codeQuestion._id}:${idx}`;

    await redisClient.set(
      cacheKey,
      JSON.stringify(question.testCases),
      {
        EX: 60 * 60
      }
    );

    console.log(
      `⚡ Test cases cached: ${cacheKey}`
    );
  }

} catch (redisError) {

  console.error(
    "❌ REDIS CACHE ERROR:",
    redisError.message
  );

}

    // ==================================================
    // DEDUCT CREDITS
    // ==================================================

    user.credits -= 50;

    await user.save();

    // ==================================================
    // FINAL LOG
    // ==================================================

    console.log(
      `Total Coding Generation Time: ${
        Date.now() - totalStart
      } ms`,
    );

    // ==================================================
    // SUCCESS RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,

      msg: "Coding round generated successfully.",

      data: parsed,

      codingID: codeQuestion._id.toString(),
    });
  } catch (error) {
    console.error(
      "CODE GENERATOR ERROR:",
      error.message,
    );

    // ==================================================
    // MONGOOSE VALIDATION ERROR
    // ==================================================

    if (error.name === "ValidationError") {
      console.error(
        "MONGOOSE VALIDATION ERROR:",
        Object.keys(error.errors || {}),
      );

      return res.status(400).json({
        success: false,

        msg: "Generated coding question contains invalid data.",

        details: Object.keys(
          error.errors || {},
        ),
      });
    }

    // ==================================================
    // DUPLICATE KEY
    // ==================================================

    if (error.code === 11000) {
      console.error(
        "MONGODB DUPLICATE KEY:",
        error.keyValue,
      );

      return res.status(409).json({
        success: false,
        msg: "Duplicate data detected.",
      });
    }

    // ==================================================
    // GENERAL ERROR
    // ==================================================

    return res.status(500).json({
      success: false,

      msg:
        error.message ||
        "Something went wrong while generating the coding round.",
    });
  }
};

// ======================================================
// GET CODING QUESTION DETAILS
// ======================================================

const codeQuesDetail = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Coding ID is required",
      });
    }

    const codingQuestionDetails =
      await CodingDetails.findById(id);

    if (!codingQuestionDetails) {
      return res.status(404).json({
        success: false,
        message: "Coding question not found",
      });
    }

    return res.status(200).json({
      success: true,

      message:
        "Coding question fetched successfully",

      details: codingQuestionDetails,

      codingId: id,
    });
  } catch (error) {
    console.error(
      "CODE QUESTION DETAIL ERROR:",
      error.message,
    );

    return res.status(500).json({
      success: false,

      message: "Failed to fetch coding question",

      error: error.message,
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  codeQuesGenerator,
  codeQuesDetail,
};