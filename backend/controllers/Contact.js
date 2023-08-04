const {contactUsEmail} = require('../templatesMail/contactFormRes')
const mailSender = require('../utils/mailSender')

exports.contactUsController = async(req,res)=>{
    const {email , name , message} = req.body;

    try{
        const emailRes = await mailSender(email , "Your Data is sent successfully" , contactUsEmail(email , name , message))
        
        return res.json({
            success : true ,
            message : "Email sent successfully"
        })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success : false ,
            message : "Something went wrong"
        })
    }


}