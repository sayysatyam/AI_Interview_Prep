const mongoose = require('mongoose')

const codingAnalysisSchema = new mongoose.Schema({

  codingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CodingDetails",
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  overallScore: Number,

  questionsAttempted: Number,

  questionsSolved: Number,

  totalQuestions: Number,

  strengths: [String],

  weaknesses: [String],

  topicAnalysis: [{
    topic: String,
    performance: String,
    score: Number,
    observations: [String]
  }],

  questionAnalysis: [{
    questionNo: Number,
    status: String,

    codeQuality: String,

    correctness: String,

    timeComplexity: String,

    spaceComplexity: String,

    approach: String,

    mistakes: [String],

    improvements: [String],

    aiFeedback: String,

    testsPassed: {
    type: Number,
    default: 0,
  },

  totalTests: {
    type: Number,
    default: 0,
  },
    executionTime: {
    type: Number,
    default: 0,
  },

  memoryUsed: {
    type: Number,
    default: 0,
  },

  }],

  codingPatterns: [String],

  recommendations: [String],

  finalAssessment: String,

  generatedAt: {
    type: Date,
    default: Date.now
  }
});
const codeAnalysis = mongoose.model("codeAnalysis" , codingAnalysisSchema);

module.exports = codeAnalysis;