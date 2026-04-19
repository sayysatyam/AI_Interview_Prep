const dotenv = require('dotenv')
require("dotenv").config();
const extractTextFromPDF = require('../MiddleWare/extractText')
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const userDetails = require('../models/auth');
const InterviewDetails = require('../models/interviewModel');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_AI_KEY);

const aiResumeAnalyzer = async (resumeText) => {
  try {
    if (!resumeText || resumeText.trim().length === 0) {
  throw new Error("resumeText is empty or undefined");
};
   
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
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"]
  },
  "experience_analysis": "Evaluation of work experience",
  "projects_analysis": "Evaluation of projects",
  "ats_score": number,
  "experience_Gap" : number ,
  "experience_fit" : "string"(Give in max 3 words and give fit in technical term like intern data analyst type),
  "improvement_suggestions": [
    "suggestion 1",
    "suggestion 2"
  ]
}
`;

const result = await axios.post(
        process.env.GEMINI_API_URL,
        {
          contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.GEMINI_AI_KEY,
          },
          timeout: 40000,
        },
      );


    const text =
      result.data.candidates[0].content.parts[0].text;


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
        message: "No file uploaded"
      });
    }

    const filePath = req.file.path;

    const cleanText = await extractTextFromPDF(filePath);
    const analysis = await aiResumeAnalyzer(cleanText);

    res.json({
      success: true,
      Resumedata: analysis
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const generateQuestion = async(req,res)=>{
  try {
    const {role,skills,experience,mode,resume,project,difficulty,quesNum} = req.body;

    if(!role || ! experience || !mode ){
      return res.status(400).send({success : false , msg :"Please fill up Details Properly"});
    }
    const user = await userDetails.findById(req.userId);
          if(!user){
            return res.status(404).json({
              success:false,msg:"User not found"
            });
          };

          if(user.credits < 50){
            return res.status(400).json({
              success:false,
              msg:"Minimum 50 credits are required"
            });
          }

          const projectText = Array.isArray(project) && project.length ? project.join(", ") : "None";

          const userResumeText = resume?.trim()|| "None";

          const skillsText = Array.isArray(skills) && skills.length ? skills.join(", ") : "None";

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
   - Mixed → combination of both

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

          if(!quesPrompt.trim()){
            return res.status(400).json({
              success:false,
              msg:"Prompt Is Empty"
            });
          }
            const quesResult = await axios.post(
        process.env.GEMINI_API_URL,
        {
          contents: [
          {
            parts: [{ text: quesPrompt }]
          }
        ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.GEMINI_AI_KEY,
          },
          timeout: 40000,
        },
      );
    const text =
      quesResult.data.candidates[0].content.parts[0].text;

      let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      return res.status(500).json({
        success: false,
        msg: "Invalid JSON from AI",
        raw: text
      });
    }
    user.credits -= 50;
    await user.save();

    const userInterviewDetails = new InterviewDetails({
        createdBy:user._id,
        role,
        experience,
        mode,
        resumeText:userResumeText,
        interviewDetails: parsed.map((q,index)=>({
           question: q.question,
       difficulty: q.difficulty,
        timeLimit: q.timeLimit,
        answer : q.answer
       }))
})
    await userInterviewDetails.save();

    res.json({
      success: true,
      interviewData: parsed,
      interviewId : userInterviewDetails._id
    });


} catch (error) {
  console.error("AI Error:", error.message);
  return res.status(500).json({ success: false, msg: error.message });
  }
};

const submitAnswer  = async(req,res)=>{
  try {
    const {interviewId,answer,questionIndex,timeTaken} = req.body;

    const reviewInterview = await InterviewDetails.findById(interviewId);

     if (!reviewInterview) {
      return res.status(404).json({
        success: false,
        msg: "Interview not found"
      });
    }

    const questions = reviewInterview.interviewDetails[questionIndex]; 

    if (!questions) {
      return res.status(400).json({
        success: false,
        msg: "Invalid question index"
      });
    }    

    if(!answer){
        questions.evaluation.score=0;
        questions.evaluation.confidence=0;
        questions.evaluation.communication=0;
        questions.evaluation.correctness=0;
        questions.evaluation.status= "skipped";
        questions.feedback = "You didn't submit an answer";
         questions.userAnswer = "";
        await reviewInterview.save();
        return res.json({
          feedback :  questions.feedback
        });
    };

    if(timeTaken > questions.timeLimit){
      questions.evaluation.score=0;
        questions.evaluation.confidence=0;
        questions.evaluation.communication=0;
        questions.evaluation.correctness=0;
         questions.userAnswer = answer;
        questions.evaluation.status= "skipped";
        questions.feedback = "Time limit exceeded. Answer not evaluated";

        await reviewInterview.save();
        return res.json({
          feedback :  questions.feedback
        });
    };

    const submitAnswerPrompt = `
