const jwt = require("jsonwebtoken");

const verifyToken = (req,res,next )=>{
        const token =  req.cookies.uid;
        if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });
        try{
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (!decoded) return res.status(401).json({ success: false, message: "Unauthorized" });
                req.userId = decoded.userId
                next();
        }
        catch(error){
                console.log("Error in verifyToken ", error);
		return res.status(401).json({ success: false, message: "Server error" });
        }
}
module.exports = {verifyToken};