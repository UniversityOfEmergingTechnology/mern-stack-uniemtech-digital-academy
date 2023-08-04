const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../templatesMail/otpTemplate");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5,
  },
});

// define a function to send emails
async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verifiction Email",
      emailTemplate(otp)
    );
    console.log("Email sent successfully", mailResponse.response);
  } catch (error) {
    console.log("Error occured while sending email", error);
    throw error;
  }
}
OTPSchema.pre("save" , async function(next){
    console.log('New document saved to the database')

    // only sedn an email when a new document is about to be created
    if(this.isNew){
        await sendVerificationEmail(this.email , this.otp)
    }
    next()
})

module.exports = mongoose.model("OTP", OTPSchema);
