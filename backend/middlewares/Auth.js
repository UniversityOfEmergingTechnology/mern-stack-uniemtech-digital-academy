const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const User = require('../models/User')

dotenv.config()

exports.auth = async(req,res,next) => {
    try{
        const token = req.cookies.token 
                        || req.body.token 
                        || req.header("Authorization").replace("Bearer " , "");
        console.log(token)

        if(!token){
            return res.status(401).json({
                success : false , 
                message : "Token is missing"
            })
        }

        try{
            const decode = jwt.verify(token , process.env.JWT_TOKEN )
            console.log(decode)
            req.user = decode
        }

        catch(error){
            console.log(error)
            return res.status(401).json({
                success : false, 
                message : "Token is invalid"
            })
        }

        next()

    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success : false , 
            message : "Something went wrong while validating the token"
        })
    }
}

exports.isStudent = async(req,res,next) => {
    try{
        const userDetails = await User.findOne({email : req.user.email})
        if(userDetails.accountType !== "Student"){
            return res.status(401).json({
                success : false , 
                message : "This is a protected route for students"
            })
        }

        next()
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success : false , 
            message : "User account cannot be verified"
        })
    }
}

exports.isAdmin = async(req,res,next) => {
    try{
        const userDetails = await User.findOne({email : req.user.email})
        if(userDetails.accountType !== "Admin"){
            return res.status(401).json({
                success : false , 
                message : "This is a protected route for Admin"
            })
        }

        next()
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success : false , 
            message : "User account cannot be verified"
        })
    }
}

exports.isInstructor = async(req,res,next) => {
    try{
        const userDetails = await User.findOne({email : req.user.email})
        if(userDetails.accountType !== "Instructor"){
            return res.status(401).json({
                success : false , 
                message : "This is a protected route for Instructor"
            })
        }

        next()
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success : false , 
            message : "User account cannot be verified"
        })
    }
}
