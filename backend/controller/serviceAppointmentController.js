import { getAuth } from "@clerk/express";
import Service from "../models/Service.js";
import ServiceAppointment from "../models/serviceAppointment.js";
import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY;

const stripe = stripeKey
  ? new Stripe(stripeKey, {
      apiVersion: "2022-11-15",
    })
  : null;

// Helper function

const safeNumber = (val) => {
  if (val === undefined || val === null || val === "") return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
};

function parseTimeString(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return null;
  const t = timeStr.trim();
  const m = t.match(/([0-9]{1,2}):?([0-9]{0,2})\s*(AM|PM|am|pm)?/);
  if (!m) return null;
  let hh = parseInt(m[1], 10);
  let mm = m[2] ? parseInt(m[2], 10) : 0;
  const ampm = (m[3] || "").toUpperCase();
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;

  if (ampm) {
    if (hh < 1 || hh > 12 || mm < 0 || mm > 59) return null;
    return { hour: hh, minute: mm, ampm };
  }

  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
  if (hh === 0) return { hour: 12, minute: mm, ampm: "AM" };
  if (hh === 12) return { hour: 12, minute: mm, ampm: "PM" };
  if (hh > 12) return { hour: hh - 12, minute: mm, ampm: "PM" };
  return { hour: hh, minute: mm, ampm: "AM" };
}

const buildFrontendBase = (req) => {
  const env = process.env.FRONTEND_URL;
  if (env) return env.replace(/\/$/, "");
  const origin = req.get("origin") || req.get("referer") || null;
  return origin ? origin.replace(/\/$/, "") : null;
};

function resolveClerkUserId(req) {
  try {
    const auth = req.auth || {};
    const candidate =
      auth?.userId || auth?.user_id || auth?.user?.id || req.user?.id || null;
    if (candidate) return candidate;
    try {
      const serverAuth = getAuth(req);
      return serverAuth?.userId || null;
    } catch (e) {
      return null;
    }
  } catch (e) {
    return null;
  }
}

