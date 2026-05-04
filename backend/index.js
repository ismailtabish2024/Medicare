import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { clerkMiddleware } from '@clerk/express'
import { connectDB } from "./config/db.js";
import doctorRouter from "./routes/doctorRoutes.js";
import serviceRouter from "./routes/serviceRoutes.js";
import appointmentRouter from "./routes/appointmentRoutes.js";
import serviceAppointmentRouter from "./routes/serviceAppointmentRouter.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const allowedOrigins = [
  // 'http://localhost:5173',
  // 'http://localhost:5174',
    'https://medicare-9qea.vercel.app', // Admin 
  'https://medicare-frontend-zeta-ten.vercel.app/' // frontend
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(clerkMiddleware());
app.use(express.json({limit: '20mb'})); 
app.use(express.urlencoded({limit: '20mb', extended: true}));
// app.use("/uploads", express.static("uploads"));


//db
connectDB();
// Routes

app.use("/api/doctors",doctorRouter);
app.use("/api/services",serviceRouter);
app.use("/api/appointments",appointmentRouter);
app.use("/api/service-appointments",serviceAppointmentRouter);




app.get("/", (req, res) => {
  res.send("Hello World!");
});

// app.listen(port, () => {
//   console.log(`Example app listening on port http://localhost:${port}`);
// });


