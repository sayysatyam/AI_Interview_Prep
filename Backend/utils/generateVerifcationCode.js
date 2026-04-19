const generateVerificationCode = ()=>{
    const code =  Math.floor(1000+Math.random()*900000).toString();
    if(code.length>6){
        code = Math.floor(1000+Math.random()*900000).toString();
    }
    return code;
};
module.exports = {generateVerificationCode};

//it generate 4 digit verifaction code