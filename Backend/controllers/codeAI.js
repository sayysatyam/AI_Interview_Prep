const axios = require("axios");
const CodingDetails = require("../models/codeAI");
const userDetails = require("../models/auth");
const { redisClient } = require("../config/redis");
const { generateExpectedOutput } = require("./generateExpectedOutput");

// ======================================================
// OPENROUTER CONFIG
// ======================================================

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

    const existingSession = await CodingDetails.findOne({
      createdBy: userId,
    }).sort({ createdAt: -1 });


        console.log("AI NOT CALLED");
    if (existingSession) {
      const isExpired = new Date() >= new Date(existingSession?.endsAt);
      const isCompleted = existingSession.status === "Completed";

      if (!isExpired && !isCompleted) {
        return res.status(200).json({
          success: false,
          codingID: existingSession._id,
          isExistingSession: true,
        });
      }
    }

    // ==================================================
    // CREDIT CHECK
    // ==================================================

          console.log("AI  CALLED");

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
    // AI PROMPT
    // ==================================================

    const message = `You are an AI Coding Interview Question Generator.

USER REQUEST:
${prompt}

Generate exactly ${quesNo} unique coding questions.

==================================================
REQUIREMENTS
==================================================

1. Generate exactly ${quesNo} questions.

2. Questions may be original/custom or based on known coding problem patterns.

4. Every question must contain:
- title
- difficulty
- topic
- redirectUrl
- platformImage
- description
- constraints
- inputFormat
- outputFormat
- examples
- testCases
- referenceSolution
- allowedLanguages
- starterCode
- timeLimit
- memoryLimit

5. difficulty must be one of:

- easy
- medium
- hard

6. allowedLanguages must contain exactly:

- cpp
- python
- javascript

==================================================
CONSTRAINTS
==================================================

- constraints must be a non-empty array of strings.
- Constraints must match the problem, input format and generated inputs.
- Every generated input must satisfy all constraints.
- If n/counts/dimensions are given, the actual input must match them exactly.

==================================================
EXAMPLES
==================================================

Generate at least 2 examples.

Each example must contain:

- input
- output
- explanation

Example inputs must:

- use raw stdin format
- follow inputFormat
- satisfy all constraints

Example outputs must represent the correct output for the example input.

==================================================
TEST CASES
==================================================

Generate multiple test cases covering different valid scenarios when reasonable.

Each test case MUST contain ONLY:

- testCaseNumber
- input
- isHidden

Do NOT generate expectedOutput.

Inputs MUST be valid raw Judge0 stdin.

Use spaces/newlines for values.

Do NOT use:

- JSON arrays
- JSON objects
- variable assignments
- labels such as "n = 5"
- descriptive text inside input

Example:

"5
1 2 3 4 5"

- Every test case must contain all required input values.
- Never generate empty or incomplete input unless the problem explicitly requires no input.
- Test-case input must exactly follow the inputFormat.
- For problems requiring n/counts/dimensions, provide the required values and exactly the required number of elements.

==================================================
REFERENCE SOLUTION
==================================================

For every question, generate one correct executable reference solution in Python.

The reference solution MUST:

- read input from stdin
- solve the problem correctly
- print the answer to stdout
- follow the specified outputFormat
- handle all valid inputs
- contain complete solution logic
- not use external libraries or files
- please give a best reference solution so it can support linkedlist type input and can be executed in Judge0 platform...

This reference solution will later be executed using Judge0 against every generated test-case input.

The output produced by Judge0 will be used as the trusted expected output.

For Linked List problems:
- Provide proper ListNode structure and construct the list from input.

For Tree problems:
- Provide proper TreeNode structure and construct the tree from input.

For Graph problems:
- Parse the graph and create the required adjacency structure.


NEVER generate an expectedOutput field for test cases.

==================================================
STARTER CODE
==================================================

Generate starter code ONLY for the user to write their own solution.

CRITICAL:
starterCode and referenceSolution are COMPLETELY SEPARATE.

NEVER copy, reuse, summarize, translate, or derive solution logic from
referenceSolution into starterCode.

STARTER CODE MUST ONLY:

- Read the required input from stdin.
- Store the input in variables/data structures when necessary.
- Create the required entry point.
- Stop immediately after input parsing.
- Contain TODO markers showing where the user should write the solution.
- Compile and run successfully on Judge0.

STARTER CODE MUST NOT:

- Solve the problem.
- Calculate the answer.
- Implement any algorithm.
- Contain solution logic.
- Contain hardcoded answers.
- Contain example/test-case values.
- Print the final answer.
- Implement helper functions that solve any part of the problem.
- Copy anything from referenceSolution.

The starter code should look like a blank coding-platform template,
NOT like a completed solution.

==================================================
NORMAL ARRAY / STRING / NUMBER PROBLEMS
==================================================

Only read the input.

C++ example style:

#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    // Read input according to inputFormat

    // TODO: Write your solution here

    return 0;
}

Python example style:

def main():
    # Read input according to inputFormat

    # TODO: Write your solution here
    pass


if __name__ == "__main__":
    main()

JavaScript example style:

const fs = require("fs");

const input = fs.readFileSync(0, "utf-8").trim();

// TODO: Parse input and write your solution here


==================================================
IMPORTANT
==================================================

For simple problems, DO NOT create unnecessary functions,
classes, algorithms, or complex structures.

Only parse/store the input and leave a TODO.

For example, if input is:

5
1 2 3 4 5

The starter code should ONLY read/store:

C++:

int n;
cin >> n;

vector<int> arr(n);
for (int i = 0; i < n; i++) {
    cin >> arr[i];
}

// TODO: Write your solution here

It MUST NOT calculate sum, maximum, minimum, sorting,
searching, or any other answer.

==================================================
LINKED LIST
==================================================

For Linked List problems:

- Only read the input.
- Create ListNode structure ONLY if required by the user's coding environment.
- Construct the linked list from input ONLY.
- Do NOT traverse the list.
- Do NOT reverse the list.
- Do NOT merge the list.
- Do NOT delete nodes.
- Do NOT search the list.
- Do NOT calculate anything.
- Do NOT solve the linked-list problem.

Example:

struct ListNode {
    int val;
    ListNode* next;

    ListNode(int x) : val(x), next(nullptr) {}
};

int main() {
    // Read input
    // Construct list only

    // TODO: Write your solution here

    return 0;
}

==================================================
TREE
==================================================

For Tree problems:

- Only read the input.
- Create TreeNode structure if required.
- Construct the tree from input only.
- Do NOT traverse the tree.
- Do NOT search.
- Do NOT calculate.
- Do NOT modify the tree.
- Do NOT solve the tree problem.

==================================================
GRAPH
==================================================

For Graph problems:

- Only read the input.
- Create the required graph/adjacency structure if necessary.
- Do NOT perform DFS.
- Do NOT perform BFS.
- Do NOT find shortest paths.
- Do NOT calculate MST.
- Do NOT solve the graph problem.

==================================================
FINAL STARTER CODE RULE
==================================================

The starter code must contain ONLY:

1. Imports/includes.
2. Required input reading.
3. Required basic data structures.
4. Required entry point.
5. TODO comment.

Nothing else.

The referenceSolution may contain complete solution logic,
but starterCode MUST NEVER contain that logic.

Return executable starter code for:
- cpp
- python
- javascript

==================================================
TIME AND MEMORY
==================================================

timeLimit must be a positive number representing seconds.

memoryLimit must be a positive number representing MB.

==================================================
PLATFORM FIELDS
==================================================

For original/custom or unverified platform questions:

"redirectUrl": string(url) 
"platformImage": string(url)
- (give null if no url is found but try to gives url)

Never fabricate platform information.

==================================================
JSON RULES
==================================================

Return ONLY valid JSON.

Do NOT return:

- Markdown
- code fences
- comments
- explanations outside JSON
- extra fields

==================================================
JSON STRUCTURE
==================================================

{
  "questions": [
    {
      "title": "Example title",
      "difficulty": "medium",
      "topic": "Arrays",
      "redirectUrl": String,
      "platformImage": String,
      "description": "Complete problem description",
      "constraints": [
        "1 <= n <= 100000"
      ],
      "inputFormat": "Description of input",
      "outputFormat": "Description of output",
      "examples": [
        {
          "input": "5\\n1 2 3 4 5",
          "output": "15",
          "explanation": "Explanation"
        },
        {
          "input": "3\\n10 20 30",
          "output": "60",
          "explanation": "Explanation"
        }
      ],
      "testCases": [
        {
          "testCaseNumber": 1,
          "input": "5\\n1 2 3 4 5",
          "isHidden": false
        },
        {
          "testCaseNumber": 2,
          "input": "3\\n10 20 30",
          "isHidden": true
        }
      ],
      "referenceSolution": {
        "python": "Complete executable Python solution"
      },
      "allowedLanguages": [
        "cpp",
        "python",
        "javascript"
      ],
      "starterCode": {
        "cpp": "Executable C++ stdin/stdout template",
        "python": "Executable Python stdin/stdout template",
        "javascript": "Executable JavaScript stdin/stdout template"
      },
      "timeLimit": 2,
      "memoryLimit": 256
    }
  ],
  "difficulty": "medium",
}

==================================================
FINAL CHECK
==================================================

Before returning the JSON, verify:

- Exactly ${quesNo} questions.
- No duplicate questions.
- All required fields exist.
- constraints is a non-empty array.
- At least 2 examples exist.
- Example inputs follow the input format.
- Test cases contain valid raw stdin.
- Test cases contain NO expectedOutput.
- Every test-case input satisfies the constraints.
- referenceSolution exists and is executable.
- referenceSolution correctly solves the problem.
- Starter code exists for all 3 languages.
- timeLimit and memoryLimit are positive.
- No extra fields are present.

Return ONLY the JSON object.`;

    // ==================================================
    // GENERATE ONE QUESTION
    // ==================================================

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
      "redirectUrl": String(url),
      "platformImage":String(url),
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
          "input": "...",
          "isHidden": false
        },
        {
          "testCaseNumber": 2,
          "input": "...",
          "isHidden": true
        }
      ],
      "referenceSolution": {
        "python": "Complete executable Python solution"
      },
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
- referenceSolution.python is required.
- No solution code outside referenceSolution.
- No extra fields.
- testCases MUST be present.
- The number of test cases is flexible.
- Try to generate more than 5 test cases when reasonable.
- Every test case must contain all required input values.
- Never generate empty or incomplete input unless the problem explicitly requires no input.
- Test-case input must exactly follow the inputFormat.
- For problems requiring n/counts/dimensions, provide the required values and exactly the required number of elements.
- Every test case must contain testCaseNumber, input and isHidden.
- isHidden MUST be boolean.
-don't give full solution as starter code
--Please don't give solution as started code please

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

        if (typeof testCase.isHidden !== "boolean") {
          throw new Error(
            `Question ${questionNumber}, Test Case ${testCaseNumber}: isHidden must be boolean`,
          );
        }

        // AI must NOT generate expectedOutput
        if (Object.prototype.hasOwnProperty.call(testCase, "expectedOutput")) {
          throw new Error(
            `Question ${questionNumber}, Test Case ${testCaseNumber}: expectedOutput must not be generated by AI`,
          );
        }
      }

      // ==================================================
      // REFERENCE SOLUTION VALIDATION
      // ==================================================

      if (
        !question.referenceSolution ||
        typeof question.referenceSolution !== "object" ||
        typeof question.referenceSolution.python !== "string" ||
        question.referenceSolution.python.trim() === ""
      ) {
        throw new Error(
          `Question ${questionNumber}: referenceSolution.python is missing`,
        );
      }

      // ==================================================
      // LANGUAGES
      // ==================================================

      if (
        !Array.isArray(question.allowedLanguages) ||
        question.allowedLanguages.length !== 3
      ) {
        throw new Error(`Question ${questionNumber}: allowedLanguages invalid`);
      }

      // ==================================================
      // STARTER CODE
      // ==================================================

      if (!question.starterCode || typeof question.starterCode !== "object") {
        throw new Error(`Question ${questionNumber}: starterCode missing`);
      }

      if (
        typeof question.starterCode.cpp !== "string" ||
        question.starterCode.cpp.trim() === ""
      ) {
        throw new Error(
          `Question ${questionNumber}: C++ starterCode is missing`,
        );
      }

      if (
        typeof question.starterCode.python !== "string" ||
        question.starterCode.python.trim() === ""
      ) {
        throw new Error(
          `Question ${questionNumber}: Python starterCode is missing`,
        );
      }

      if (
        typeof question.starterCode.javascript !== "string" ||
        question.starterCode.javascript.trim() === ""
      ) {
        throw new Error(
          `Question ${questionNumber}: JavaScript starterCode is missing`,
        );
      }

      // ==================================================
      // PLATFORM FIELDS
      // ==================================================

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

