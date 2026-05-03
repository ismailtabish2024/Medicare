import express from 'express';
import {  getServiceAppointments   } from '../controller/serviceAppointmentController.js';
import { cancelServiceAppointment, confirmServicePayment, createServiceAppointment, getServiceAppointmentById, getServiceAppointmentsByPatent, getServiceAppointmentStats, updateServiceAppointment } from '../controller/serviceAppointmentController.js';
import { clerkMiddleware, requireAuth } from '@clerk/express';

const serviceAppointmentRouter = express.Router();

serviceAppointmentRouter.get("/", getServiceAppointments);
serviceAppointmentRouter.get("/confirm", confirmServicePayment );
serviceAppointmentRouter.get("/stats/summary",getServiceAppointmentStats);
serviceAppointmentRouter.post("/", clerkMiddleware(),requireAuth(),createServiceAppointment );
serviceAppointmentRouter.get("/me", clerkMiddleware(),requireAuth(), getServiceAppointmentsByPatent);
serviceAppointmentRouter.get("/:id", getServiceAppointmentById);
serviceAppointmentRouter.put("/:id", updateServiceAppointment);
serviceAppointmentRouter.post("/:id/cancel", cancelServiceAppointment);




export default serviceAppointmentRouter;