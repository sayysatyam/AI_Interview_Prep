const mongoose = require('mongoose');


const questionsSchema = new mongoose.Schema({
  question: { type: String, required: true },

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true
  },

  timeLimit: { type: Number, default: 60 },

  answer: String,
  feedback: String,
  userAnswer : String,


  evaluation: {
    score: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    correctness: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ["pending", "answered", "skipped"],
        default: "pending"
      }
  }
});

const InterviewSchema = new mongoose.Schema({
    createdBy : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"userDetails",
        required:true
    },
    role:{
        type:String,
        required:true
    },
    experience : {
        type:String,
        required:true
    },
    mode:{
        type:String,
        enum:["Technical","HR","Case-Based","Behaviour"],
        required:true
    },
    resumeText : {
        type:String,
    },
    status:{
        type:String,
        enum:['Completed','Incomplete'],
        default:'Incomplete'
    },
    interviewDetails:[questionsSchema]

},{timestamps:true});

const InterviewDetails = mongoose.model("InterviewDetails",InterviewSchema);
module.exports = InterviewDetails;