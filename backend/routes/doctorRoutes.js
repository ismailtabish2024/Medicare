import express from "express";
import upload from "../middlewares/multer.js";
import {
  createDoctor,
  doctorLogin,
  getDoctors,
  getDoctorById,
  toggleDoctorAvailability,
  updateDoctor,
  deleteDoctor,
} from "../controller/doctorController.js";
import doctorAuth from "../middlewares/doctorAuth.js";

const doctorRouter = express.Router();

doctorRouter.get("/", getDoctors);
doctorRouter.post("/login",doctorLogin);

doctorRouter.post("/", upload.single("image"), createDoctor);
doctorRouter.get("/:id", getDoctorById);
doctorRouter.delete("/:id", deleteDoctor);

// after login 

doctorRouter.put("/:id", doctorAuth, upload.single("image"), updateDoctor);
doctorRouter.post("/:id/toggle-avilability", doctorAuth, toggleDoctorAvailability);
doctorRouter.post("/:id/toggle-availability", doctorAuth, toggleDoctorAvailability);

export default doctorRouter;


