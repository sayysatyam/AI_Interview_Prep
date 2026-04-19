const mongoose = require("mongoose");

const connectMongoDb = async(url)=>{
   try {
     const conn  =await mongoose.connect(url);
    console.log(`Mongo Connected ${conn.connection.host}`);
   } catch (error) {
    console.log("Error In Connection",error.message);
                process.exit(1);
   }
};
module.exports = {connectMongoDb};