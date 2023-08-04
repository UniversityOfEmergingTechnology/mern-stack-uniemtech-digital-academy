const User = require("../models/User");
const crypto = require("crypto");
const mailSender = require('../utils/mailSender')
const bcrypt = require('bcrypt')

exports.resetPasswordToken = async (req, res) => {
  try {
    // getting the user's email from request body
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: `This email ${email} is not registered with us`,
      });
    }
    // generate a random token using crypto library
    const token = crypto.randomBytes(20).toString("hex");
    // update the user's record with the the token and set it to expire in 1hour

    const updatedDetails = await User.findOneAndUpdate(
      { email },
      { token: token, resetPasswordExpires: Date.now() + 3600000 },
      { new: true }
    );

    // generate a url for the user to follow to reset their password
    const url = `http://localhost:3000/update-password/${token}`

    await mailSender(email , "Password Reset" , `Your Link for email verification is ${url}`)
    
    // send a response back to the client
    res.json({
        success : true , 
        message : "Email sent succesfully Please check your email to continue further"
    })
  } catch (error) {
    console.log(error);
    return res.json({
        error : error.message,
        message : "Some error in sending the reset message"
    })
  }
};

exports.resetPassword = async(req,res) => {
    try{
        const {password , confirmPassword, token} = req.body;

        // check if passwords match
        if(password !== confirmPassword){
            return res.json({
                success : false,
                message : "Password and confirm password do not match"
            })
        }

        // check if the token is valid
        const userDetails = await User.findOne({token})

        if(!userDetails){
            return res.json({
                success : false, 
                message : "Token is invalid"
            })
        }

        // check if the token has expired
        if(!(userDetails.resetPasswordExpires > Date.now())){
            return res.json({
                success : false,
                message : "Token is expired . Please regenerate your token"
            })
        }

        // encrypt the new password 
        const encryptedPassword = await bcrypt.hash(password , 10);
        // update the user password in the database
        await User.findOneAndUpdate(
            {token},
            {password : encryptedPassword},
            {new : true}
        )

        res.json({
            success : true , 
            message : "Password reset succesfully"
        })
    }
    catch(error){
        console.log(error)
        return res.json({
            success : "false" , 
            message : "Some error in updating the password" 
        })
    }
}