export const createServiceAppointment = async (req, res) => {
  try {
    const body = req.body || {};
    const clerkUserId = resolveClerkUserId(req);
    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      serviceId,
      serviceName: serviceNameFromBody,
      patientName,
      mobile,
      age,
      gender,
      date,
      time,
      hour,
      minute,
      ampm,
      paymentMethod = "Online",
      amount: amountFromBody,
      fees: feesFromBody,
      email,
      meta = {},
      notes = "",
      serviceImageUrl: serviceImageUrlFromBody,
      serviceImagePublicId: serviceImagePublicIdFromBody,
    } = body;

    if (!serviceId)
      return res
        .status(400)
        .json({ success: false, message: "serviceId is required" });
    if (!patientName || !String(patientName).trim())
      return res
        .status(400)
        .json({ success: false, message: "patientName is required" });
    if (!mobile || !String(mobile).trim())
      return res
        .status(400)
        .json({ success: false, message: "mobile is required" });
    if (!date || !String(date).trim())
      return res
        .status(400)
        .json({ success: false, message: "date is required (YYYY-MM-DD)" });

    const numericAmount = safeNumber(amountFromBody ?? feesFromBody ?? 0);
    if (numericAmount === null || numericAmount < 0)
      return res.status(400).json({
        success: false,
        message: "amount/fees must be a valid number",
      });

    let finalHour = hour !== undefined ? safeNumber(hour) : null;
    let finalMinute = minute !== undefined ? safeNumber(minute) : null;
    let finalAmpm = ampm || null;

    if (time && (finalHour === null || finalHour === undefined)) {
      const parsed = parseTimeString(time);
      if (!parsed)
        return res
          .status(400)
          .json({ success: false, message: "time string couldn't be parsed" });
      finalHour = parsed.hour;
      finalMinute = parsed.minute;
      finalAmpm = parsed.ampm;
    }

    if (
      finalHour === null ||
      finalMinute === null ||
      (finalAmpm !== "AM" && finalAmpm !== "PM")
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Time missing or invalid — provide time string or hour, minute and ampm.",
      });
    }

    // DUPLICATE BOOKING CHECK
    try {
      const existing = await ServiceAppointment.findOne({
        serviceId: String(serviceId),
        createdBy: clerkUserId,
        date: String(date),
        hour: Number(finalHour),
        minute: Number(finalMinute),
        ampm: finalAmpm,
        status: { $ne: "Canceled" },
      }).lean();
      if (existing)
        return res.status(409).json({
          success: false,
          message:
            "You already have a booking for this service at the selected date and time.",
        });
    } catch (chkErr) {
      console.warn("Duplicate booking check failed:", chkErr);
    }

    // Fetch service snapshot (non-fatal)
    let svc = null;
    try {
      svc = await Service.findById(serviceId).lean();
    } catch (e) {
      console.warn("Service lookup failed:", e?.message || e);
    }

    let resolvedServiceName =
      serviceNameFromBody || (svc && (svc.name || svc.title)) || "Service";
    const svcImageUrlFromDB =
      svc &&
      (String(
        svc.imageUrl ||
          svc.image ||
          svc.image?.url ||
          svc.profileImage?.url ||
          "",
      ).trim() ||
        "");
    const svcImagePublicIdFromDB =
      svc &&
      (String(
        svc.imagePublicId ||
          svc.image?.publicId ||
          svc.profileImage?.publicId ||
          "",
      ).trim() ||
        "");
    const finalServiceImageUrl =
      svcImageUrlFromDB && svcImageUrlFromDB.length
        ? svcImageUrlFromDB
        : (serviceImageUrlFromBody && String(serviceImageUrlFromBody).trim()) ||
          "";
    const finalServiceImagePublicId =
      svcImagePublicIdFromDB && svcImagePublicIdFromDB.length
        ? svcImagePublicIdFromDB
        : (serviceImagePublicIdFromBody &&
            String(serviceImagePublicIdFromBody).trim()) ||
          "";

    const base = {
      serviceId,
      serviceName: resolvedServiceName,
      serviceImage: {
        url: finalServiceImageUrl,
        publicId: finalServiceImagePublicId,
      },
      patientName: String(patientName).trim(),
      mobile: String(mobile).trim(),
      age: age ? Number(age) : undefined,
      gender: gender || "",
      date: String(date),
      hour: Number(finalHour),
      minute: Number(finalMinute),
      ampm: finalAmpm,
      fees: numericAmount,
      createdBy: clerkUserId,
      notes: notes || "",
    };

    // Free appointment
    if (numericAmount === 0) {
      const created = await ServiceAppointment.create({
        ...base,
        status: "Pending",
        payment: {
          method: "Cash",
          status: "Pending",
          amount: 0,
          paidAt: new Date(),
        },
      });
      return res.status(201).json({ success: true, appointment: created });
    }

    // Cash booking
    if (paymentMethod === "Cash") {
      const created = await ServiceAppointment.create({
        ...base,
        status: "Pending",
        payment: {
          method: "Cash",
          status: "Pending",
          amount: numericAmount,
          meta,
        },
      });
      return res
        .status(201)
        .json({ success: true, appointment: created, checkoutUrl: null });
    }

    // Online booking (Stripe)
    if (!stripe)
      return res
        .status(500)
        .json({ success: false, message: "Stripe not configured on server" });
    const frontendBase = buildFrontendBase(req);
    if (!frontendBase)
      return res.status(500).json({
        success: false,
        message:
          "Frontend base URL not available. Set FRONTEND_URL or provide Origin header.",
      });

    const successUrl = `${frontendBase}/service-appointment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${frontendBase}/service-appointment/cancel`;

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: email ? String(email) : undefined,
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: `Service: ${String(resolvedServiceName).slice(0, 60)}`,
                description: `Appointment on ${base.date} ${base.hour}:${String(base.minute).padStart(2, "0")} ${base.ampm}`,
              },
              unit_amount: Math.round(numericAmount * 100),
            },
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          serviceId: String(serviceId),
          serviceName: String(resolvedServiceName).slice(0, 200),
          patientName: base.patientName,
          mobile: base.mobile,
          clerkUserId: base.createdBy || "",
          serviceImageUrl: finalServiceImageUrl
            ? String(finalServiceImageUrl).slice(0, 200)
            : "",
        },
      });
    } catch (stripeErr) {
      console.error("Stripe create session error:", stripeErr);
      const message =
        stripeErr?.raw?.message || stripeErr?.message || "Stripe error";
      return res.status(502).json({
        success: false,
        message: `Payment provider error: ${message}`,
      });
    }

    try {
      const created = await ServiceAppointment.create({
        ...base,
        status: "Confirmed",
        payment: {
          method: "Online",
          status: "Pending",
          amount: numericAmount,
          sessionId: session.id || "",
        },
      });
      return res.status(201).json({
        success: true,
        appointment: created,
        checkoutUrl: session.url || null,
      });
    } catch (dbErr) {
      console.error(
        "DB error saving service appointment after stripe session:",
        dbErr,
      );
      return res.status(500).json({
        success: false,
        message: "Failed to create appointment record",
      });
    }
  } catch (err) {
    console.error("createServiceAppointment unexpected:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// to confirm a service payment

export const confirmServicePayment = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) {
      return res
        .status(400)
        .json({ success: false, message: "session_id is required" });
    }

    if (!stripe) {
      return res
        .status(500)
        .json({ success: false, message: "Stripe not configured on server" });
    }

    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(session_id);
    } catch (err) {
      console.error("Stripe retrieve session error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve session details",
      });
    }

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }
    if (session.payment_status !== "paid") {
      return res
        .status(400)
        .json({ success: false, message: "Payment not completed" });
    }

    let appt = await ServiceAppointment.findOneAndUpdate(
      { "payment.sessionId": session_id },
      {
        $set: {
          "payment.status": "Paid",
          "payment.providerId": session.payment_intent || "",
          "payment.paidAt": new Date(),
          status: "Confirmed",
        },
      },
      { new: true },
    );

    if (!appt && session.metadata?.appointmentId) {
      appt = await ServiceAppointment.findOneAndUpdate(
        { _id: session.metadata.appointmentId },
        {
          $set: {
            "payment.status": "Paid",
            "payment.providerId": session.payment_intent || "",
            "payment.paidAt": new Date(),
            status: "Confirmed",
          },
        },
        { new: true },
      );
    }

    if (!appt)
      return res
        .status(404)
        .json({ success: false, message: "Service appointment not found" });
    return res.json({ success: true, appointment: appt });
  } catch (error) {
    console.error("Error confirming service payment:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to confirm payment" });
  }
};

