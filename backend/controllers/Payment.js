const stripe = require("stripe")(
  "sk_test_51NQqYfSBWpjG3pGKvNokBE0VRduBp0ugDyBgygVaRHZ999EwmvIkVV0H6e98x1TNd1cGoAgMfEaJu77c3eIS7jzU00zoVrJ6UM"
);
const mongoose = require("mongoose");
const Course = require("../models/Course");
const User = require("../models/User");
const CourseProgress = require("../models/CourseProgress");
const mailSender = require("../utils/mailSender");

const {
  courseEnrollmentEmail,
} = require("../templatesMail/courseEnrollmentEmail");
const { paymentSuccessEmail } = require("../templatesMail/paymentSuccessEmail");

// capture the payment and initate the order
exports.capturePayment = async (req, res) => {
  const { courses } = req.body;
  const userId = req.user.id;

  if (courses.length === 0) {
    return res.json({ success: false, message: "Please provide course id" });
  }
  let total_amount = 0;

  for (const course_id of courses) {
    let course;
    try {
      course = await Course.findById(course_id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Could not find the course",
        });
      }

      const uid = new mongoose.Types.ObjectId(userId);
      if (course.studentsEnrolled.includes(uid)) {
        return res.status(400).json({
          success: false,
          message: "Student is already enrolled",
        });
      }
      total_amount += course.price;
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total_amount * 100,
      currency: "inr",
      automatic_payment_methods: {
        enabled: true,
      },
    });
    console.log(paymentIntent);
    res.json({
      clientSecret: paymentIntent.client_secret,
      success: true,
      paymentId: paymentIntent.id,
      amount: paymentIntent.amount,
      orderId: paymentIntent.created,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Could not initate order",
    });
  }
};

exports.verifyPayment = async (req, res) => {
  const orderId = req.body?.orderId;
  const paymentId = req.body?.paymentId;
  const clientSecret = req.body?.clientSecret;
  const courses = req.body?.courses;

  const userId = req.user.id;
  if (!orderId || !paymentId || !clientSecret || !courses || !userId) {
    return res.status(404).json({
      success: false,
      message: "Payment failed",
    });
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
  if (paymentIntent.status === "succeeded") {
    await enrollStudents(courses, userId);
    return res.status(200).json({
      success: true,
      message: "Payment verified",
    });
  } else {
    return res.status(400).json({
      success: false,
      message: "Payment failed",
    });
  }
};

const enrollStudents = async (courses, userId) => {
  if (!courses || !userId) {
    return res.json({
      success: "false",
      message: "provide course id and user id",
    });
  }

  for (const courseId of courses) {
    try {
      const enrolledCourse = await Course.findByIdAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      );

      if (!enrolledCourse) {
        return res.status(400).json({
          success: false,
          message: "Course not found",
        });
      }

      const courseProgress = await CourseProgress.create({
        courseId: courseId,
        userId: userId,
        completedVideos: [],
      });

      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      );

      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Succesfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      );
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
};

exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body;
  const userId = req.user.id;

  if (!orderId || !paymentId || !amount || !userId) {
    return res.status(404).json({
      success: false,
      message: "Please provide all details",
    });
  }
  try {
    const enrolledStudent = await User.findById(userId);
    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}` ,     
        amount / 100,
        orderId,
        paymentId
      ),

    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "could not send email",
    });
  }
};
