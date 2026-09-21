const axios = require("axios");
const CodingDetails = require("../models/codeAI");
const userDetails = require("../models/auth");

const OPENROUTER_HEADERS = {
  Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
  "Content-Type": "application/json",
};

const codeQuesGenerator = async (req, res) => {
  try {
    // ==========================================
    // 1. GET USER + PROMPT
    // ==========================================

    const userId = req.userId;
    const { prompt } = req.body;

    const quesNo = 5;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        msg: "Prompt is empty or undefined",
      });
    }

    // ==========================================
    // 2. FIND USER
    // ==========================================

    const user = await userDetails.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    // ==========================================
    // 3. CHECK CREDITS
    // ==========================================

    if (user.credits < 50) {
      return res.status(400).json({
        success: false,
        msg: "Minimum 50 credits are required",
      });
    }

    // ==========================================
    // 4. AI PROMPT
    // ==========================================

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
- testCases
- starterCode
- redirectUrl
- platformImage

4. difficulty for each question MUST be exactly one of:

"easy"
"medium"
"hard"

5. Overall difficulty MUST be exactly one of:

"easy"
"medium"
"hard"
"mixed"

6. allowedLanguages MUST contain only:

"cpp"
"python"
"javascript"

7. Every question MUST contain at least 2 examples.

8. Every question MUST contain at least 7 test cases.

9. Every question MUST contain at least:

- 2 public test cases
- 5 hidden test cases

==================================================
EXAMPLE REQUIREMENTS
==================================================

10. Every example MUST contain:

- input
- output
- explanation

11. Example input MUST always be present and MUST be a non-empty string.

12. Example output MUST always be present.

An output value can be:

- string
- number
- boolean
- array
- object

An empty array [] is VALID.

Do NOT omit the output field.

Do NOT use null for output.

==================================================
TEST CASE REQUIREMENTS
==================================================

13. Every test case MUST contain:

- input
- expectedOutput
- isHidden

14. Every test case MUST have a non-empty input.

15. Every test case MUST have expectedOutput.

An expectedOutput value can be:

- string
- number
- boolean
- array
- object

An empty array [] is VALID.

Do NOT omit expectedOutput.

Do NOT use null for expectedOutput.

16. PUBLIC TEST CASES ARE ESPECIALLY IMPORTANT.

The first 2 or more public test cases MUST ALWAYS contain:

- input
- expectedOutput
- isHidden: false

Never generate a public test case with missing input.

Never generate a public test case with missing expectedOutput.

Before returning JSON, explicitly verify every public test case.

17. Hidden test cases MUST contain:

- input
- expectedOutput
- isHidden: true

18. Hidden test cases MUST cover important edge cases.

19. expectedOutput MUST be correct for the corresponding input.

20. Do not create test cases that violate the constraints.

21. isHidden MUST be either true or false.

22. Do NOT leave any test case field undefined.

23. Do NOT return incomplete test cases.

24. Before returning the JSON, perform this internal validation:

For every question:

- examples.length >= 2
- testCases.length >= 7
- public test cases >= 2
- hidden test cases >= 5

For every example:

- input exists
- input is a non-empty string
- output exists
- explanation exists

For every test case:

- input exists
- input is a non-empty string
- expectedOutput exists
- isHidden exists

If any field is missing, FIX IT BEFORE RETURNING THE JSON.

25. timeLimit MUST be a number in seconds.

26. memoryLimit MUST be a number in MB.

27. Do NOT include solutions.

28. Do NOT include source code.

29. Do NOT create duplicate questions.

30. Do NOT use Markdown.

31. Do NOT use a Markdown code block.

32. Return ONLY valid JSON.

33. Do NOT escape the complete JSON as a string.

34. Do NOT leave any required field missing.

35. Before returning the JSON, verify that EVERY example contains input, output, and explanation.

36. Before returning the JSON, verify that EVERY test case contains input, expectedOutput, and isHidden.

==================================================
STARTER CODE
==================================================

