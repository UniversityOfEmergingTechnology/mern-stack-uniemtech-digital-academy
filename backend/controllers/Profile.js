const mongoose = require('mongoose')
const User = require('../models/User')
const Profile = require('../models/Profile')
const Course = require('../models/Course')
const CourseProgress = require('../models/CourseProgress')
const {uploadMediaToCloudinary} = require('../utils/fileUploader')
const {convertSecondsToDuration} = require('../utils/secToDuration')

exports.updateProfile = async(req,res) => {
    try{
        const {
            firstName = "",
            lastName = "",
            dateOfBirth = "",
            about = "",
            contactNumber = "",
            gender = ""
        } = req.body;

        // find the profile by id
        const id = req.user.id
        const userDetails = await User.findById(id)
        const profile = await Profile.findById(userDetails.additionalDetails)

        const user = await User.findByIdAndUpdate(id , {
            firstName , 
            lastName
        })

        await user.save()

        // update the profile details
        profile.dateOfBirth = dateOfBirth
        profile.about = about
        profile.contactNumber = contactNumber
        profile.gender = gender

        // save the updated profile
        await profile.save()

        const updatedUserDetails = await User.findById(id).populate("additionalDetails").exec()

        return res.json({
            success : true ,
            message : "Profile updated successfully",
            updatedUserDetails
        })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success : false, 
            message : error.message
        })
    }
}

exports.deleteAccount = async(req,res) => {
    try{
        const id = req.user.id

        const user = await User.findById({_id : id})

        if(!user){
            return res.status(404).json({
                success  : false,
                message : "User not found"
            })
        }

        // delete associated profile with the User
        await Profile.findByIdAndDelete({
            _id : new mongoose.Types.ObjectId(user.additionalDetails)
        })

        for(const courseId of user.courses){
            await Course.findByIdAndUpdate(
                courseId ,
                {$pull : {studentsEnrolled : id}},
                {new : true}
            )
        }

        await User.findByIdAndDelete({_id : id})
        res.status(200).json({
            success : true , 
            message : "User deleted successfully"
        })

        await CourseProgress.deleteMany({userId  : id})
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success : false, 
            message : error.message
        })
    }
}

exports.getAllUserDetails = async(req,res) => {
    try{
        const id = req.user.id;
        const userDetails = await User.findById(id)
                            .populate("additionalDetails").exec()

        res.status(200).json({
            success : true ,
            message : "User data fetched successfully",
            data : userDetails
        })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success : false, 
            message : error.message
        })
    }
}

exports.updateDisplayPicture = async(req,res) => {
    try {
        const displayPicture = req.files.displayPicture

        const userId = req.user.id;
        const image = await uploadMediaToCloudinary(displayPicture
            ,process.env.FOLDER_NAME 
            ,1000,
            1000)
        console.log(image)

        const updatedProfile = await User.findByIdAndUpdate(
            {_id : userId} ,
            {image : image.secure_url},
            {new : true}
        )
        res.send({
            success : true , 
            message : "Image updated successfully",
            data:updatedProfile
        })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success : false, 
            message : error.message
        })
    }
}

exports.getEnrolledCourses = async(req,res) => {
    try {
        const userId = req.user.id;
        let userDetails = await User.findOne({_id : userId})
        .populate({
            path : "courses",
            populate : {
                path : "courseContent",
                populate : {
                    path : "subSection"
                }
            }
        })
        .exec()

        userDetails = userDetails.toObject()

        var SubSectionLength = 0;

        for(var i = 0 ; i < userDetails.courses.length; i++){
            let totalDurationInSeconds = 0
            SubSectionLength  = 0;
            for(var j = 0 ; j < userDetails.courses[i].courseContent.length ;j++){
                totalDurationInSeconds += userDetails.courses[i].courseContent[j].subSection.reduce((acc , curr) => acc + parseInt(curr.timeDuration),0)

                userDetails.courses[i].totalDuration = convertSecondsToDuration(totalDurationInSeconds)

                SubSectionLength += userDetails.courses[i].courseContent[j].subSection.length
            }
            let courseProgressCount = await CourseProgress.findOne({
                courseId : userDetails.courses[i]._id,
                userId : userId
            })
            courseProgressCount = courseProgressCount?.completedVideos.length
            if(SubSectionLength === 0){
                userDetails.courses[i].progressPercentage = 100
            }else{
                const mutiplier = Math.pow(10,2)
                userDetails.courses[i].progressPercentage = Math.round(
                    (courseProgressCount / SubSectionLength) * 100 * mutiplier) / mutiplier
            }
        }
        if(!userDetails){
            return res.status(400).json({
                success : false ,
                message : `Could not find user with id : ${userDetails}`
            })
        }
        return res.status(200).json({
            success : true ,
            data : userDetails.courses
        })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success : false ,
            message : error.message
        })
    }
}


exports.instructorDashboard = async(req,res) => {
    try{
        const courseDetails = await Course.find({instructor : req.user.id})

        const courseData = courseDetails.map((course) => {
            const totalStudentsEnrolled = course.studentsEnrolled.length
            const totalAmountGenerated = totalStudentsEnrolled * course.price
                    // create a new object with the additional fields
            const courseDataWithStats = {
                _id : course._id ,
                courseName : course.courseName ,
                courseDescription :course.courseDescription ,
                totalAmountGenerated ,
                totalStudentsEnrolled
            }
            return courseDataWithStats
        })

        res.status(200).json({ success : true ,course : courseData })

    }   
    catch(err){
        console.log(error)
        res.status(500).json({
            success : false,
            message:"Server error"
        })
    }
}