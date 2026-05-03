import Doctor from "../models/Doctor.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

import jwt from "jsonwebtoken";

// helper Function:-

// this function converts time in "hh:mm AM/PM" format to total minutes from midnight, which helps in sorting the schedule slots correctly. For example, "2:30 PM" would be converted to 870 minutes (14 hours * 60 + 30 minutes).

const parseTimeToMinutes = (t = "") => {
  const [time = "0:00", ampm = ""] = (t || "").split(" ");
  const [hh = 0, mm = 0] = time.split(":").map(Number);
  let h = hh % 12;
  if ((ampm || "").toUpperCase() === "PM") h += 12;
  return h * 60 + (mm || 0);
};

// This function takes a schedule object, removes duplicate time slots for each date, and sorts the time slots in chronological order. It returns a new schedule object with the cleaned and sorted time slots.

function dedupeAndSortSchedule(schedule = {}) {
  const out = {};
  Object.entries(schedule).forEach(([date, slots]) => {
    if (!Array.isArray(slots)) return;
    const uniq = Array.from(new Set(slots));
    uniq.sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));
    out[date] = uniq;
  });
  return out;
}

// This function takes a schedule input, which can be either a JSON string or an object. It parses the input, removes duplicate time slots for each date, and sorts the time slots in chronological order. If the input is a string, it attempts to parse it as JSON. If parsing fails or if the input is not provided, it returns an empty schedule object.

function parseScheduleInput(s) {
  if (!s) return {};
  if (typeof s === "string") {
    try {
      s = JSON.parse(s);
    } catch {
      return {};
    }
  }
  return dedupeAndSortSchedule(s || {});
}

// This function takes a raw doctor document (which may include Mongoose-specific types like Map) and normalizes it for client consumption. It converts the schedule from a Mongoose Map to a plain JavaScript object, ensures that the availability field has a default value of "Available", and sets default values for patients, rating, and fee if they are not already defined.

