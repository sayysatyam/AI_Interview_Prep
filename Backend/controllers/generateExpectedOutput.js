const express = require('express');
const axios = require('axios');
require('dotenv').config();
const JUDGE0_URL =
  process.env.RAPIDAPI_JUDGE0_URL ||
  "https://judge0-ce.p.rapidapi.com";
const JUDGE0_HOST =
  process.env.RAPIDAPI_JUDGE0_HOST ||
  "judge0-ce.p.rapidapi.com";
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

const PYTHON_LANG_ID = 71;

const judgeHeader = ()=>({
    "Content-Type" : "application/json",
    "X-RapidAPI-Key":RAPIDAPI_KEY,
  "X-RapidAPI-Host":JUDGE0_HOST,
});

const runReferenceSolution = async(sourceCode,input)=>{
        try {
            const submissionResponse = await axios.post(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`,{
                language_id: PYTHON_LANG_ID,
        source_code: sourceCode,
        stdin: input,
            },{
        headers: judgeHeader(),
      }
        );

            const token = submissionResponse.data.token;
 if (!token) {
      throw new Error("Judge0 did not return submission token");
    }   
    let result;
   while(true){
     const response = await axios.get(`${JUDGE0_URL}/submissions/${token}?base64_encoded=false`,{
        headers: judgeHeader(),
    });

    result = response.data;
     if (result.status && result.status.id > 2) {
        break;
      }
       await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );
            
   }

   if (result.status?.id !== 3) {
      throw new Error(
        `Reference solution failed: ${
          result.status?.description || "Unknown Judge0 error"
        }\n${result.stderr || ""}`
      );
    }
     return result.stdout ?? "";

     
} catch (error) {
            throw new Error(
      `Judge0 reference execution failed: ${
        error.response?.data?.message ||
        error.message
      }`
    );
        }
};

const generateExpectedOutput = async(question)=>{
     if (
    !question.referenceSolution ||
    !question.referenceSolution.python
  ) {
    throw new Error(
      "Python reference solution is missing"
    );
  }

  if (!Array.isArray(question.testCases)) {
    throw new Error(
      "testCases must be an array"
    );
  }

  const referenceSolution = question.referenceSolution.python;

  const updateTestcase = [];

  for(const testCase of question.testCases){
        console.log(
      `Running reference solution for test case ${testCase.testCaseNumber}...`
    );

    const stdout = await runReferenceSolution(
      referenceSolution,
      testCase.input
    );

    updateTestcase.push({
      ...testCase,

      // Judge0's actual stdout becomes ground truth
      expectedOutput: stdout,
    });

  }
  return updateTestcase;
};

module.exports = {
    runReferenceSolution,
    generateExpectedOutput
};