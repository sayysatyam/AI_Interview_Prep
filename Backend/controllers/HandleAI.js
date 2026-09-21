const dotenv = require("dotenv");
require("dotenv").config();

const extractTextFromPDF = require("../MiddleWare/extractText");
const userDetails = require("../models/auth");
const InterviewDetails = require("../models/interviewModel");
const axios = require("axios");
const OPENROUTER_HEADERS = {
  Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
  "Content-Type": "application/json",
};

const aiResumeAnalyzer = async (resumeText) => {
  try {
    if (!resumeText || resumeText.trim().length === 0) {
      throw new Error("resumeText is empty or undefined");
    }

    const prompt = `
You are an expert AI Resume Analyzer.

Analyze the following resume carefully and extract structured information.

Resume:
${resumeText}

Return ONLY valid JSON. Do NOT include any extra text, explanation, or markdown.

IMPORTANT:
- "total_years" must be a number only (no text like "years")
- If any field is missing, return null or empty array

JSON format:
{
  "summary": "Brief 2-3 line overview of the candidate",
  "role": "Best suited job role based on resume",
  "experience": {
    "total_years": number,
    "details": "short description"
  },
  "projects": [
    "project 1 with (short description - 5 to 7 words)",
    "project 2 with (short description - 5 to 7 words)"
  ],
  "skills": {
    "technical": ["skill1", "skill2", etc],
    "soft": ["skill1", "skill2" ,"etc"]
  },
  "experience_analysis": "Evaluation of work experience",
  "projects_analysis": "Evaluation of projects",
  "ats_score": number,
  "experience_Gap" : number ,
  "experience_fit" : "string"(Give in max 3 words and give fit in technical term like intern data analyst type and also in Capitalized format First word capital n rest small),
  "improvement_suggestions": (give more than 2 if any i just show you an example ) [
    "suggestion 1",
    "suggestion 2"
  ]
}
`;

    const result = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      },
      { headers: OPENROUTER_HEADERS },
    );

    const text = result.data.choices[0].message.content;

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { error: "Invalid JSON from AI", raw: response };
    }
    return parsed;
  } catch (error) {
    console.error("AI Error:", error.message);
    throw new Error("Resume analysis failed");
  }
};

const handleResumeUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const filePath = req.file.path;

    const cleanText = await extractTextFromPDF(filePath);
    const analysis = await aiResumeAnalyzer(cleanText);

    res.json({
      success: true,
      Resumedata: analysis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const generateQuestion = async (req, res) => {
  try {
    const {
      role,
      skills,
      experience,
      mode,
      resume,
      project,
      difficulty,
      quesNum,
    } = req.body;

    if (!role || !experience || !mode) {
      return res
        .status(400)
        .send({ success: false, msg: "Please fill up Details Properly" });
    }
    const user = await userDetails.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    if (user.credits < 50) {
      return res.status(400).json({
        success: false,
        msg: "Minimum 50 credits are required",
      });
    }

    const projectText =
      Array.isArray(project) && project.length ? project.join(", ") : "None";

    const userResumeText = resume?.trim() || "None";

    const skillsText =
      Array.isArray(skills) && skills.length ? skills.join(", ") : "None";

    const quesPrompt = `
You are an expert technical interviewer AI.

Generate high-quality, realistic interview questions based on the following details:

Role: ${role}
Experience: ${experience}
Interview Mode: ${mode} (HR / Technical / Mixed)
Project Context: ${projectText}
Resume: ${userResumeText}
Skills: ${skillsText}
Difficulty Level: ${difficulty}

---

🎯 Instructions:

1. Generate exactly ${quesNum} interview questions.
2. Questions must be relevant to the role, skills, and experience.
3. Each question must be 20–30 words long.
4. Questions must feel practical, realistic, and interview-like.
5. Use simple, clear, and conversational language.
6. Ensure questions are relevant to role, skills, projects, and experience.

7. Mode handling:
   - HR → behavioral and situational questions
   - Technical → concepts, coding logic, real-world scenarios
   - Mixed → combination of both,
   - Behaviour → situational or case based
   - Case Based → Problem Solving acc to pRoject Cased

8. Difficulty handling:
   - If a single difficulty is given (easy/medium/hard), use it for all questions.
   - If difficulty is "mixed", follow this repeating pattern strictly:
     easy → medium → hard → easy → medium → hard ...

9. Set appropriate timeLimit (in seconds):
   - easy → 60–90
   - medium → 90–120
   - hard → 120–180


   ----

📦 Output Format (STRICT JSON ARRAY):

Return ONLY valid JSON. No explanation. No text outside JSON.

Each object MUST follow this exact structure:

{
  "question": "string",
  "difficulty": "easy | medium | hard",
  "timeLimit": number,
  "category":"String"
}

---

⚠️ Strict Rules:

- Output must be a valid JSON array
- Do NOT include markdown, comments, or extra text
- Do NOT include trailing commas
- Do NOT include extra fields
- Ensure JSON is directly parsable using JSON.parse()
- Ensure all fields are present in every object
`;

    if (!quesPrompt.trim()) {
      return res.status(400).json({
        success: false,
        msg: "Prompt Is Empty",
      });
    }
    const quesResult = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: quesPrompt }],
      },
      { headers: OPENROUTER_HEADERS },
    );
    const text = quesResult.data.choices[0].message.content;

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      return res.status(500).json({
        success: false,
        msg: "Invalid JSON from AI",
        raw: text,
      });
    }
    user.credits -= 50;
    await user.save();

    const userInterviewDetails = new InterviewDetails({
      createdBy: user._id,
      role,
      experience,
      mode,
      resumeText: userResumeText,
      interviewDetails: parsed.map((q, index) => ({
        question: q.question,
        difficulty: q.difficulty,
        timeLimit: q.timeLimit,
        answer: q.answer,
      })),
    });
    await userInterviewDetails.save();

    res.json({
      success: true,
      interviewData: parsed,
      interviewId: userInterviewDetails._id,
    });
  } catch (error) {
    console.error("AI Error:", error.message);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { interviewId, answer, questionIndex, timeTaken } = req.body;
    const reviewInterview = await InterviewDetails.findById(interviewId);

    if (!reviewInterview) {
      return res.status(404).json({
        success: false,
        msg: "Interview not found",
      });
    }

    const questions = reviewInterview.interviewDetails[questionIndex];

    if (!questions) {
      return res.status(400).json({
        success: false,
        msg: "Invalid question index",
      });
    }

    if (!answer) {
      questions.evaluation = {
        score: 0,
        confidence: 0,
        communication: 0,
        correctness: 0,
        status: "skipped",
      };

      questions.feedback = "Question skipped by the candidate.";

      questions.userAnswer = "";

      await reviewInterview.save();

      return res.json({
        success: true,
        evaluation: questions.evaluation,
        feedback: questions.feedback,
      });
    }

    if (timeTaken > questions.timeLimit) {
      questions.evaluation = {
        score: 0,
        confidence: 0,
        communication: 0,
        correctness: 0,
        status: "skipped",
        timeTaken:timeTaken
      };

      questions.feedback = "Time limit exceeded. Answer not evaluated.";

      questions.userAnswer = answer;

      await reviewInterview.save();

      return res.json({
        success: true,
        evaluation: questions.evaluation,
        feedback: questions.feedback,
      });
    }

    const submitAnswerPrompt = `

You are an expert AI interviewer and technical evaluator.

Your task is to evaluate the candidate’s answer based on the given interview question and ideal answer.

━━━━━━━━━━━━━━━━━━━
📌 INPUTS
━━━━━━━━━━━━━━━━━━━

Question:
${questions.question}

Ideal Answer:
${questions.answer}

Candidate Answer:
${answer}


━━━━━━━━━━━━━━━━━━━
🎯 EVALUATION CRITERIA
━━━━━━━━━━━━━━━━━━━

Evaluate based on:

1. correctness
→ Accuracy, relevance, and technical validity

2. communication
→ Clarity, explanation quality, and structure

3. confidence
→ Confidence level inferred from wording and tone

4. overall score
→ Combined overall performance score

━━━━━━━━━━━━━━━━━━━
📊 SCORING RULES
━━━━━━━━━━━━━━━━━━━

- All scores must be integers between 0 and 100
- 0 = no answer / completely incorrect
- 10–30 = weak understanding
- 40–70 = average or partial understanding
- 80–100 = strong or excellent answer

━━━━━━━━━━━━━━━━━━━
🧠 EVALUATION INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━

- Compare the candidate answer with the ideal answer carefully
- Do NOT be overly strict for beginners
- Reward logical thinking and partial correctness
- Penalize irrelevant or incorrect answers
- Keep feedback concise, constructive, and helpful
- Feedback should be maximum 1–2 short lines
- Never hallucinate missing information
- Never generate undefined values

━━━━━━━━━━━━━━━━━━━
📦 OUTPUT FORMAT (STRICT JSON)
━━━━━━━━━━━━━━━━━━━

Return ONLY valid JSON.

Do NOT include:
- markdown
- explanations
- extra text
- code fences
- additional fields

Use this exact JSON structure:

{
  "score": number,
  "confidence": number,
  "communication": number,
  "correctness": number,
  "feedback": "short constructive feedback"
}

━━━━━━━━━━━━━━━━━━━
⚠️ FINAL RULES
━━━━━━━━━━━━━━━━━━━

- Response MUST be valid parsable JSON
- Every field is mandatory
- Never return undefined/null values
- Never return strings for numeric scores
- Ensure all numeric values are integers

`;

    if (!submitAnswerPrompt.trim()) {
      return res.status(400).json({
        success: false,
        msg: "Prompt Is Empty",
      });
    }

    const answerResult = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: submitAnswerPrompt }],
      },
      { headers: OPENROUTER_HEADERS },
    );

    const text = answerResult.data.choices[0].message.content;

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (error) {
      return res.status(500).json({
        success: false,
        msg: "Invalid JSON from AI",
        raw: text,
      });
    }

    questions.userAnswer = answer;
    
    questions.evaluation = {
      score: parsed.score,
      confidence: parsed.confidence,
      communication: parsed.communication,
      correctness: parsed.correctness,
      status: "answered",
      timeTaken : timeTaken
    };
    questions.feedback = parsed.feedback;

  reviewInterview.status = "Completed";
    await reviewInterview.save();

    return res.json({
      success: true,
      evaluation: questions.evaluation,
      feedback: questions.feedback,
    });
  } catch (error) {
    console.error("Calculate Error:", error.message);

    return res.status(500).json({
      success: false,
      msg: "Something went wrong",
    });
  }
};

