const express = require("express");
const app = express();

const UserRoutes = require("./routes/User");
const profileRoutes = require('./routes/Profile')
const courseRoutes  = require('./routes/Course')
const paymentRoutes = require("./routes/Payments");
const contactUsRoute = require('./routes/Contact')

const dotenv = require("dotenv");
const {connect} = require('./config/database')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const {cloudinaryConnect} = require('./config/cloudinary')
const fileUpload = require('express-fileupload')
dotenv.config();


// cloudinary connect method
cloudinaryConnect()
// connect your database
connect()
const PORT = process.env.PORT;

// middleware
app.use(express.json());
app.use(cookieParser())
app.use(cors({
  origin : 'http://localhost:3000',
  credentials : true
}))
app.use(express.static("public"))
// req.files
app.use(fileUpload({
  useTempFiles : true,
  tempFileDir:'/tmp'
}))


// eg - http://localhost:6000/api/v1/auth/signup
app.use("/api/v1/auth", UserRoutes);
app.use('/api/v1/profile' , profileRoutes)
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use('/api/v1/reach' , contactUsRoute)

// define one simple route
app.get("/firstRoute", (req, res) => {
  return res.json({
    success: true,
    message: "Our server is up and running",
  });
});

app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
});