// get service appointment

export const getServiceAppointment = async (req, res) => {
  try {
    const {
      serviceId,
      mobile,
      status,
      page: pageRaw = 1,
      limit: limitRaw = 50,
      search = "",
    } = req.query;
    const limit = Math.min(200, Math.max(1, parseInt(limitRaw, 10) || 50));
    const page = Math.max(1, parseInt(pageRaw, 10) || 1);
    const skip = (page - 1) * limit;

    const filter = {};
    if (serviceId) filter.serviceId = serviceId;
    if (mobile) filter.mobile = mobile;
    if (status) filter.status = status;
    if (search) {
      const re = new RegExp(search, "i");
      filter.$or = [{ patientName: re }, { mobile: re }, { notes: re }];
    }

    const appointments = await ServiceAppointment.find(filter)
      .populate("serviceId", "name imageUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ServiceAppointment.countDocuments(filter);
    return res.json({
      success: true,
      appointments,
      meta: { page, limit, total, count: appointments.length },
    });
  } catch (error) {
    console.error("Error fetching service appointments:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch service appointments",
      });
  }
};
export const getServiceAppointments = getServiceAppointment;

// get service appointment by id
export const getServiceAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Appointment ID is required" });

    const appointment = await ServiceAppointment.findById(id)
      .populate("serviceId", "name imageUrl")
      .lean();

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    return res.json({ success: true, appointment });
  } catch (error) {
    console.error("Error fetching service appointment by ID:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch service appointment" });
  }
};

// update service appointment

