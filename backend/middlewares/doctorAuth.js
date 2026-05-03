import jwt from "jsonwebtoken";
import Doctor from "../models/Doctor.js";

const JWT_SECRET = process.env.JWT_SECRET;

export default async function doctorAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try{
        // Verify the token
        const payload = jwt.verify(token, JWT_SECRET);

        if(payload.role && payload.role !== "doctor"){
            return res.status(403).json({ message: "Forbidden: Not a doctor" });
        }

        // fetch doctor from database
        const doctor = await Doctor.findById(payload.id).select("-password");

        if(!doctor){
            return res.status(401).json({
                success: false,
                message: "Doctor not found"

            })
        }
        // Attach doctor to request object
        req.doctor = doctor;
        next();

    }
    catch(err){
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        })
    }
}