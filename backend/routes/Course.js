const express = require('express')
const router = express.Router()

// Categories Controllers Import
const {createCategory , showAllCategories , categoryPageDetails} = require('../controllers/Category')

// Course Controllers Import
const {
    createCourse,
    getAllCourses,
    getFullCourseDetails,
    editCourse,
    getInstructorCourses,
    getCourseDetails,
    deleteCourse,
  } = require("../controllers/Course")

// Sections Controllers Import
const {
    createSection,
    updateSection,
    deleteSection,
  } = require("../controllers/Section")
  
  // Sub-Sections Controllers Import
  const {
    createSubSection,
    updateSubSection,
    deleteSubSection,
  } = require("../controllers/Subsection")

  // rating and reviews controllers import
  const {createRating , getAllRating} = require('../controllers/RatingAndReview')

// course progress controller import
const {updateCourseProgress} = require('../controllers/CourseProgress')

// Importing Middlewares
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth")

router.post('/createCategory' , auth , isAdmin , createCategory)
router.get('/showAllCategories' , showAllCategories)
router.post('/getCategoryPageDetails' , categoryPageDetails)

router.post("/createCourse", auth, isInstructor, createCourse)
//Add a Section to a Course
router.post("/addSection", auth, isInstructor, createSection)
// Update a Section
router.post("/updateSection", auth, isInstructor, updateSection)
// Delete a Section
router.post("/deleteSection", auth, isInstructor, deleteSection)
// Edit Sub Section
router.post("/updateSubSection", auth, isInstructor, updateSubSection)
// Delete Sub Section
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection)
// Add a Sub Section to a Section
router.post("/addSubSection", auth, isInstructor, createSubSection)
// Get all Registered Courses
router.get("/getAllCourses", getAllCourses)
// get details for courses
router.post("/getCourseDetails", getCourseDetails)
// Get Details for  Specific Courses
router.post("/getFullCourseDetails",auth, getFullCourseDetails)
// Edit Course routes
router.post("/editCourse", auth, isInstructor, editCourse)
// Get all Courses Under a Specific Instructor
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses)
// Delete a Course
router.delete("/deleteCourse", deleteCourse)

router.post("/updateCourseProgress" , auth , isStudent , updateCourseProgress)

router.post("/createRating" , auth ,isStudent , createRating)
router.get('/getReviews' , getAllRating)


module.exports = router