export const updateServiceAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const updateData = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.payment !== undefined) updateData.payment = body.payment;
    if (body["payment.status"] !== undefined)
      updateData["payment.status"] = body["payment.status"];

    if (body.rescheduledTo) {
      const { date, time } = body.rescheduledTo || {};
      updateData.rescheduledTo = {};
      if (date) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
          return res
            .status(400)
            .json({
              success: false,
              message: "rescheduledTo.date must be YYYY-MM-DD",
            });
        updateData.rescheduledTo.date = date;
        updateData.date = date;
      }
      if (time) {
        updateData.rescheduledTo.time = String(time);
        const parsed = parseTimeString(String(time));
        if (!parsed)
          return res
            .status(400)
            .json({
              success: false,
              message: "rescheduledTo.time couldn't be parsed",
            });
        updateData.hour = parsed.hour;
        updateData.minute = parsed.minute;
        updateData.ampm = parsed.ampm;
        updateData.time = `${String(parsed.hour).padStart(2, "0")}:${String(parsed.minute).padStart(2, "0")} ${parsed.ampm}`;
      }
      if (!body.status) updateData.status = "Rescheduled";
    }

    if (updateData.payment) {
      const method = updateData.payment.method || updateData.payment?.method;
      if (method && String(method).toLowerCase() === "online")
        updateData.status = updateData.status || "Confirmed";
      if (updateData.payment.status === "Confirmed") {
        updateData.payment.status = "Paid";
      }
      if (updateData.payment.status === "Paid") {
        updateData.status = "Confirmed";
        if (updateData.payment.paidAt === undefined)
          updateData.payment.paidAt = new Date();
      }
    }

    const updated = await ServiceAppointment.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Service appointment not found" });
    return res.json({ success: true, appointment: updated });
  } catch (error) {
    console.error("Error updating service appointment:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to update service appointment",
      });
  }
};

// cancel service appointment
export const cancelServiceAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appt = await ServiceAppointment.findById(id);

    if (!appt)
      return res.status(404).json({ success: false, message: "Not found" });
    if (appt.status === "Completed")
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a completed appointment",
      });

    appt.status = "Canceled";
    if (appt.payment)
      appt.payment.status = appt.payment.status === "Paid" ? "Refunded" : "Pending";
    await appt.save();

    return res.json({ success: true, appointment: appt });

  } catch (error) {
    console.error("Error canceling service appointment:", error);
    return res.status(500).json({ success: false, message: "Failed to cancel service appointment" });
  }
}


// get statistics
export const getServiceAppointmentStats = async (req, res) => {
  try {
    const service = await Service.aggregate([
        {
        $lookup: { from: "serviceappointments", localField: "_id", foreignField: "serviceId", as: "appointments" },
      },
      {
        $addFields: {
          totalAppointments: { $size: "$appointments" },
          completed: { $size: { $filter: { input: "$appointments", as: "a", cond: { $eq: ["$$a.status", "Completed"] } } } },
          canceled: { $size: { $filter: { input: "$appointments", as: "a", cond: { $eq: ["$$a.status", "Canceled"] } } } },
        },
      },
      { $addFields: { earning: { $multiply: ["$completed", "$price"] } } },
      { $project: { name: 1, price: 1, image: "$imageUrl", totalAppointments: 1, completed: 1, canceled: 1, earning: 1 } },
      { $sort: { createdAt: -1 } },
    ]);
    return res.json({ success: true, services: service , total: service.length });
  } catch (error) {
    console.error("Error getting service appointment stats:", error);
    return res.status(500).json({ success: false, message: "Failed to get service appointment stats" });
  }
}

// get oppointment slots for a patent
export const getServiceAppointmentsByPatent = async (req, res) => {
  try {
    const clerkUserId = resolveClerkUserId(req);
    const {createdBy , mobile} = req.query;
    const resolvedCreateedBy = createdBy || clerkUserId || null;
    if(!resolvedCreateedBy && !mobile) {
      return res.json({ success: true, data: [] });
    }
    const filter = {};
    if(resolvedCreateedBy) filter.createdBy = resolvedCreateedBy;
    if(mobile) filter.mobile = mobile;

    const list = await ServiceAppointment.find(filter).populate("serviceId", "name imageUrl").sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: list });
  } catch (error) {
    console.error("Error getting service appointments by patent:", error);
    return res.status(500).json({ success: false, message: "Failed to get service appointments by patent" });

    
  }
}

export default {
  createServiceAppointment,
  confirmServicePayment,
  getServiceAppointment,
  getServiceAppointments,
  getServiceAppointmentById,
  updateServiceAppointment,
  cancelServiceAppointment,
  getServiceAppointmentStats,
  getServiceAppointmentsByPatent,
};
