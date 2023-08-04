const SubSection = require('../models/SubSection')
const CourseProgress = require('../models/CourseProgress')

exports.updateCourseProgress = async(req,res) => {
    try{
        const {courseId , subSectionId} = req.body;
        const userId = req.user.id

        const subsection = await SubSection.findById(subSectionId)
        if(!subsection){
            return res.status(404).json({
                success : false,
                message : "Invalid subsection"
            })
        }
        let courseProgress = await CourseProgress.findOne({
            courseId , 
            userId
        })

        if(!courseProgress){
            return res.status(404).json({
                success  : false,
                message : "Course progress does not exist"
            })
        }else{
            if(courseProgress.completedVideos.includes(subSectionId)){
                return res.status(400).json({
                    success : false,
                    message : "Subsection already completed"
                })
            }
        }
        courseProgress.completedVideos.push(subSectionId)

        await courseProgress.save()

        return res.status(200).json({
            success : true ,
            message : "Course progress updated"
        })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success : true ,
            message : "Internal server error"
        })
    }
}