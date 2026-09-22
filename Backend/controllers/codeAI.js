const axios = require("axios");
const CodingDetails = require("../models/codeAI");
const userDetails = require("../models/auth");

const OPENROUTER_HEADERS = {
  Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
  "Content-Type": "application/json",
};

const codeQuesGenerator = async (req, res) => {
  const totalStart = Date.now();

  try {
    const userId = req.userId;
    const { prompt } = req.body;
    const quesNo = 5;

    if (!prompt || !prompt.trim()) {
      console.error("CODE GENERATOR: Prompt is empty");

      return res.status(400).json({
        success: false,
        msg: "Prompt is empty or undefined",
      });
    }

    const userDbStart = Date.now();

    const user = await userDetails.findById(userId);

    console.log(
      `User DB Time: ${Date.now() - userDbStart} ms`
    );

    if (!user) {
      console.error(`CODE GENERATOR: User not found - ${userId}`);

      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    if (user.credits < 50) {
      console.error(
        `CODE GENERATOR: Insufficient credits - ${user.credits}`
      );

      return res.status(400).json({
        success: false,
        msg: "Minimum 50 credits are required",
      });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      console.error(
        "CODE GENERATOR: OPENROUTER_API_KEY is missing"
      );

      return res.status(500).json({
        success: false,
        msg: "OPENROUTER_API_KEY is not configured",
      });
    }

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
EXAMPLE REQUIREMENTS
==================================================

7. Every question MUST contain at least 2 examples.

8. Every example MUST contain:

- input
- output
- explanation

9. Example input MUST always be present and MUST be a non-empty string.

10. Example output MUST always be present.

An output value can be:

- string
- number
- boolean
- array
- object

An empty array [] is VALID.

Do NOT omit the output field.

Do NOT use null for output.

11. Every explanation MUST be a non-empty string.

12. Examples must correctly represent the problem and must follow the given constraints.

==================================================
QUESTION QUALITY
==================================================

13. Do NOT include solutions.

14. Do NOT include solution code.

15. Do NOT create duplicate questions.

16. Questions must be logically correct and solvable.

17. The description must clearly explain the problem.

18. Constraints must be relevant to the problem.

19. inputFormat must clearly describe the input.

20. outputFormat must clearly describe the expected output.

21. Examples must match the problem description.

22. timeLimit MUST be a positive number representing seconds.

23. memoryLimit MUST be a positive number representing MB.

24. Do NOT fabricate platform information.

25. Do NOT fabricate URLs.

26. redirectUrl and platformImage may be null.

27. If the question is original/custom, always use:

"redirectUrl": null,
"platformImage": null

==================================================
STARTER CODE
==================================================

28. For every question, generate starterCode for:

cpp
python
javascript

29. The starter code must provide the complete function/class signature required to solve the problem.

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

30. Return ONLY valid JSON.

31. Do NOT return Markdown.

32. Do NOT use a Markdown code block.

33. Do NOT wrap the complete JSON inside a string.

34. Do NOT add explanations outside the JSON.

35. Do NOT add comments inside the JSON.

36. Do NOT include any fields that are not part of the required structure.

37. Before returning the JSON, internally verify:

- Exactly ${quesNo} questions exist.
- Every question contains all required fields.
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

    let result;

    const aiStart = Date.now();

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
          timeout: 120000,
        }
      );

      console.log(
        `AI Response Time: ${Date.now() - aiStart} ms`
      );
    } catch (axiosError) {
      console.error(
        "OPENROUTER ERROR:",
        axiosError.response?.data?.error?.message ||
          axiosError.message
      );

      return res.status(502).json({
        success: false,
        msg:
          axiosError.response?.data?.error?.message ||
          axiosError.message ||
          "OpenRouter request failed.",
      });
    }

    const text =
      result?.data?.choices?.[0]?.message?.content;

    if (!text) {
      console.error(
        "CODE GENERATOR: AI returned empty content"
      );

      return res.status(502).json({
        success: false,
        msg: "AI returned an empty response.",
      });
    }

    let cleanText = text.trim();

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
      console.error(
        "JSON PARSE ERROR:",
        parseError.message
      );

      return res.status(422).json({
        success: false,
        msg: "AI generated invalid JSON.",
      });
    }

    if (
      !parsed ||
      !Array.isArray(parsed.questions)
    ) {
      console.error(
        "CODE GENERATOR: Invalid questions array"
      );

      return res.status(500).json({
        success: false,
        msg:
          "AI response does not contain valid questions.",
      });
    }

    if (parsed.questions.length !== quesNo) {
      console.error(
        `CODE GENERATOR: Expected ${quesNo} questions, received ${parsed.questions.length}`
      );

      return res.status(500).json({
        success: false,
        msg:
          `AI must generate exactly ${quesNo} questions.`,
      });
    }

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

    if (
      !validDifficulties.includes(
        parsed.difficulty
      )
    ) {
      console.error(
        "CODE GENERATOR: Invalid overall difficulty"
      );

      return res.status(500).json({
        success: false,
        msg:
          "AI generated an invalid overall difficulty.",
      });
    }

    for (
      const [questionIndex, question]
      of parsed.questions.entries()
    ) {
      const questionNumber =
        questionIndex + 1;

      if (
        typeof question.title !== "string" ||
        question.title.trim() === ""
      ) {
        console.error(
          `Question ${questionNumber}: title missing`
        );

        return res.status(500).json({
          success: false,
          msg:
            `Question ${questionNumber}: title is missing.`,
        });
      }

      if (
        !validQuestionDifficulties.includes(
          question.difficulty
        )
      ) {
        console.error(
          `Question ${questionNumber}: invalid difficulty`
        );

        return res.status(500).json({
          success: false,
          msg:
            `Question ${questionNumber}: invalid difficulty.`,
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
          msg:
            `Question ${questionNumber}: topic is missing.`,
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
          msg:
            `Question ${questionNumber}: description is missing.`,
        });
      }

      if (
        !Array.isArray(question.constraints) ||
        question.constraints.length === 0
      ) {
        console.error(
          `Question ${questionNumber}: constraints invalid`
        );

        return res.status(500).json({
          success: false,
          msg:
            `Question ${questionNumber}: constraints are invalid.`,
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
          msg:
            `Question ${questionNumber}: inputFormat is missing.`,
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
          msg:
            `Question ${questionNumber}: outputFormat is missing.`,
        });
      }

      if (
        !Array.isArray(question.examples) ||
        question.examples.length < 2
      ) {
        console.error(
          `Question ${questionNumber}: insufficient examples`
        );

        return res.status(500).json({
          success: false,
          msg:
            `Question ${questionNumber} must have at least 2 examples.`,
        });
      }

      for (
        const [
          exampleIndex,
          example,
        ] of question.examples.entries()
      ) {
        const exampleNumber =
          exampleIndex + 1;

        if (
          typeof example.input !== "string" ||
          example.input.trim() === ""
        ) {
          console.error(
            `Question ${questionNumber}, Example ${exampleNumber}: input missing`
          );

          return res.status(500).json({
            success: false,
            msg:
              `Question ${questionNumber}, Example ${exampleNumber}: input missing.`,
          });
        }

        if (
          example.output === undefined ||
          example.output === null
        ) {
          console.error(
            `Question ${questionNumber}, Example ${exampleNumber}: output missing`
          );

          return res.status(500).json({
            success: false,
            msg:
              `Question ${questionNumber}, Example ${exampleNumber}: output missing.`,
          });
        }

        if (
          typeof example.output === "string" &&
          example.output.trim() === ""
        ) {
          console.error(
            `Question ${questionNumber}, Example ${exampleNumber}: output empty`
          );

          return res.status(500).json({
            success: false,
            msg:
              `Question ${questionNumber}, Example ${exampleNumber}: output cannot be empty.`,
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
            msg:
              `Question ${questionNumber}, Example ${exampleNumber}: explanation missing.`,
          });
        }
      }

      if (
        !Array.isArray(question.allowedLanguages) ||
        question.allowedLanguages.length !== 3
      ) {
        console.error(
          `Question ${questionNumber}: allowedLanguages invalid`
        );

        return res.status(500).json({
          success: false,
          msg:
            `Question ${questionNumber}: allowedLanguages is invalid.`,
        });
      }

      for (
        const language
        of question.allowedLanguages
      ) {
        if (
          !validLanguages.includes(language)
        ) {
          console.error(
            `Question ${questionNumber}: invalid language ${language}`
          );

          return res.status(500).json({
            success: false,
            msg:
              `Question ${questionNumber}: invalid language ${language}.`,
          });
        }
      }

      if (
        !question.starterCode ||
        typeof question.starterCode !== "object"
      ) {
        console.error(
          `Question ${questionNumber}: starterCode missing`
        );

        return res.status(500).json({
          success: false,
          msg:
            `Question ${questionNumber}: starterCode is missing.`,
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
          msg:
            `Question ${questionNumber}: C++ starterCode is missing.`,
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
          msg:
            `Question ${questionNumber}: Python starterCode is missing.`,
        });
      }

      if (
        typeof question.starterCode.javascript !==
          "string" ||
        question.starterCode.javascript.trim() === ""
      ) {
        console.error(
          `Question ${questionNumber}: JavaScript starterCode missing`
        );

        return res.status(500).json({
          success: false,
          msg:
            `Question ${questionNumber}: JavaScript starterCode is missing.`,
        });
      }

      if (
        typeof question.timeLimit !== "number" ||
        question.timeLimit <= 0
      ) {
        console.error(
          `Question ${questionNumber}: invalid timeLimit`
        );

        return res.status(500).json({
          success: false,
          msg:
            `Question ${questionNumber}: timeLimit is invalid.`,
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
          msg:
            `Question ${questionNumber}: memoryLimit is invalid.`,
        });
      }

      if (
        question.redirectUrl !== null &&
        typeof question.redirectUrl !== "string"
      ) {
        console.error(
          `Question ${questionNumber}: invalid redirectUrl`
        );

        return res.status(500).json({
          success: false,
          msg:
            `Question ${questionNumber}: redirectUrl is invalid.`,
        });
      }

      if (
        question.platformImage !== null &&
        typeof question.platformImage !== "string"
      ) {
        console.error(
          `Question ${questionNumber}: invalid platformImage`
        );

        return res.status(500).json({
          success: false,
          msg:
            `Question ${questionNumber}: platformImage is invalid.`,
        });
      }
    }

    const quesDetails =
      parsed.questions.map(
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
          memoryLimit: question.memoryLimit,
        })
      );

    const codeQuestion =
      new CodingDetails({
        createdBy: userId,
        prompt: prompt,
        difficulty: parsed.difficulty,
        numberOfQuestions: quesNo,
        startedAt: new Date(),
        codingDetails: quesDetails,
      });

    try {
      await codeQuestion.save();
    } catch (mongoError) {
      console.error(
        "MONGODB SAVE ERROR:",
        mongoError.message
      );

      throw mongoError;
    }

    user.credits -= 50;

    await user.save();

    console.log(
      `Total Coding Generation Time: ${Date.now() - totalStart} ms`
    );

    return res.status(200).json({
      success: true,
      msg: "Coding round generated successfully.",
      data: parsed,
      codingID: codeQuestion._id.toString(),
    });
  } catch (error) {
    console.error(
      "CODE GENERATOR ERROR:",
      error.message
    );

    if (
      error.name === "ValidationError"
    ) {
      console.error(
        "MONGOOSE VALIDATION ERROR:",
        Object.keys(error.errors || {})
      );

      return res.status(400).json({
        success: false,
        msg:
          "Generated coding question contains invalid data.",
        details:
          Object.keys(error.errors || {}),
      });
    }

    if (error.code === 11000) {
      console.error(
        "MONGODB DUPLICATE KEY:",
        error.keyValue
      );

      return res.status(409).json({
        success: false,
        msg: "Duplicate data detected.",
      });
    }

    return res.status(500).json({
      success: false,
      msg:
        error.message ||
        "Something went wrong while generating the coding round.",
    });
  }
};

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
      error.message
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