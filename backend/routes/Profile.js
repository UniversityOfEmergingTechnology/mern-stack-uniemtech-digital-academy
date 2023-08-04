const express = require('express')
const router = express.Router()

const {deleteAccount , updateProfile , updateDisplayPicture , getAllUserDetails , getEnrolledCourses , instructorDashboard} = require('../controllers/Profile')
const {auth, isInstructor} = require('../middlewares/Auth')


router.delete('/deleteProfile' , auth , deleteAccount)
router.put('/updateProfile' , auth , updateProfile )
router.put('/updateDisplayPicture' , auth , updateDisplayPicture)
router.get('/getUserDetails' , auth , getAllUserDetails)
router.get('/getEnrolledCourses' , auth , getEnrolledCourses)
router.get("/instructorDashboard" , auth , isInstructor ,  instructorDashboard)

module.exports = router