37. For every question, generate starterCode for:

cpp
python
javascript

38. The starter code must provide the complete function/class signature required to solve the problem.

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

Do not include the solution logic.

Only provide the function/class template.

==================================================
JSON STRUCTURE
==================================================

Return exactly this JSON structure:

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
          "explanation": "Explanation"
        },
        {
          "input": "3",
          "output": "6",
          "explanation": "Explanation"
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
      "memoryLimit": 256,
      "testCases": [
        {
          "input": "5",
          "expectedOutput": "120",
          "isHidden": false
        },
        {
          "input": "3",
          "expectedOutput": "6",
          "isHidden": false
        },
        {
          "input": "1",
          "expectedOutput": "1",
          "isHidden": true
        },
        {
          "input": "0",
          "expectedOutput": "0",
          "isHidden": true
        },
        {
          "input": "10",
          "expectedOutput": "3628800",
          "isHidden": true
        },
        {
          "input": "2",
          "expectedOutput": "2",
          "isHidden": true
        },
        {
          "input": "7",
          "expectedOutput": "5040",
          "isHidden": true
        }
      ]
    }
  ],
  "difficulty": "medium"
}`;

    // ==========================================
    // 5. CHECK API KEY
    // ==========================================

    if (!process.env.OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY is missing");

      return res.status(500).json({
        success: false,
        msg: "OPENROUTER_API_KEY is not configured",
      });
    }

    // ==========================================
    // 6. CALL OPENROUTER
    // ==========================================

    let result;

    try {
      result = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-4o-mini",

          messages: [
            {
              role: "user",
              content: message,
            },
          ],

          response_format: {
            type: "json_object",
          },
        },
        {
          headers: OPENROUTER_HEADERS,
        }
      );
    } catch (axiosError) {
      console.error("========== OPENROUTER ERROR ==========");
      console.error("Status:", axiosError.response?.status);
      console.error("Data:", axiosError.response?.data);
      console.error("Message:", axiosError.message);
      console.error("======================================");

      return res.status(502).json({
        success: false,
        msg:
          axiosError.response?.data?.error?.message ||
          axiosError.message ||
          "OpenRouter request failed.",
      });
    }

    // ==========================================
    // 7. GET AI RESPONSE
    // ==========================================

    const text =
      result?.data?.choices?.[0]?.message?.content;

    if (!text) {
      console.error(
        "AI returned no content:",
        result?.data
      );

      return res.status(502).json({
        success: false,
        msg: "AI returned an empty response.",
      });
    }

    // ==========================================
    // 8. CLEAN AI RESPONSE
    // ==========================================

    let cleanText = text.trim();

    if (cleanText.startsWith("```")) {
      cleanText = cleanText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
    }

    // ==========================================
    // 9. PARSE JSON
    // ==========================================

    let parsed;

    try {
      parsed = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("========== JSON PARSE ERROR ==========");
      console.error("Message:", parseError.message);
      console.error("AI Response:", cleanText);
      console.error("======================================");

      return res.status(422).json({
        success: false,
        msg: "AI generated invalid JSON.",
      });
    }

    // ==========================================
    // 10. BASIC RESPONSE VALIDATION
    // ==========================================

    if (
      !parsed ||
      !Array.isArray(parsed.questions)
    ) {
      console.error(
        "Invalid AI response: questions is not an array"
      );

      return res.status(500).json({
        success: false,
        msg: "AI response does not contain valid questions.",
      });
    }

    // ==========================================
    // 11. VALID VALUES
    // ==========================================

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

    if (!validDifficulties.includes(parsed.difficulty)) {
      console.error(
        "Invalid overall difficulty:",
        parsed.difficulty
      );

      return res.status(500).json({
        success: false,
        msg: "AI generated an invalid overall difficulty.",
      });
    }

    // ==========================================
    // 12. VALIDATE EACH QUESTION
    // ==========================================

    for (
      const [questionIndex, question]
      of parsed.questions.entries()
    ) {
      const questionNumber = questionIndex + 1;

      // ==========================================
      // REQUIRED FIELDS
      // ==========================================

      if (
        typeof question.title !== "string" ||
        question.title.trim() === ""
      ) {
        console.error(
          `Question ${questionNumber}: title missing`
        );

        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: title is missing.`,
        });
      }

      if (!question.difficulty) {
        console.error(
          `Question ${questionNumber}: difficulty missing`
        );

        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: difficulty is missing.`,
        });
      }

      if (
        !validQuestionDifficulties.includes(
          question.difficulty
        )
      ) {
        console.error(
          `Question ${questionNumber}: invalid difficulty`,
          question.difficulty
        );

        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber} has invalid difficulty.`,
        });
      }

      if (
        typeof question.topic !== "string" ||
        question.topic.trim() === ""
      ) {
        console.error(
          `Question ${questionNumber}: topic missing`
        );

        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: topic is missing.`,
        });
      }

      if (
        typeof question.description !== "string" ||
        question.description.trim() === ""
      ) {
        console.error(
          `Question ${questionNumber}: description missing`
        );

        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: description is missing.`,
        });
      }

      if (
        !Array.isArray(question.constraints) ||
        question.constraints.length === 0
      ) {
        console.error(
          `Question ${questionNumber}: invalid constraints`
        );

        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: constraints are invalid.`,
        });
      }

      if (
        typeof question.inputFormat !== "string" ||
        question.inputFormat.trim() === ""
      ) {
        console.error(
          `Question ${questionNumber}: inputFormat missing`
        );

        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: inputFormat is missing.`,
        });
      }

      if (
        typeof question.outputFormat !== "string" ||
        question.outputFormat.trim() === ""
      ) {
        console.error(
          `Question ${questionNumber}: outputFormat missing`
        );

        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: outputFormat is missing.`,
        });
      }

      // ==========================================
      // EXAMPLES
      // ==========================================

      if (
        !Array.isArray(question.examples) ||
        question.examples.length < 2
      ) {
        console.error(
          `Question ${questionNumber}: insufficient examples`
        );

        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber} must have at least 2 examples.`,
        });
      }

      // ==========================================
      // LANGUAGES
      // ==========================================

      if (
        !Array.isArray(question.allowedLanguages) ||
        question.allowedLanguages.length === 0
      ) {
        console.error(
          `Question ${questionNumber}: invalid allowedLanguages`
        );

        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: allowedLanguages is invalid.`,
        });
      }

      for (
        const language of question.allowedLanguages
      ) {
        if (!validLanguages.includes(language)) {
          console.error(
            `Question ${questionNumber}: invalid language`,
            language
          );

          return res.status(500).json({
            success: false,
            msg: `Question ${questionNumber} contains invalid language: ${language}`,
          });
        }
      }

      // ==========================================
      // STARTER CODE
      // ==========================================

      if (
        !question.starterCode ||
        typeof question.starterCode !== "object"
      ) {
        console.error(
          `Question ${questionNumber}: starterCode missing`
        );

        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: starterCode is missing.`,
        });
      }

      if (
        typeof question.starterCode.cpp !== "string" ||
        question.starterCode.cpp.trim() === ""
      ) {
        console.error(
          `Question ${questionNumber}: C++ starterCode missing`
        );

        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: C++ starterCode is missing.`,
        });
      }

      if (
        typeof question.starterCode.python !== "string" ||
        question.starterCode.python.trim() === ""
      ) {
        console.error(
          `Question ${questionNumber}: Python starterCode missing`
        );

        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: Python starterCode is missing.`,
        });
      }

      if (
        typeof question.starterCode.javascript !== "string" ||
        question.starterCode.javascript.trim() === ""
      ) {
        console.error(
          `Question ${questionNumber}: JavaScript starterCode missing`
        );

        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: JavaScript starterCode is missing.`,
        });
      }

      // ==========================================
      // TIME + MEMORY
      // ==========================================

      if (
        typeof question.timeLimit !== "number" ||
        question.timeLimit <= 0
      ) {
        console.error(
          `Question ${questionNumber}: invalid timeLimit`
        );

        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: timeLimit is invalid.`,
        });
      }

      if (
        typeof question.memoryLimit !== "number" ||
        question.memoryLimit <= 0
      ) {
        console.error(
          `Question ${questionNumber}: invalid memoryLimit`
        );

        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: memoryLimit is invalid.`,
        });
      }

      // ==========================================
      // TEST CASES
      // ==========================================

      if (
        !Array.isArray(question.testCases) ||
        question.testCases.length < 7
      ) {
        console.error(
          `Question ${questionNumber}: insufficient test cases`
        );

        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber} must have at least 7 test cases.`,
        });
      }

      // ==========================================
      // EXAMPLE VALIDATION
      // ==========================================

      for (
        const [exampleIndex, example]
        of question.examples.entries()
      ) {
        const exampleNumber = exampleIndex + 1;

        if (
          typeof example.input !== "string" ||
          example.input.trim() === ""
        ) {
          console.error(
            `Question ${questionNumber}, Example ${exampleNumber}: input missing`
          );

          return res.status(500).json({
            success: false,
            msg: `Question ${questionNumber}, Example ${exampleNumber}: input missing.`,
          });
        }

        // [] is valid
        // 0 is valid
        // false is valid
        // "" is NOT valid
        // null/undefined are NOT valid

        if (
          example.output === undefined ||
          example.output === null ||
          (
            typeof example.output === "string" &&
            example.output.trim() === ""
          )
        ) {
          console.error(
            `Question ${questionNumber}, Example ${exampleNumber}: output missing`
          );

          return res.status(500).json({
            success: false,
            msg: `Question ${questionNumber}, Example ${exampleNumber}: output missing.`,
          });
        }

        if (
          typeof example.explanation !== "string" ||
          example.explanation.trim() === ""
        ) {
          console.error(
            `Question ${questionNumber}, Example ${exampleNumber}: explanation missing`
          );

          return res.status(500).json({
            success: false,
            msg: `Question ${questionNumber}, Example ${exampleNumber}: explanation missing.`,
          });
        }
      }

      // ==========================================
      // TEST CASE VALIDATION
      // ==========================================

      for (
        const [testIndex, testCase]
        of question.testCases.entries()
      ) {
        const testNumber = testIndex + 1;

        // IMPORTANT:
        // Public and hidden test cases both require input.
        // Empty string is invalid.
        // null/undefined are invalid.

        if (
          typeof testCase.input !== "string" ||
          testCase.input.trim() === ""
        ) {
          console.error(
            `Question ${questionNumber}, Test Case ${testNumber}: input missing`
          );

          return res.status(500).json({
            success: false,
            msg: `Question ${questionNumber}, Test Case ${testNumber}: input missing.`,
          });
        }

        // [] is valid
        // 0 is valid
        // false is valid
        // "" is NOT valid
        // null/undefined are NOT valid

        if (
          testCase.expectedOutput === undefined ||
          testCase.expectedOutput === null ||
          (
            typeof testCase.expectedOutput === "string" &&
            testCase.expectedOutput.trim() === ""
          )
        ) {
          console.error(
            `Question ${questionNumber}, Test Case ${testNumber}: expectedOutput missing`
          );

          return res.status(500).json({
            success: false,
            msg: `Question ${questionNumber}, Test Case ${testNumber}: expectedOutput missing.`,
          });
        }

        if (
          typeof testCase.isHidden !== "boolean"
        ) {
          console.error(
            `Question ${questionNumber}, Test Case ${testNumber}: isHidden invalid`
          );

          return res.status(500).json({
            success: false,
            msg: `Question ${questionNumber}, Test Case ${testNumber}: isHidden must be boolean.`,
          });
        }
      }

      // ==========================================
      // PUBLIC / HIDDEN TEST CASES
      // ==========================================

      const publicTests =
        question.testCases.filter(
          (testCase) =>
            testCase.isHidden === false
        );

      const hiddenTests =
        question.testCases.filter(
          (testCase) =>
            testCase.isHidden === true
        );

      if (publicTests.length < 2) {
        console.error(
          `Question ${questionNumber}: insufficient public tests`
        );

        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber} must have at least 2 public test cases.`,
        });
      }

      if (hiddenTests.length < 5) {
        console.error(
          `Question ${questionNumber}: insufficient hidden tests`
        );

        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber} must have at least 5 hidden test cases.`,
        });
      }
    }

    // ==========================================
    // 13. PREPARE MONGODB DATA
    // ==========================================

    const quesDetails = parsed.questions.map(
      (question) => ({
        title: question.title,
        difficulty: question.difficulty,
        topic: question.topic,
        redirectUrl: question?.redirectUrl || "",
        platformImage: question?.platformImage || "",
        description: question.description,
        constraints: question.constraints,
        inputFormat: question.inputFormat,
        outputFormat: question.outputFormat,

        // Keep output as its original type.
        // [] remains [].
        examples: question.examples,

        allowedLanguages:
          question.allowedLanguages,

        // ==========================================
        // STARTER CODE
        // ==========================================

        starterCode: {
          cpp: question.starterCode.cpp,
          python: question.starterCode.python,
          javascript: question.starterCode.javascript,
        },

        timeLimit: question.timeLimit,
        memoryLimit: question.memoryLimit,

        // Keep expectedOutput as its original type.
        testCases: question.testCases,
      })
    );

    // ==========================================
    // 14. CREATE DOCUMENT
    // ==========================================

    const codeQuestion =
      new CodingDetails({
        createdBy: userId,
        prompt: prompt,
        difficulty: parsed.difficulty,
        numberOfQuestions: quesNo,
        startedAt: new Date(),
        codingDetails: quesDetails,
      });

    // ==========================================
    // 15. SAVE TO MONGODB
    // ==========================================

    try {
      await codeQuestion.save();
    } catch (mongoError) {
      console.error(
        "========== MONGODB SAVE ERROR =========="
      );
      console.error("Name:", mongoError.name);
      console.error("Message:", mongoError.message);
      console.error("Errors:", mongoError.errors);
      console.error("Code:", mongoError.code);
      console.error(
        "========================================"
      );

      throw mongoError;
    }

    // ==========================================
    // 16. DEDUCT CREDITS
    // ==========================================

    user.credits -= 50;

    await user.save();

    // ==========================================
    // 17. SUCCESS
    // ==========================================

    return res.status(200).json({
      success: true,
      msg: "Coding round generated successfully.",
      data: parsed,
      codingID: codeQuestion._id.toString(),
    });

  } catch (error) {
    console.error(
      "========== CODE GENERATOR ERROR =========="
    );
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error("Code:", error.code);

    if (error.name === "ValidationError") {
      console.error(
        "Mongoose validation errors:",
        error.errors
      );

      return res.status(400).json({
        success: false,
        msg: "Generated coding question contains invalid data.",
        details: Object.keys(error.errors || {}),
      });
    }

    if (error.code === 11000) {
      console.error(
        "MongoDB duplicate key error:",
        error.keyValue
      );

      return res.status(409).json({
        success: false,
        msg: "Duplicate data detected.",
      });
    }

    console.error("Stack:", error.stack);
    console.error(
      "=========================================="
    );

    return res.status(500).json({
      success: false,
      msg:
        error.message ||
        "Something went wrong while generating the coding round.",
    });
  }
};

// ==========================================
// GET CODING QUESTION BY ID
// ==========================================

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
      message: "Coding question fetched successfully",
      details: codingQuestionDetails,
      codingId: id,
    });

  } catch (error) {
    console.error(
      "CODE QUESTION DETAIL ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch coding question",
      error: error.message,
    });
  }
};

module.exports = {
  codeQuesGenerator,
  codeQuesDetail,
};