You are an expert AI interviewer.

Evaluate the candidate's answer based on the given question and ideal answer.

---

📌 Inputs:

Question: ${questions.question}
Ideal Answer: ${questions.answer}
Candidate Answer: ${answer}

---

🎯 Evaluation Criteria:

1. correctness → How accurate and relevant the answer is
2. communication → Clarity, structure, and explanation quality
3. confidence → Tone and confidence level (assume from wording)
4. overall score → Combined score based on all factors

---

📊 Scoring Rules:

- Give scores between 0 to 10 (integers only)
- (0) = completely wrong / no answer
- (1-7) = average / partial understanding
- (8-10) = excellent / near perfect

---

🧠 Instructions:

- Compare candidate answer with ideal answer
- Do NOT be too strict for beginners
- Reward logical thinking even if not perfect
- Penalize completely wrong or irrelevant answers
- Keep feedback short (1–2 lines), clear, and helpful

---

📦 Output Format (STRICT JSON):

Return ONLY valid JSON. No explanation. No text outside JSON.

{
  "score": number,
  "confidence": number,
  "communication": number,
  "correctness": number,
  "feedback": "short constructive feedback"
}

---

⚠️ Rules:

- Do NOT include markdown
- Do NOT include extra text
- Do NOT include extra fields
- Ensure JSON is valid and parsable
`;

if(!submitAnswerPrompt.trim()){
            return res.status(400).json({
              success:false,
              msg:"Prompt Is Empty"
            });
          };

          const answerResult = await axios.post(
        process.env.GEMINI_API_URL,
        {
          contents: [
          {
            parts: [{ text: submitAnswerPrompt }]
          }
        ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.GEMINI_AI_KEY,
          },
          timeout: 40000,
        },
      );

      const text = answerResult.data.candidates[0].content.parts[0].text;

      let parsed;

      try {
        parsed = JSON.parse(text);
      } catch (error) {
        return res.status(500).json({
        success: false,
        msg: "Invalid JSON from AI",
        raw: text
      });
      }

      questions.userAnswer = answer;
      questions.evaluation = {
  score: parsed.score,
  confidence: parsed.confidence,
  communication: parsed.communication,
  correctness: parsed.correctness,
  status: "answered"
};
questions.feedback = parsed.feedback;

await reviewInterview.save();

return res.json({
  success: true,
  evaluation: questions.evaluation,
  feedback: questions.feedback
});

  } catch (error) {
      console.error("AI Error:", error.message);
    throw new Error("Analysis failed");
  }
}

const calculate = async(req,res)=>{
  try{
    const {interviewId} = req.body;

    const interviewData = await InterviewDetails.findById(interviewId);

    if(!interviewData) {
      return res.status(400).json({
        success : false,
        msg:"No Interview Found"
      })
    };

   
    let totalScore = 0;
    let confidenceScore = 0;
    let communicationScore = 0;
    let totalCorrect = 0;

    const totalQuestion = interviewData.interviewDetails.length;

   interviewData.interviewDetails.forEach((q) => {
      totalScore += q.evaluation?.score || 0;
      confidenceScore += q.evaluation?.confidence || 0;
      communicationScore += q.evaluation?.communication || 0;
      totalCorrect += q.evaluation?.correctness || 0;
    });

    const avgScore = totalQuestion
      ? Math.floor(totalScore / totalQuestion)
      : 0;

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
    const accuracy = Math.floor((totalScore / (totalQuestion * 10)) * 100);

    let rating;
    if (avgScore >= 8) rating = "Excellent";
    else if (avgScore >= 6) rating = "Good";
    else rating = "Needs Improvement";
    interviewData.interviewDetails.status = "Completed";
    await interviewData.save();


   return res.json({
      success: true,
      result: {
        totalQuestions: totalQuestion,
        averageScore: avgScore,
        confidence: avgConfidence,
        communication: avgCommunication,
        correctness: avgCorrectness,
        accuracy,
        rating
      }
    });

  } catch (error) {
    console.error("Calculate Error:", error.message);

    return res.status(500).json({
      success: false,
      msg: "Something went wrong"
    });
  }
}

module.exports= { aiResumeAnalyzer, handleResumeUpload,generateQuestion,calculate,submitAnswer };