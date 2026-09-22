const axios = require("axios");
const CodingDetails = require("../models/codeAI");
const userDetails = require("../models/auth");

const OPENROUTER_HEADERS = {
  Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
  "Content-Type": "application/json",
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

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

Your task is to generate a coding round based on the user's request.

USER REQUEST:
${prompt}

Generate exactly ${quesNo} coding questions.

STRICT RULES:

1. Generate exactly ${quesNo} questions.

2. Questions can be based on common DSA/coding problem patterns from platforms such as LeetCode, HackerRank, CodeChef, etc. They are NOT required to belong to any specific platform.

The generated questions may be:
- Original/custom
- Platform-inspired
- Associated with a known coding platform

==================================================
PLATFORM MIX REQUIREMENT
==================================================

The coding round MUST contain a mixed combination of questions.

Do NOT make all questions platform-associated.

Do NOT make all questions original.

Whenever the number of questions allows it, include a mixture of:
- Questions associated with known coding platforms.
- Original/custom questions that are not associated with any platform.

For example, if generating 5 questions, a possible distribution is:

- Question 1 → LeetCode
- Question 2 → Original/custom
- Question 3 → CodeChef
- Question 4 → Original/custom
- Question 5 → HackerRank

Another valid distribution could be:

- Question 1 → Original/custom
- Question 2 → LeetCode
- Question 3 → Original/custom
- Question 4 → Codeforces
- Question 5 → Original/custom

The exact distribution can vary.

IMPORTANT:

Do not force every question to have a platform.

Do not force every question to be original.

The round should feel like a realistic coding assessment containing both platform-associated/platform-inspired questions and custom questions.

For a platform-associated question:

"redirectUrl": "verified problem URL",
"platformImage": "verified direct platform logo URL"

For an original/custom question:

"redirectUrl": null,
"platformImage": null

NEVER fabricate a platform association.

NEVER create a fake redirectUrl.

NEVER create a fake platformImage.

If a valid platform URL or logo URL cannot be confidently provided, treat the question as an original/custom question and set:

"redirectUrl": null,
"platformImage": null

==================================================
QUESTION REQUIREMENTS
==================================================

3. Each question MUST contain:

- title
- difficulty
- topic
- description
- constraints
- inputFormat
- outputFormat
- examples
- allowedLanguages
- timeLimit
- memoryLimit
- starterCode
- redirectUrl
- platformImage

DO NOT include:

- testCases
- expectedOutput
- isHidden
- hidden test cases
- public test cases

The generated JSON MUST NOT contain a "testCases" field anywhere.

==================================================
DIFFICULTY
==================================================

4. difficulty for each question MUST be exactly one of:

"easy"
"medium"
"hard"

5. Overall difficulty MUST be exactly one of:

"easy"
"medium"
"hard"
"mixed"

==================================================
LANGUAGES
==================================================

6. allowedLanguages MUST contain only:

"cpp"
"python"
"javascript"

Every question MUST support all three languages.

==================================================
CONSTRAINT REQUIREMENTS
==================================================

7. constraints MUST ALWAYS be a non-empty array.

8. constraints MUST contain at least 1 constraint.

9. Every constraint MUST be a non-empty string.

10. NEVER return:

"constraints": []

11. NEVER return:

"constraints": null

12. NEVER omit the constraints field.

13. NEVER return constraints as a single string.

14. Constraints MUST be relevant to the problem.

For example:

"constraints": [
  "1 <= n <= 100000",
  "1 <= nums[i] <= 1000000000"
]

Even if a problem appears simple, provide meaningful constraints describing valid input size, value ranges, or other relevant limits.

==================================================
EXAMPLE REQUIREMENTS
==================================================

15. Every question MUST contain at least 2 examples.

16. Every example MUST contain:

- input
- output
- explanation

17. Example input MUST always be present and MUST be a non-empty string.

18. Example output MUST always be present.

An output value can be:

- string
- number
- boolean
- array
- object

An empty array [] is VALID.

Do NOT omit the output field.

Do NOT use null for output.

19. Every explanation MUST be a non-empty string.

20. Examples must correctly represent the problem and must follow the given constraints.

==================================================
QUESTION QUALITY
==================================================

21. Do NOT include solutions.

22. Do NOT include solution code.

23. Do NOT create duplicate questions.

24. Questions must be logically correct and solvable.

25. The description must clearly explain the problem.

26. Constraints must be relevant to the problem.

27. inputFormat must clearly describe the input.

28. outputFormat must clearly describe the expected output.

29. Examples must match the problem description.

30. timeLimit MUST be a positive number representing seconds.

31. memoryLimit MUST be a positive number representing MB.

32. Do NOT fabricate platform information.

33. Do NOT fabricate URLs.

34. redirectUrl and platformImage may be null.

35. If the question is original/custom, always use:

"redirectUrl": null,
"platformImage": null

==================================================
STARTER CODE
==================================================

36. For every question, generate starterCode for:

cpp
python
javascript

37. The starter code must provide the complete function/class signature required to solve the problem.

The candidate should NOT need to write:

- public class
- class Solution
- function signature
- parameter declarations
- return type
- main function

For C++:

Use LeetCode-style class Solution.

The C++ starter code MUST be MULTI-LINE.

Example:

class Solution {
public:
    int search(vector<int>& nums, int target) {

    }
};

For Python:

Use LeetCode-style class Solution.

Example:

class Solution:
    def twoSum(self, nums, target):
        pass

For JavaScript:

Use a LeetCode-style function signature.

Example:

var twoSum = function(nums, target) {

};

Do not include solution logic.

Only provide the function/class template.

==================================================
JSON OUTPUT REQUIREMENTS
==================================================

38. Return ONLY valid JSON.

39. Do NOT return Markdown.

40. Do NOT use a Markdown code block.

41. Do NOT wrap the complete JSON inside a string.

42. Do NOT add explanations outside the JSON.

43. Do NOT add comments inside the JSON.

44. Do NOT include any fields that are not part of the required structure.

45. Before returning the JSON, internally verify:

- Exactly ${quesNo} questions exist.
- Every question contains all required fields.
- constraints is a non-empty array.
- Every constraint is a non-empty string.
- constraints is NEVER [].
- Every question has at least 2 examples.
- Every example contains input, output, and explanation.
- Every example input is a non-empty string.
- Every example output is present and is not null.
- Every question contains cpp, python, and javascript starterCode.
- No starterCode contains solution logic.
- Every question has a valid difficulty.
- Overall difficulty is valid.
- allowedLanguages contains cpp, python, and javascript.
- timeLimit is a positive number.
- memoryLimit is a positive number.
- No duplicate questions exist.
- Platform URLs are not fabricated.
- Original/custom questions have redirectUrl and platformImage set to null.
- MOST IMPORTANT: No "testCases" field exists anywhere in the JSON.

If any requirement is violated, FIX IT BEFORE RETURNING THE JSON.

==================================================
JSON STRUCTURE
==================================================

Return exactly this structure:

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
          "input": "5",
          "output": "120",
          "explanation": "Explanation of the example"
        },
        {
          "input": "3",
          "output": "6",
          "explanation": "Explanation of the example"
        }
      ],
      "allowedLanguages": [
        "cpp",
        "python",
        "javascript"
      ],
      "starterCode": {
        "cpp": "class Solution {\\npublic:\\n    int search(vector<int>& nums, int target) {\\n        \\n    }\\n};",
        "python": "class Solution:\\n    def twoSum(self, nums, target):\\n        pass",
        "javascript": "var twoSum = function(nums, target) {\\n\\n};"
      },
      "timeLimit": 2,
      "memoryLimit": 256
    }
  ],
  "difficulty": "medium"
}