const calculate = async (req, res) => {
  try {
    const { interviewId } = req.body;

    const interviewData = await InterviewDetails.findById(interviewId);

    if (!interviewData) {
      return res.status(400).json({
        success: false,
        msg: "No Interview Found",
      });
    }


    let totalScore = 0;
    let confidenceScore = 0;
    let communicationScore = 0;
    let totalCorrect = 0;

    const formattedInterviewDetails = {
      role : interviewData.role,
      experience: interviewData.experience,
      mode : interviewData.mode,
        questions: interviewData.interviewDetails.map((q) => ({
    question: q.question,
    difficulty: q.difficulty,

    idealAnswer: q.answer,

    userAnswer: q.userAnswer,

    feedback: q.feedback,

    evaluation: {
      score: q.evaluation.score,
      confidence: q.evaluation.confidence,
      communication: q.evaluation.communication,
      correctness: q.evaluation.correctness,
      timeTaken: q.evaluation.timeTaken,
      status: q.evaluation.status,
    },
  })),
    }
    const FeedbackPrompt = `
You are an advanced AI Interview Evaluator.

Below is the complete interview data of a candidate.

Interview Data:
${JSON.stringify(formattedInterviewDetails)}

Your task is to deeply analyze the candidate's complete interview performance.

Analyze:
- Technical understanding
- Communication skills
- Confidence level
- Answer quality
- Time management
- Problem solving ability
- Clarity of explanation
- Consistency across answers

Identify:
- Strengths
- Weaknesses
- Improvement areas
- Repeated mistakes
- Missing concepts
- Behavioural patterns

Generate professional and realistic interview feedback similar to a real interviewer.

Suggestions should be practical, concise, and actionable like these examples:

1.
Title: "Technical depth"
Description:
"Revisit core concepts and explain trade-offs more clearly during technical discussions."

2.
Title: "Answer structure"
Description:
"Use the STAR method to make behavioural answers more organised and impactful."

3.
Title: "Speaking confidence"
Description:
"Practice speaking slowly and reduce filler words to improve confidence and clarity."

4.
Title: "Impact metrics"
Description:
"Include measurable results and achievements to make answers more convincing."

Return ONLY valid JSON in this exact format:

{
  "overallSummary": "",

  "strengths": [
    ""
  ],

  "weaknesses": [
    ""
  ],

  "suggestions": [
    {
      "title": "",
      "description": ""
    }
  ],

  "technicalAnalysis": "",

  "communicationAnalysis": "",

  "confidenceAnalysis": "",

  "timeManagementAnalysis": "",

  "finalVerdict": "",

  "hireRecommendation": "",

  "focusAreas": [
    ""
  ]
}

Strict Rules:
- Do NOT return markdown
- Do NOT return explanation outside JSON
-Give Atleast Minimum 4 and MAximum 4 suggestions (Min & Max = 4 not smaller than 4 not greater than 4)
- Suggestion title must NOT exceed 4 words
- Suggestion description must NOT exceed 30 words
- Keep suggestions concise and actionable
- Feedback should sound realistic and professional
- Mention repeated weaknesses if found
- Mention confidence patterns
- Mention communication quality
- Mention if answers lacked depth
- Mention if user rushed answers
- Mention consistency across questions
`;

     const answerResult = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: FeedbackPrompt}],
      },
      { headers: OPENROUTER_HEADERS },
    );

    const text = answerResult.data.choices[0].message.content;

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (error) {
      return res.status(500).json({
        success: false,
        msg: "Invalid JSON from AI",
        raw: text,
      });
    }


    const totalQuestion = interviewData.interviewDetails.length;

    interviewData.interviewDetails.forEach((q) => {
      totalScore += q.evaluation?.score || 0;
      confidenceScore += q.evaluation?.confidence || 0;
      communicationScore += q.evaluation?.communication || 0;
      totalCorrect += q.evaluation?.correctness || 0;
    });

    const avgScore = totalQuestion ? Math.floor(totalScore / totalQuestion) : 0;
    interviewData.average = avgScore;

    const avgConfidence = totalQuestion
      ? Math.floor(confidenceScore / totalQuestion)
      : 0;

    const avgCommunication = totalQuestion
      ? Math.floor(communicationScore / totalQuestion)
      : 0;

    const avgCorrectness = totalQuestion
      ? Math.floor(totalCorrect / totalQuestion)
      : 0;

    // ✅ accuracy (out of 100)
    const accuracy =
  totalQuestion > 0
    ? Math.floor((totalScore / (totalQuestion * 100)) * 100)
    : 0;

    let rating;
    if (avgScore >= 80) rating = "Excellent";
    else if (avgScore >= 60) rating = "Good";
    else rating = "Needs Improvement";
    interviewData.interviewDetails.status = "Completed";
    await interviewData.save();

    return res.json({
      success: true,
      average : avgScore,
      result: {
        totalQuestions: totalQuestion,
        averageScore: avgScore,
        confidence: avgConfidence,
        communication: avgCommunication,
        correctness: avgCorrectness,
        accuracy,
        rating,
      },
      feedback:{
        parsed
      }

    });
  } catch (error) {
    console.error("Calculate Error:", error.message);

    return res.status(500).json({
      success: false,
      msg: "Something went wrong",
    });
  }
};

const getHistory = async(req,res)=>{
    try {
      const result = await InterviewDetails.find({createdBy:req.userId})
      .sort({createdAt:-1})
      .select("role experience mode status interviewDetails createdAt");

      return res.status(200).json(result)

    } catch (error) {
      return res.status(500).json({msg : error.data?.message || "Something Went Wrong"});
    }
}
const getParticularHistory = async (req, res) => {
  try {
    const { hisId } = req.params;

    const attempt = await InterviewDetails.findOne({
      _id: hisId,
      createdBy: req.userId,
    });

    if (!attempt) {
      return res.status(404).json({ error: "No attempt found" });
    }

    return res.status(200).json(attempt);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch quiz attempt" });
  }
};
module.exports = {
  aiResumeAnalyzer,
  handleResumeUpload,
  generateQuestion,
  calculate,
  submitAnswer,
  getHistory,
  getParticularHistory
};