function normalizeDocForClient(raw = {}) {
  // ✅ Convert mongoose doc to plain object safely
  const doc =
    typeof raw.toObject === "function" ? raw.toObject() : { ...raw };

  // ✅ FIX: Proper schedule handling
  if (doc.schedule instanceof Map) {
    doc.schedule = Object.fromEntries(doc.schedule);
  } else if (doc.schedule && typeof doc.schedule === "object") {
    doc.schedule = doc.schedule;
  } else {
    doc.schedule = {};
  }

  // ✅ Default values
  doc.availability =
    doc.availability === undefined ? "Available" : doc.availability;

  doc.patients = doc.patients ?? "";
  doc.rating = doc.rating ?? 0;
  doc.fee = doc.fee ?? doc.fees ?? 0;

  return doc;
}
//Ceate Doctor
export async function createDoctor(req, res) {
  try {
    const body = req.body || {};
    if (!body.name || !body.email || !body.password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }
    const emailLC = (body.email || "").toLowerCase();
    if (await Doctor.findOne({ email: emailLC })) {
      return res.status(409).json({
        success: false,
        message: "Doctor with this email already exists",
      });
    }

    let imageUrl = body.imageUrl || null;
    let imagePublicId = body.imagePublicId || null;
    if (req.file?.path) {
      const uploaded = await uploadToCloudinary(req.file.path, "Doctors");
      imageUrl = uploaded.secure_url;
      imagePublicId = uploaded.public_id;
    }

    const schedule = parseScheduleInput(body.schedule);

    const doc = new Doctor({
      email: emailLC,
      password: body.password,
      name: body.name,
      specialization: body.specialization || "",
      imageUrl,
      imagePublicId,
      availability: body.availability || "Available",
      experience: body.experience || "",
      qualifications: body.qualifications || "",
      location: body.location || "",
      about: body.about || "",
      fee: body.fee !== undefined ? Number(body.fee) : 0,
      schedule,
      success: body.success || "",
      patients: body.patients || "",
      rating: body.rating !== undefined ? Number(body.rating) : 0,
    });

    await doc.save();
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.warn(
        "JWT_SECRET is not set in environment variables. Token generation will fail.",
      );
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }

    const token = jwt.sign(
      {
        id: doc._id.toString(),
        email: doc.email,
        role: "doctor",
      },
      secret,
      { expiresIn: "7d" },
    );
    return res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      token,
      doctor: normalizeDocForClient(doc),
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

// Get Doctor

export const getDoctors = async (req, res) => {
  try {
    const { q = "", limit: limitRaw = 200, page: pageRaw = 1 } = req.query;
    const limit = Math.min(500, Math.max(1, parseInt(limitRaw, 10) || 200));
    const page = Math.max(1, parseInt(pageRaw, 10) || 1);
    const skip = (page - 1) * limit;

    const match = {};
    if (q && typeof q === "string" && q.trim()) {
      const re = new RegExp(q.trim(), "i");
      match.$or = [
        { name: re },
        { specialization: re },
        { speciality: re },
        { email: re },
      ];
    }

    const docs = await Doctor.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "appointments",
          localField: "_id",
          foreignField: "doctorId",
          as: "appointments",
        },
      },
      {
        $addFields: {
          appointmentsTotal: { $size: "$appointments" },
          appointmentsCompleted: {
            $size: {
              $filter: {
                input: "$appointments",
                as: "a",
                cond: { $in: ["$$a.status", ["Confirmed", "Completed"]] },
              },
            },
          },
          appointmentsCanceled: {
            $size: {
              $filter: {
                input: "$appointments",
                as: "a",
                cond: { $eq: ["$$a.status", "Canceled"] },
              },
            },
          },
          earnings: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$appointments",
                    as: "a",
                    cond: { $in: ["$$a.status", ["Confirmed", "Completed"]] },
                  },
                },
                as: "p",
                in: { $ifNull: ["$$p.fees", 0] },
              },
            },
          },
        },
      },
      { $project: { appointments: 0 } },
      { $sort: { name: 1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const normalized = docs.map((d) => ({
      _id: d._id,
      id: d._id,
      name: d.name || "",
      specialization: d.specialization || d.speciality || "",
      fee: d.fee ?? d.fees ?? d.consultationFee ?? 0,
      imageUrl: d.imageUrl || d.image || d.avatar || null,
      appointmentsTotal: d.appointmentsTotal || 0,
      appointmentsCompleted: d.appointmentsCompleted || 0,
      appointmentsCanceled: d.appointmentsCanceled || 0,
      earnings: d.earnings || 0,
      availability: d.availability ?? "Available",
      schedule: d.schedule && typeof d.schedule === "object" ? d.schedule : {},
      patients: d.patients ?? "",
      rating: d.rating ?? 0,
      about: d.about ?? "",
      experience: d.experience ?? "",
      qualifications: d.qualifications ?? "",
      location: d.location ?? "",
      success: d.success ?? "",
      raw: d,
    }));

    const total = await Doctor.countDocuments(match);
    return res.json({
      success: true,
      data: normalized,
      doctors: normalized,
      meta: { page, limit, total },
    });
  } catch (err) {
    console.error("getDoctors:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get Doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Doctor.findById(id);
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }
    return res.json({
  success: true,
  doctor: normalizeDocForClient(doc.toObject())
});
  } catch (err) {
    console.error("getDoctorById:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update Doctor

export async function updateDoctor(req, res) {
  try {
    const { id } = req.params;
    const body = req.body || {};

    if (!req.doctor || String(req.doctor._id || req.doctor.id) !== String(id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this doctor",
      });
    }

    const existing = await Doctor.findById(id);
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });

    if (req.file?.path) {
      const uploaded = await uploadToCloudinary(req.file.path, "doctors");
      if (uploaded) {
        const previousPublicId = existing.imagePublicId;
        existing.imageUrl =
          uploaded.secure_url || uploaded.url || existing.imageUrl;
        existing.imagePublicId =
          uploaded.public_id || uploaded.publicId || existing.imagePublicId;
        if (previousPublicId && previousPublicId !== existing.imagePublicId) {
          deleteFromCloudinary(previousPublicId).catch((e) =>
            console.warn("deleteFromCloudinary warning:", e?.message || e),
          );
        }
      }
    } else if (body.imageUrl) {
      existing.imageUrl = body.imageUrl;
    }

    if (body.schedule) existing.schedule = parseScheduleInput(body.schedule);

    const updatable = [
      "name",
      "specialization",
      "experience",
      "qualifications",
      "location",
      "about",
      "fee",
      "availability",
      "success",
      "patients",
      "rating",
    ];
    updatable.forEach((k) => {
      if (body[k] !== undefined) existing[k] = body[k];
    });

    if (body.email && body.email !== existing.email) {
      const other = await Doctor.findOne({ email: body.email.toLowerCase() });
      if (other && other._id.toString() !== id)
        return res
          .status(409)
          .json({ success: false, message: "Email already in use" });
      existing.email = body.email.toLowerCase();
    }

    if (body.password) existing.password = body.password;

    await existing.save();

    const out = normalizeDocForClient(existing.toObject());
    delete out.password;
    return res.json({ success: true, data: out });
  } catch (err) {
    console.error("updateDoctor error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// Delete Doctor
export async function deleteDoctor(req, res) {
  try {
    const { id } = req.params;
    const existing = await Doctor.findById(id);
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });

    if (existing.imagePublicId) {
      await deleteFromCloudinary(existing.imagePublicId).catch((e) =>
        console.warn("deleteFromCloudinary warning:", e?.message || e),
      );
    }
    await Doctor.findByIdAndDelete(id);
    return res.json({ success: true, message: "Doctor deleted successfully" });
  } catch (err) {
    console.error("deleteDoctor error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}

// to toggle doctor availability
export async function toggleDoctorAvailability(req, res) {
  try {
    const { id } = req.params;
    if (!req.doctor || String(req.doctor._id || req.doctor.id) !== String(id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this doctor",
      });
    }

    const doc = await Doctor.findById(id);
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    if (typeof doc.availability === "boolean")
      doc.availability = !doc.availability;
    else
      doc.availability =
        doc.availability === "Available" ? "Unavailable" : "Available";
    await doc.save();
    const out = normalizeDocForClient(doc.toObject());
    delete out.password;
    return res.json({ success: true, doctor: out });
  } catch (err) {
    console.error("toggleDoctorAvailability error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}

// to login doctor

export async function doctorLogin(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const doc = await Doctor.findOne({
      email: email.toLowerCase(),
    }).select("+password");
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    if (doc.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.warn(
        "JWT_SECRET is not set in environment variables. Token generation will fail.",
      );
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }

    const token = jwt.sign(
      {
        id: doc._id.toString(),
        email: doc.email,
        role: "doctor",
      },
      secret,
      { expiresIn: "7d" },
    );

    const out = doc.toObject();
    delete out.password;
    return res.json({ success: true, token, doctor: out });
  } catch (err) {
    console.error("doctorLogin error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}
