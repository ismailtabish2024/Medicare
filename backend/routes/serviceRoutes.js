import express from "express";
import multer from "multer";
import { createService, deleteService, getAllServices, getServiceById, updateService } from "../controller/serviceController.js";


const upload = multer({ dest: "/tmp" });
const serviceRouter = express.Router();

serviceRouter.get("/", getAllServices);
serviceRouter.get("/:id", getServiceById);

serviceRouter.post("/", upload.single("image"), createService);
serviceRouter.put("/:id", upload.single("image"), updateService);
serviceRouter.delete("/:id", deleteService);


export default serviceRouter;
