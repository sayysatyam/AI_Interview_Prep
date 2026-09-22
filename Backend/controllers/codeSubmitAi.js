const express = require('express')
const mongoose = require('mongoose');
const axios = require('axios')
require("dotenv").config();

const userDetails  = require("../models/auth")
const CodingDetails = require("../models/codeAI")

const OPENROUTER_HEADERS = {
  Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
  "Content-Type": "application/json",
};
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const codeSubmitAI = async(req,res)=>{
    const {code,quesTitle,quesDescription,quesConstraints,quesInput,quesOutput,codeLang} = req.body;
    try {
        const userId = req.userId;
        const user = await userDetails.findById(userId);
        if(!user){
            return res.status(400).json({
                success : false,
                msg : "Unauthorized"
            })
        }

        if (!code) {
      return res.status(400).json({
        success: false,
        msg: "Prompt is empty or undefined",
      });
    }
    if (user.credits < 5) {
      return res.status(400).json({
        success: false,
        msg: "Minimum 5 credits are required",
      });
    }

    const prompt  = `You are an AI Coding Judge and Code Analysis Engine.

You will receive:

1. A coding problem containing:
  Question :  ${quesTitle}
 QuestionDescription :  ${quesDescription}
  QuestionInput :   ${JSON.stringify(quesInput)}
 QuestionOutput:   ${JSON.stringify(quesOutput)}
  QuestionConstraint: ${JSON.stringify(quesConstraints)}
   codeLanguage : ${codeLang}
   Code : ${code}

2. The user's submitted code.
 - code  =  ${code}

Your job is to analyze the submitted code against the problem and evaluate its correctness.

IMPORTANT:

* Do NOT judge the code based only on the provided examples.
* Generate additional test cases based on the problem constraints and edge cases.
* Execute/reason through the submitted code against the test cases.
* Identify logical errors, incorrect assumptions, missing edge cases, runtime issues, and incorrect output handling.
* Do not modify or fix the user's code.
* Do not provide a solution unless explicitly requested.
* Focus on evaluating the submitted code.

TEST CASE REQUIREMENTS:

Generate a meaningful test suite covering:

* Normal cases
* Minimum input
* Maximum or near-maximum input
* Empty/single-element cases where valid
* Duplicate values where applicable
* Boundary values
* Sorted input
* Reverse-sorted input
* Negative values where applicable
* Zero values where applicable
* Large values where applicable
* Special/edge cases specific to the problem

You must generate enough test cases to properly evaluate the solution.

If the solution has errors, identify at least 3 test cases that expose the error, whenever at least 3 distinct failing cases can be constructed from the problem constraints.

For every failing test case, provide:

* Test Case Number
* Input
* Expected Output
* Actual Output produced by the user's code
* Short explanation of why the code fails

If fewer than 3 valid failing test cases exist, provide all valid failing cases instead of inventing invalid cases.

PASS/FAIL CALCULATION:

Calculate:

passedTestCases = number of test cases where actual output matches expected output

totalTestCases = total number of executed test cases

failedTestCases = totalTestCases - passedTestCases

Return the result as:

passedTestCases / totalTestCases

Also provide the percentage:

(passsedTestCases / totalTestCases) * 100

Do not count a test case as passed if the output is logically incorrect.

ERROR ANALYSIS:

If all tests pass:

* Clearly state that no correctness error was detected in the generated test suite.
* Still mention that passing the generated tests does not mathematically guarantee correctness for every possible input.

If some tests fail:
Identify the primary reason for failure, such as:

* Incorrect algorithm
* Wrong condition
* Incorrect loop boundary
* Off-by-one error
* Incorrect initialization
* Incorrect handling of duplicates
* Incorrect handling of negative values
* Incorrect handling of boundary cases
* Incorrect input parsing
* Incorrect output formatting
* Integer overflow
* Runtime error
* Time complexity issue
* Space complexity issue
* Other logical error

Also provide a concise explanation of the bug.

IMPORTANT OUTPUT RULE:

Return ONLY valid JSON.

Do not use Markdown.
Do not use code fences.
Do not include explanatory text outside the JSON.

Use exactly this JSON structure:

{
"status": "Accepted | Wrong Answer | Runtime Error | Time Limit Exceeded",
"summary": "Short overall evaluation",
"score": {
"passed": 0,
"total": 0,
"percentage": 0
},
"testCases": [
{
"testCaseNumber": 1,
"status": "passed",
"input": "...",
"expectedOutput": "...",
"actualOutput": "..."
}
],
"failedTestCases": [
{
"testCaseNumber": 0,
"input": "...",
"expectedOutput": "...",
"actualOutput": "...",
"error": "Explain specifically why the submitted code fails on this input."
}
],
"errorAnalysis": {
"hasError": false,
"errorType": "None",
"description": "..."
},
"complexity": {
"time": "O(...)",
"space": "O(...)"
}
}

JSON RULES:

* Escape all quotation marks correctly.
* Do not put comments inside JSON.
* Do not return trailing commas.
* Every field must contain a valid JSON value.
* "passed" must be an integer.
* "total" must be an integer.
* "percentage" must be a number.
* "hasError" must be boolean.
* failedTestCases must contain at least 3 failing test cases when 3 distinct valid failures can be constructed.
* Never invent an expected output. Derive it from the problem definition.
* Never mark a test as failed merely because the formatting differs if the problem considers the outputs equivalent.
* Never mark a test as passed without determining that the output is correct.
* If the code cannot execute because of a syntax/runtime issue, report that accurately and identify the relevant test cases where possible.

INPUT:

USER CODE:
${code}

LANGUAGE:
${codeLang}

Evaluate the user's code now.
`
let result;
        result = await axios.post(
        OPENROUTER_URL,
        {
          model: "openai/gpt-4o-mini",

          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],

          response_format: {
            type: "json_object",
          },
        },
        {
          headers: OPENROUTER_HEADERS,
          timeout: 20000,
        },
      );

      const text = result.data.choices[0].message.content;
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (error) {
        return { error: "Invalid JSON from AI", raw: text };
      }
      user.credits -= 5;
      await user.save();
     return res.status(200).json({
        success : true,
        data : parsed
     })

    } catch (error) {
        console.error("AI Error:", error.message);
    throw new Error("Analysis failed");
    }
};
module.exports = {codeSubmitAI};