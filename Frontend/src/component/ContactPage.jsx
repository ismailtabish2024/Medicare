import React, { useState } from "react";
import { contactPageStyles as c } from "../assets/dummyStyles";
import {
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  SendHorizonal,
  Stethoscope,
  User,
} from "lucide-react";

const ContactPage = () => {
  const initial = {
    name: "",
    email: "",
    phone: "",
    department: "",
    service: "",
    message: "",
  };

  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const departments = [
    "General Physician",
    "Cardiology",
    "Orthopedics",
    "Dermatology",
    "Pediatrics",
    "Gynecology",
  ];

  const servicesMapping = {
    "General Physician": [
      "General Consultation",
      "Adult Checkup",
      "Vaccination",
      "Health Screening",
    ],
    Cardiology: [
      "ECG",
      "Echocardiography",
      "Stress Test",
      "Heart Consultation",
    ],
    Orthopedics: ["Fracture Care", "Joint Pain Consultation", "Physiotherapy"],
    Dermatology: ["Skin Consultation", "Allergy Test", "Acne Treatment"],
    Pediatrics: ["Child Checkup", "Vaccination (Child)", "Growth Monitoring"],
    Gynecology: ["Antenatal Care", "Pap Smear", "Ultrasound"],
  };

  const genericServices = [
    "General Consultation",
    "ECG",
    "Blood Test",
    "X-Ray",
    "Ultrasound",
    "Physiotherapy",
    "Vaccination",
  ];

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "Enter a valid email";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(form.phone))
      e.phone = "Phone number must be exactly 10 digits";

    if (!form.department && !form.service) {
      e.department = "Please choose a department or service";
      e.service = "Please choose a department or service";
    }

    if (!form.message.trim()) e.message = "Please write a short message";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "department") {
      setForm((prev) => ({ ...prev, department: value, service: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    setErrors((prev) => ({ ...prev, [name]: undefined }));

    if (name === "department" || name === "service") {
      setErrors((prev) => {
        const copy = { ...prev };
        if (
          (name === "department" && value) ||
          (name === "service" && value) ||
          form.department ||
          form.service
        ) {
          delete copy.department;
          delete copy.service;
        }
        return copy;
      });
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const text = `*Contact Request*\nName: ${form.name}\nEmail: ${
      form.email
    }\nPhone: ${form.phone}\nDepartment: ${
      form.department || "N/A"
    }\nService: ${form.service || "N/A"}\nMessage: ${form.message}`;

    const url = `https://wa.me/9179800430?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");

    setForm(initial);
    setErrors({});
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  }

  const availableServices = form.department
    ? servicesMapping[form.department] || []
    : genericServices;

  return (
    <div className={c.pageContainer}>
      <div className={c.bgAccent1}></div>
      <div className={c.bgAccent2}></div>

      <div className={c.gridContainer}>
        <div className={c.formContainer}>
          <h2 className={c.formTitle}>Contact Our Clinic</h2>
          <p className={c.formSubtitle}>
            Fill the form, we will open WhatsApp and connect with us.
          </p>

          <form onSubmit={handleSubmit} className={c.formSpace}>
            <div className={c.formGrid}>
              <div>
                <label className={c.label}>
                  <User size={16} /> Full Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className={c.input}
                />
                {errors.name && <p className={c.error}>{errors.name}</p>}
              </div>

              <div>
                <label className={c.label}>
                  <Mail size={16} /> Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="example12@gmail.com"
                  className={c.input}
                />
                {errors.email && <p className={c.error}>{errors.email}</p>}
              </div>
            </div>

            <div className={c.formGrid}>
              <div>
                <label className={c.label}>
                  <Phone size={16} /> Phone
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="1234567890"
                  className={c.input}
                  maxLength="10"
                  aria-invalid={!!errors.phone}
                />
                {errors.phone && <p className={c.error}>{errors.phone}</p>}
              </div>

              <div>
                <label className={c.label}>
                  <MapPin size={16} /> Department
                </label>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className={c.input}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <p className={c.error}>{errors.department}</p>
                )}
              </div>
            </div>

            <div>
              <label className={c.label}>
                <Stethoscope size={16} />
              </label>

              <select
                name="service"
                value={form.service}
                onChange={handleChange}
                className={c.input}
              >
                <option value="">
                  Select Service (or choose Department above)
                </option>
                {availableServices.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {errors.service && <p className={c.error}>{errors.service}</p>}
            </div>

            <div>
              <label className={c.label}>
                <MessageSquare size={16} />
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Describe Your concern briefly"
                rows={4}
                className={c.textarea}
              />

              {errors.message && <p className={c.error}>{errors.message}</p>}
            </div>

            <div className={c.buttonContainer}>
              <button type="submit" className={c.button}>
                <SendHorizonal size={18} /> <span>Send via WhatsApp</span>
              </button>

              {sent && (
                <p className={c.sentMessage}>
                  Opening WhatsApp and clearing the form...
                </p>
              )}
            </div>
          </form>
        </div>

        {/* right side */}

        <div className={c.infoContainer}>
          <div className={c.infoCard}>
            <h3 className={c.infoTitle}>Visit Our Clinic</h3>
            <p className={c.infoText}>GotiNagar , Lucknow , Uttar Pradesh</p>
            <p className={c.infoItem}>
              <Phone size={16} /> 9179800430
            </p>
            <p className={c.infoItem}>
              <Mail size={16} /> info@yourclinic.com
            </p>
          </div>

          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.460792853461!2d80.98709187529213!3d26.870382662861033!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399be2ae3cea2421%3A0x6c0de12e8a77818f!2sGomti%20Nagar%2C%20Lucknow%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1731769000000!5m2!1sen!2sin"
            className={c.map}
            title="Gomti Nagar Map"
            loading="lazy"
            allowFullScreen
          ></iframe>

          <div className={c.hoursContainer}>
            <h4 className={c.hoursTitle}>
                Clinic Hours
            </h4>
            <p className={c.hoursText}>
                Mon-Sat : 9:00 AM - 6:00 Pm
            </p>

          </div>
        </div>
      </div>
      <style>{c.animationKeyframes}</style>
    </div>
  );
};

export default ContactPage;
