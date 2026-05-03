import express from "express";
import  {clerkMiddleware ,  requireAuth}  from "@clerk/express";
import { cancelAppointment, confirmPayment, createAppointment, getAppointments, getAppointmentsByPatient, getAppontmentsByDoctor, getRegisteredUserCount, getStats, updateAppointment } from "../controller/appontmentController.js";

const appointmentRouter = express.Router();
appointmentRouter.get("/", getAppointments);
appointmentRouter.get("/confirm" , confirmPayment);
appointmentRouter.get("/stats/summary", getStats);

// Protected routes for authenticated users

appointmentRouter.get("/me", requireAuth(), getAppointmentsByPatient);
appointmentRouter.post("/", requireAuth(), createAppointment);

appointmentRouter.get("/doctor/:doctorId", getAppontmentsByDoctor);
appointmentRouter.get("/:id/cancel", cancelAppointment);
// count registered patients (typo corrected)
appointmentRouter.get("/patient/count", getRegisteredUserCount);

appointmentRouter.put("/:id", updateAppointment);

export default appointmentRouter;





