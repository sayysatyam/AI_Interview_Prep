const mongoose = require("mongoose");


// ==========================================
// CODING QUESTION SCHEMA
// ==========================================

const codingQuestionSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        required: true
    },
        redirectUrl : {
            type:String
        },
        platformImage : {
            type:String
        },
    topic: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    constraints: [{
        type: String
    }],

    inputFormat: {
        type: String,
        required: true
    },

    outputFormat: {
        type: String,
        required: true
    },

    examples: [{
        input: {
            type: String,
            required: true
        },

        output: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },

        explanation: {
            type: String
        }
    }],

    allowedLanguages: [{
        type: String,
        enum: ["cpp", "python", "javascript"]
    }],
    
    memoryLimit: {
        type: Number,
        default: 256
    },

    starterCode: {
  cpp: {
    type: String,
    default: ""
  },

  python: {
    type: String,
    default: ""
  },

  javascript: {
    type: String,
    default: ""
  }
},


    // ==========================================
    // TEST CASES
    // ==========================================

    testCases: [{
        input: {
            type: String,
            required: true
        },

        expectedOutput: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },

        isHidden: {
            type: Boolean,
            default: true
        }
    }],


    // ==========================================
    // STUDENT SUBMISSION
    // ==========================================

    userCode: {
        type: String
    },

    language: {
        type: String,
        enum: ["cpp", "python", "javascript"]
    },

    testsPassed: {
        type: Number,
        default: 0
    },

    totalTests: {
        type: Number,
        default: 0
    },

    executionTime: {
        type: Number,
        default: 0
    },

    memoryUsed: {
        type: Number,
        default: 0
    },


    // ==========================================
    // SUBMISSION STATUS
    // ==========================================

    status: {
        type: String,

        enum: [
            "pending",
            "running",
            "accepted",
            "wrong_answer",
            "compilation_error",
            "runtime_error",
            "time_limit"
        ],

        default: "pending"
    },


    // ==========================================
    // AI EVALUATION
    // ==========================================

    evaluation: {

        score: {
            type: Number,
            default: 0
        },

        correctness: {
            type: Number,
            default: 0
        },

        algorithm: {
            type: Number,
            default: 0
        },

        codeQuality: {
            type: Number,
            default: 0
        },

        edgeCases: {
            type: Number,
            default: 0
        },

        timeComplexity: {
            type: String
        },

        spaceComplexity: {
            type: String
        },

        feedback: {
            type: String
        }
    }

});


// ==========================================
// CODING ROUND SCHEMA
// ==========================================

const CodingSchema = new mongoose.Schema({

    createdBy: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "userDetails",

        required: true

    },


    // ==========================================
    // USER'S ORIGINAL PROMPT
    // ==========================================

    prompt: {

        type: String,

        required: true

    },


    // ==========================================
    // ROUND INFORMATION
    // ==========================================


    difficulty: {

        type: String,

        enum: ["easy", "medium", "hard", "mixed"]

    },


    numberOfQuestions: {

        type: Number,

        default: 5

    },


    // ==========================================
    // ROUND STATUS
    // ==========================================

    status: {

        type: String,

        enum: [
            "Not Started",
            "In Progress",
            "Completed"
        ],

        default: "Not Started"

    },



    // ==========================================
    // TIME
    // ==========================================
    startedAt: {

        type: Date

    },

    completedAt: {

        type: Date

    },


    // ==========================================
    // QUESTIONS
    // ==========================================

    codingDetails: [codingQuestionSchema],


    // ==========================================
    // FINAL EVALUATION
    // ==========================================

    average: {

        type: Number,

        default: 0

    },

    finalEvaluation: {

        score: {

            type: Number,

            default: 0

        },

        strengths: {

            type: String

        },

        weaknesses: {

            type: String

        },

        recommendation: {

            type: String

        }

    }

}, { timestamps: true });


const CodingDetails = mongoose.model(
    "CodingDetails",
    CodingSchema
);

module.exports = CodingDetails;