FINAL REQUIREMENT:

Return ONLY the JSON object.

There MUST NOT be any "testCases" field anywhere in the response.`;

    const generateOneQuestion = async (questionNumber, extraInstruction) => {
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
- No testCases.
- No solution code.
- No extra fields.

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
          (constraint) => typeof constraint !== "string" || !constraint.trim(),
        )
      ) {
        throw new Error(`Question ${questionNumber}: constraints invalid`);
      }

      if (!Array.isArray(question.examples) || question.examples.length < 2) {
        throw new Error(`Question ${questionNumber}: insufficient examples`);
      }

      if (
        !Array.isArray(question.allowedLanguages) ||
        question.allowedLanguages.length !== 3
      ) {
        throw new Error(`Question ${questionNumber}: allowedLanguages invalid`);
      }

      if (!question.starterCode || typeof question.starterCode !== "object") {
        throw new Error(`Question ${questionNumber}: starterCode missing`);
      }

      if (
        question.redirectUrl !== null &&
        typeof question.redirectUrl !== "string"
      ) {
        throw new Error(`Question ${questionNumber}: invalid redirectUrl`);
      }

      if (
        question.platformImage !== null &&
        typeof question.platformImage !== "string"
      ) {
        throw new Error(`Question ${questionNumber}: invalid platformImage`);
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

Generate meaningful constraints based on the actual problem.`,
          );

          return result;
        } catch (error) {
          lastError = error;

          if (attempt < maxRetries + 1) {
            console.log(`Question ${questionNumber}: retrying...`);
          }
        }
      }

      throw new Error(
        `Question ${questionNumber} failed after ${
          maxRetries + 1
        } attempts: ${lastError?.message || "Unknown error"}`,
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

    console.log(`Parallel AI Time: ${Date.now() - aiStart} ms`);

    // ==================================================
    // COMBINE RESULTS
    // ==================================================

    const difficulties = results.map((result) => result.question.difficulty);

    const uniqueDifficulties = [...new Set(difficulties)];

    const overallDifficulty =
      uniqueDifficulties.length === 1 ? uniqueDifficulties[0] : "mixed";

    const parsed = {
      questions: results.map((result) => result.question),
      difficulty: overallDifficulty,
    };

    // ==================================================
    // COMBINED RESPONSE VALIDATION
    // ==================================================

    if (!parsed || !Array.isArray(parsed.questions)) {
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

    const validDifficulties = ["easy", "medium", "hard", "mixed"];

    const validQuestionDifficulties = ["easy", "medium", "hard"];

    const validLanguages = ["cpp", "python", "javascript"];

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

    for (const [questionIndex, question] of parsed.questions.entries()) {
      const questionNumber = questionIndex + 1;

      if (typeof question.title !== "string" || question.title.trim() === "") {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: title is missing.`,
        });
      }

      const normalizedTitle = question.title.trim().toLowerCase();

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

      if (!validQuestionDifficulties.includes(question.difficulty)) {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: invalid difficulty.`,
        });
      }

      // ----------------------------------------------
      // TOPIC
      // ----------------------------------------------

      if (typeof question.topic !== "string" || question.topic.trim() === "") {
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
          (constraint) => typeof constraint !== "string" || !constraint.trim(),
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
      // EXAMPLES
      // ----------------------------------------------

      if (!Array.isArray(question.examples) || question.examples.length < 2) {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber} must have at least 2 examples.`,
        });
      }

      for (const [exampleIndex, example] of question.examples.entries()) {
        const exampleNumber = exampleIndex + 1;

        // Input
        if (typeof example.input !== "string" || example.input.trim() === "") {
          return res.status(500).json({
            success: false,
            msg: `Question ${questionNumber}, Example ${exampleNumber}: input missing.`,
          });
        }

        // Output
        if (example.output === undefined || example.output === null) {
          return res.status(500).json({
            success: false,
            msg: `Question ${questionNumber}, Example ${exampleNumber}: output missing.`,
          });
        }

        // Empty string output is invalid
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
        !validLanguages.every((language) =>
          question.allowedLanguages.includes(language),
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

      if (!question.starterCode || typeof question.starterCode !== "object") {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: starterCode is missing.`,
        });
      }

      if (
        typeof question.starterCode.cpp !== "string" ||
        question.starterCode.cpp.trim() === ""
      ) {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: C++ starterCode is missing.`,
        });
      }

      if (
        typeof question.starterCode.python !== "string" ||
        question.starterCode.python.trim() === ""
      ) {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: Python starterCode is missing.`,
        });
      }

      if (
        typeof question.starterCode.javascript !== "string" ||
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

      if (typeof question.timeLimit !== "number" || question.timeLimit <= 0) {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: timeLimit is invalid.`,
        });
      }

      // ----------------------------------------------
      // MEMORY LIMIT
      // ----------------------------------------------

      if (
        typeof question.memoryLimit !== "number" ||
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

      // ----------------------------------------------
      // NO TEST CASES
      // ----------------------------------------------

      if (Object.prototype.hasOwnProperty.call(question, "testCases")) {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: testCases are not allowed.`,
        });
      }
    }

    // ==================================================
    // PREPARE MONGODB DATA
    // ==================================================

    const quesDetails = parsed.questions.map((question) => ({
      title: question.title,
      difficulty: question.difficulty,
      topic: question.topic,

      redirectUrl: question.redirectUrl || "",

      platformImage: question.platformImage || "",

      description: question.description,

      constraints: question.constraints,

      inputFormat: question.inputFormat,

      outputFormat: question.outputFormat,

      examples: question.examples,

      allowedLanguages: question.allowedLanguages,

      starterCode: {
        cpp: question.starterCode.cpp,

        python: question.starterCode.python,

        javascript: question.starterCode.javascript,
      },

      timeLimit: question.timeLimit,

      memoryLimit: question.memoryLimit,
    }));

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
      console.error("MONGODB SAVE ERROR:", mongoError.message);

      throw mongoError;
    }

    // ==================================================
    // DEDUCT CREDITS
    // ==================================================

    user.credits -= 50;

    await user.save();

    // ==================================================
    // FINAL LOG
    // ==================================================

    console.log(`Total Coding Generation Time: ${Date.now() - totalStart} ms`);

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
    console.error("CODE GENERATOR ERROR:", error.message);

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

        details: Object.keys(error.errors || {}),
      });
    }

    // ==================================================
    // DUPLICATE KEY
    // ==================================================

    if (error.code === 11000) {
      console.error("MONGODB DUPLICATE KEY:", error.keyValue);

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

    const codingQuestionDetails = await CodingDetails.findById(id);

    if (!codingQuestionDetails) {
      return res.status(404).json({
        success: false,
        message: "Coding question not found",
      });
    }

    return res.status(200).json({
      success: true,

      message: "Coding question fetched successfully",

      details: codingQuestionDetails,

      codingId: id,
    });
  } catch (error) {
    console.error("CODE QUESTION DETAIL ERROR:", error.message);

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
