const express = require('express');
require("dotenv").config();
const axios = require('axios');
const userDetails = require("../models/auth")
const CodingDetails = require("../models/codeAI");
const codeAnalysis = require("../models/codeAnalysis")
const OPENROUTER_HEADERS = {
  Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
  "Content-Type": "application/json",
};

const OPENROUTER_URL =
  "https://openrouter.ai/api/v1/chat/completions";

  const codeANALYSISAI = async(req,res)=>{
        
            try {
                const userId = req.userId;
                const {codeAttemptedData} = req.body;
                const {id} = req.params;

                const user = await userDetails.findById(userId);
                const codeSessionExist = await CodingDetails.findById(id);
                const existingAnalysis = await codeAnalysis.findOne({codingId : id,
                      userId
                });

                 if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    };
    if(!codeSessionExist){
        return res.status(404).json({
            success : false,
            msg : "No Session Found"
        })
    };
    // console.log(codeSessionExist);

    const codeQuestion = codeSessionExist?.codingDetails.map((val, idx) => ({
  questionNo: idx + 1,

  // Question details
  title: val.title,
  difficulty: val.difficulty,
  topic: val.topic,
  description: val.description,
  constraints: val.constraints,
  examples: val.examples,

  userCode: val.userCode || "",
  status: val.status || "not_attempted",


}));
     if (existingAnalysis) {
  return res.status(200).json({
    success: true,
    alreadyExists: true,
    result: existingAnalysis,
    questionDetail : codeQuestion
  });
}
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({
        success: false,
        msg: "OPENROUTER_API_KEY is not configured",
      });
    };

    console.log("AI  CALLED");

   const message = `
You are an expert DSA interviewer and coding assessment evaluator.

Analyze the candidate's complete coding round data.

Use ONLY the information provided in the coding round data. Do not invent test results, mistakes, or candidate behavior.

For every question:

1. Determine the status:
   - solved
   - partially_solved
   - failed
   - not_attempted

2. Analyze:
   - code quality
   - correctness
   - approach
   - time complexity
   - space complexity
   - mistakes
   - improvements
   - detailed AI feedback

3. Identify the candidate's strong and weak DSA topics.

4. Analyze performance for each topic.

5. Identify common coding/problem-solving patterns.

6. Give personalized recommendations.

COUNTING RULES:

- questionsAttempted = solved + partiallySolved + failed
- questionsSolved = number of questions with status "solved"
- totalQuestions = total number of questions provided
- "not_attempted" must NOT be counted as attempted.
- The numbers MUST exactly match questionAnalysis.

For submission results:

- accepted/all test cases passed → solved
- some test cases passed and some failed → partially_solved
- wrong answer, time limit exceeded, runtime error, compilation error → failed
- empty userCode and no execution/submission → not_attempted

For each topic, provide a score from 0 to 100.

overallScore must be from 0 to 100.

Return ONLY valid JSON.

Return JSON in EXACTLY this structure:

{
  "overallScore": 0,

  "questionsAttempted": 0,

  "questionsSolved": 0,

  "totalQuestions": 0,

  "strengths": [],

  "weaknesses": [],

  "topicAnalysis": [
    {
      "topic": "",
      "performance": "",
      "score": 0,
      "observations": []
    }
  ],

  "questionAnalysis": [
    {
      "questionNo": 1,
      "status": "solved",
      "codeQuality": "",
      "correctness": "",
      "timeComplexity": "",
      "spaceComplexity": "",
      "approach": "",
      "mistakes": [],
      "improvements": [],
      "aiFeedback": "",
      testsPassed  : (Number),
      totalTests : (Number),
       executionTime: {
    type: Number,
    default: 0,
  },

  memoryUsed: {
    type: Number,
    default: 0,
  },
    }
  ],

  "codingPatterns": [],

  "recommendations": [],

  "finalAssessment": ""
}

CODING ROUND DATA:

${JSON.stringify(codeAttemptedData)}
`;


const response = await axios.post(
        OPENROUTER_URL,
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
        },
      );

      const text =
        response?.data?.choices?.[0]?.message?.content;

      if (!text) {
        throw new Error(
          `AI returned empty response for question`,
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
  typeof parsed.overallScore !== "number" ||
  !Array.isArray(parsed.questionAnalysis)
) {
  throw new Error("AI returned invalid analysis format");
}
                        const analysis = new codeAnalysis({
  codingId: id,
  userId: userId,

  overallScore: parsed.overallScore,
  questionsAttempted: parsed.questionsAttempted,
  questionsSolved: parsed.questionsSolved,
  totalQuestions: parsed.totalQuestions,

  strengths: parsed.strengths,
  weaknesses: parsed.weaknesses,

  topicAnalysis: parsed.topicAnalysis,
  questionAnalysis: parsed.questionAnalysis,

  codingPatterns: parsed.codingPatterns,
  recommendations: parsed.recommendations,

  finalAssessment: parsed.finalAssessment
});

await analysis.save();
        codeSessionExist.status = "Completed";
        await codeSessionExist.save();



                        return res.status(200).json({
                            success : true,
                            result : parsed,
                                questionDetail : codeQuestion
                        });

            } catch (error) {
                return res.status(500).json({
                    success : false,
                    error:error?.message || "Something Went wrong"
                })
            }
  }

  const codeHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // Check user
    const user = await userDetails.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    // Get coding session
    const codeSessionExist = await CodingDetails.findOne({
      _id: id,
      createdBy: userId,
    });

    if (!codeSessionExist) {
      return res.status(404).json({
        success: false,
        msg: "No Session Found",
      });
    }

    // Get analysis
    const existingAnalysis = await codeAnalysis.findOne({
      codingId: id,
      userId: userId,
    });

    // Question details
    const codeQuestion = codeSessionExist.codingDetails.map(
      (val, idx) => ({
        questionNo: idx + 1,

        questionId: val._id,

        title: val.title,
        difficulty: val.difficulty,
        topic: val.topic,
        description: val.description,
        constraints: val.constraints,
        inputFormat: val.inputFormat,
        outputFormat: val.outputFormat,
        examples: val.examples,
        userCode: val.userCode || "",

        status: val.status || "not_attempted",

        testsPassed: val.testsPassed || 0,
        totalTests: val.totalTests || 0,

        executionTime: val.executionTime || 0,
        memoryUsed: val.memoryUsed || 0,
        memoryLimit: val.memoryLimit || 0,

        redirectUrl: val.redirectUrl || "",
        platformImage: val.platformImage || "",
      })
    );

    // No analysis yet
    if (!existingAnalysis) {
      return res.status(200).json({
        success: true,
        alreadyExists: false,

        result: {
          analysis: null,
        },
        msg : "Something Went Wrong"
      });
    }

    // Analysis exists
    return res.status(200).json({
      success: true,
      alreadyExists: true,

      result : existingAnalysis,
                                questionDetail : codeQuestion
    });

  } catch (error) {
    console.error("Code History Error:", error);

    return res.status(500).json({
      success: false,
      msg: "Something went wrong",
      error: error.message,
    });
  }
};

module.exports = {codeANALYSISAI,codeHistory};