Generate meaningful constraints based on the actual problem.

testCases MUST be present.

The number of test cases is flexible.

Try to generate more than 5 test cases when reasonable.

Every test case MUST contain:

- testCaseNumber
- input
- isHidden

expectedOutput MUST NOT be generated.

referenceSolution.python MUST be present and executable.Provide Best structure and input code for LinkedList Tree Graph .

Empty input is allowed when valid for the problem.`,
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
        `Question ${questionNumber} failed after ${maxRetries + 1} attempts: ${
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
          instruction: `
          TOPIC: Arrays / Strings.

      Generate an Arrays or Strings coding problem.
      Do NOT generate Linked List, Tree, or Graph problems.

      Prefer an original/custom coding problem for this question.  
- redirectUrl = the actual LeetCode problem URL
- platformImage = a valid LeetCode image/logo URL if available

DO NOT return null for redirectUrl.

DO NOT invent a URL. `,
        },
        {
          number: 2,
          instruction: `"
          Preffered TOPIC: Hashing / Two Pointers / Sliding Window.
          Prefer a platform-associated coding problem only if the platform association and URL can be confidently provided. Otherwise generate an original/custom problem and use null for redirectUrl and platformImage. redirectUrl = the actual LeetCode problem URL
- platformImage = a valid LeetCode image/logo URL if available

DO NOT return null for redirectUrl."`,
        },
        {
          number: 3,
          instruction:
            "    Preffered TOPIC: Linked List. Prefer a platform-associated coding problem only if the platform association and URL can be confidently provided. Don't give String topic question",
        },
        {
          number: 4,
          instruction:
            " PREFERRABLE  TOPIC: Trees / Binary Trees / BST. Prefer a platform-associated coding problem only if the platform association and URL can be confidently provided. ",
        },
        {
          number: 5,
          instruction: `"Prefer an original/custom coding problem for this question.
            - redirectUrl = the actual LeetCode problem URL
- platformImage = a valid LeetCode image/logo URL if available

DO NOT return null for redirectUrl."`,
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
    // const overallTitle =
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

      // ----------------------------------------------
      // TITLE
      // ----------------------------------------------

      if (typeof question.title !== "string" || question.title.trim() === "") {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: title is missing.`,
        });
      }

      // const normalizedTitle =
      //   question.title.trim().toLowerCase();

      // if (questionTitles.has(normalizedTitle)) {
      //   return res.status(500).json({
      //     success: false,
      //     msg: `Question ${questionNumber}: duplicate question detected.`,
      //   });
      // }

      // questionTitles.add(normalizedTitle);

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
      // TEST CASES
      // ----------------------------------------------

      if (!Array.isArray(question.testCases)) {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: testCases must be an array.`,
        });
      }

      for (const [testCaseIndex, testCase] of question.testCases.entries()) {
        const testCaseNumber = testCaseIndex + 1;

        if (
          typeof testCase.testCaseNumber !== "number" ||
          !Number.isInteger(testCase.testCaseNumber)
        ) {
          return res.status(500).json({
            success: false,
            msg: `Question ${questionNumber}, Test Case ${testCaseNumber}: testCaseNumber is invalid.`,
          });
        }

        if (typeof testCase.input !== "string") {
          return res.status(500).json({
            success: false,
            msg: `Question ${questionNumber}, Test Case ${testCaseNumber}: input must be a string.`,
          });
        }

        if (typeof testCase.isHidden !== "boolean") {
          return res.status(500).json({
            success: false,
            msg: `Question ${questionNumber}, Test Case ${testCaseNumber}: isHidden must be boolean.`,
          });
        }

        // AI must never generate expectedOutput
        if (Object.prototype.hasOwnProperty.call(testCase, "expectedOutput")) {
          return res.status(500).json({
            success: false,
            msg: `Question ${questionNumber}, Test Case ${testCaseNumber}: expectedOutput must not be generated by AI.`,
          });
        }
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

        if (typeof example.input !== "string" || example.input.trim() === "") {
          return res.status(500).json({
            success: false,
            msg: `Question ${questionNumber}, Example ${exampleNumber}: input missing.`,
          });
        }

        if (example.output === undefined || example.output === null) {
          return res.status(500).json({
            success: false,
            msg: `Question ${questionNumber}, Example ${exampleNumber}: output missing.`,
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
      // REFERENCE SOLUTION
      // ----------------------------------------------

      if (
        !question.referenceSolution ||
        typeof question.referenceSolution !== "object" ||
        typeof question.referenceSolution.python !== "string" ||
        question.referenceSolution.python.trim() === ""
      ) {
        return res.status(500).json({
          success: false,
          msg: `Question ${questionNumber}: referenceSolution.python is missing.`,
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
    }

    // ==================================================
    // GENERATE TRUSTED EXPECTED OUTPUT
    // ==================================================

    for (const question of parsed.questions) {
      console.log("REFERENCE SOLUTION:", question.referenceSolution.python);

      question.testCases = await generateExpectedOutput(question);
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

      testCases: question.testCases,

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

    const startedAt = new Date();
    const duration = 90 * 60; // 90 minutes

    const endsAt = new Date(startedAt.getTime() + duration * 1000);

    const codeQuestion = new CodingDetails({
      createdBy: userId,
      prompt: prompt,
      difficulty: parsed.difficulty,
      numberOfQuestions: quesNo,
      startedAt,
      duration,
      endsAt,
      codingDetails: quesDetails,
    });

    // ==================================================
    // SAVE CODING ROUND
    // ==================================================

    try {
      await codeQuestion.save();
      await redisClient.del(`coding-history:${userId}:page:1:limit:20`);
    } catch (mongoError) {
      console.error("MONGODB SAVE ERROR:", mongoError.message);

      throw mongoError;
    }

    // ==================================================
    // REDIS CACHE
    // ==================================================

    try {
      console.log("⚡ Caching test cases in Redis...");

      for (let idx = 0; idx < codeQuestion.codingDetails.length; idx++) {
        const question = codeQuestion.codingDetails[idx];

        const cacheKey = `coding:testCases:${codeQuestion._id}:${idx}`;

        await redisClient.set(cacheKey, JSON.stringify(question.testCases), {
          EX: 60 * 60,
        });

        console.log(`⚡ Test cases cached: ${cacheKey}`);
      }
    } catch (redisError) {
      console.error("❌ REDIS CACHE ERROR:", redisError.message);
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

    if (codingQuestionDetails?.status === "Completed") {
      return res.status(400).json({
        success: false,
        message: "Already Executed",
      });
    }

    if (Date.now() > new Date(codingQuestionDetails?.endsAt).getTime()) {
      return res.status(400).json({
        success: false,
        message: "Time is over",
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
