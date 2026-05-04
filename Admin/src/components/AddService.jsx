import React, { useEffect, useRef, useState } from "react";
import { addServiceStyles as ad } from "../assets/dummyStyles";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ImageIcon,
  Plus,
  Trash2,
  Calendar,
} from "lucide-react";

const AddService = ({ serviceId }) => {
  const API_BASE = "https://medicare-backend-febv.onrender.com";

  const fileRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [hasExistingImage, setHasExistingImage] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);

  const [serviceName, setServiceName] = useState("");
  const [about, setAbout] = useState("");
  const [price, setPrice] = useState("");
  const [availability, setAvailability] = useState("available");

  const [instructions, setInstructions] = useState([""]);
  const [slots, setSlots] = useState([]);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDate = today.getDate();

  const years = Array.from({ length: 5 }).map((_, i) => currentYear + i);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const hours = Array.from({ length: 12 }).map((_, i) =>
    String(i + 1).padStart(2, "0"),
  );
  const minutes = Array.from({ length: 12 }).map((_, i) =>
    String(i * 5).padStart(2, "0"),
  );
  const ampm = ["AM", "PM"];

  const [slotDay, setSlotDay] = useState(String(currentDate));
  const [slotMonth, setSlotMonth] = useState(String(currentMonth));
  const [slotYear, setSlotYear] = useState(String(currentYear));
  const [slotHour, setSlotHour] = useState("11");
  const [slotMinute, setSlotMinute] = useState("00");
  const [slotAmPm, setSlotAmPm] = useState("AM");

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const selectedYearNum = Number(slotYear);
  const selectedMonthNum = Number(slotMonth);
  const daysInSelectedMonth = new Date(
    selectedYearNum,
    selectedMonthNum + 1,
    0,
  ).getDate();
  const days = Array.from({ length: daysInSelectedMonth }).map((_, i) =>
    String(i + 1),
  );

  useEffect(() => {
    if (Number(slotDay) > daysInSelectedMonth) {
      setSlotDay(String(daysInSelectedMonth));
    }
  }, [slotMonth, slotYear, daysInSelectedMonth]);

  //    to fetch services

  useEffect(() => {
    let mounted = true;
    async function loadService() {
      if (!serviceId) return;
      try {
        const res = await fetch(`${API_BASE}/api/services/${serviceId}`);
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          console.warn("Failed to fetch service:", res.status, txt);
          showToast(
            "error",
            "Load failed",
            "Could not load service for editing.",
          );
          return;
        }
        const payload = await res.json().catch(() => null);
        const data = payload?.data || payload;
        if (!data) return;
        if (!mounted) return;

        setServiceName(data.name || "");
        setAbout(data.about || data.description || "");
        setPrice(data.price != null ? String(data.price) : "");
        setAvailability(data.available ? "available" : "unavailable");
        setInstructions(
          Array.isArray(data.instructions) && data.instructions.length
            ? data.instructions
            : [""],
        );
        setSlots(Array.isArray(data.slots) ? data.slots : []);
        if (data.imageUrl) {
          setImagePreview(data.imageUrl);
          setHasExistingImage(true);
          setRemoveImage(false);
        } else {
          setImagePreview(null);
          setHasExistingImage(false);
        }
      } catch (err) {
        console.error("loadService error:", err);
        showToast("error", "Network error", "Could not load service.");
      }
    }
    loadService();
    return () => {
      mounted = false;
    };
  }, [serviceId, API_BASE]);

  function handleImageChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (imagePreview && imagePreview.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(imagePreview);
      } catch (err) {}
    }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
    setRemoveImage(false);
    setHasExistingImage(false);
  }

  function addInstruction() {
    setInstructions((s) => [...s, ""]);
  }
  function updateInstruction(i, v) {
    setInstructions((s) => s.map((x, idx) => (idx === i ? v : x)));
  }
  function removeInstruction(i) {
    setInstructions((s) => s.filter((_, idx) => idx !== i));
  }

  function resetForm() {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(imagePreview);
      } catch (err) {}
    }
    setImagePreview(null);
    setImageFile(null);
    setHasExistingImage(false);
    setRemoveImage(false);
    setServiceName("");
    setAbout("");
    setPrice("");
    setAvailability("available");
    setInstructions([""]);
    setSlots([]);
    setErrors({});
  }

  function showToast(type, title, message) {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 3500);
  }

  function selectedDateTime() {
    const d = Number(slotDay);
    const m = Number(slotMonth);
    const y = Number(slotYear);
    let h = Number(slotHour);
    const mm = Number(slotMinute);
    const ap = slotAmPm;

    if (ap === "AM") {
      if (h === 12) h = 0;
    } else {
      if (h !== 12) h = h + 12;
    }

    return new Date(y, m, d, h, mm, 0, 0);
  }

  function isSelectedDateTimeInPast() {
    const sel = selectedDateTime();
    return sel.getTime() <= Date.now();
  }

  function addSlot() {
    const m = months[Number(slotMonth)];
    const d = String(slotDay).padStart(2, "0");
    const y = slotYear;
    const h = String(slotHour).padStart(2, "0");
    const mm = slotMinute;
    const ap = slotAmPm;
    const formatted = `${d} ${m} ${y} • ${h}:${mm} ${ap}`;

    if (slots.includes(formatted)) {
      showToast(
        "error",
        "Duplicate Slot",
        "This time slot has already been added. Please select a different time.",
      );
      return;
    }

    if (isSelectedDateTimeInPast()) {
      showToast(
        "error",
        "Past Time",
        "You cannot add a time slot in the past. Please select a future date/time.",
      );
      setErrors((e) => ({ ...e, slots: true }));
      return;
    }

    setSlots((s) => [...s, formatted]);
    setErrors((e) => ({ ...e, slots: false }));
    showToast("success", "Slot Added", `Time slot added: ${formatted}`);
  }

  function removeSlot(i) {
    const removedSlot = slots[i];
    setSlots((s) => s.filter((_, idx) => idx !== i));
    showToast("info", "Slot Removed", `Removed: ${removedSlot}`);
  }

  function validate() {
    const newErrors = {};
    if (!imageFile && !hasExistingImage) newErrors.image = true;
    if (!serviceName.trim()) newErrors.serviceName = true;
    if (!about.trim()) newErrors.about = true;
    if (!String(price).trim()) newErrors.price = true;
    if (!instructions.some((ins) => ins.trim())) newErrors.instructions = true;
    if (!slots.length) newErrors.slots = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) {
      showToast(
        "error",
        "Missing Fields",
        "Please fill all required fields before submitting.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("name", serviceName);
      fd.append("about", about);
      const numericPrice = String(price).replace(/[^\d.-]/g, "");
      fd.append("price", numericPrice === "" ? "0" : numericPrice);
      fd.append("availability", availability);
      // arrays serialized as JSON
      fd.append("instructions", JSON.stringify(instructions));
      fd.append("slots", JSON.stringify(slots));

      if (imageFile) {
        fd.append("image", imageFile);
      } else if (removeImage) {
        fd.append("removeImage", "true");
      }

      const url = serviceId
        ? `${API_BASE}/api/services/${serviceId}`
        : `${API_BASE}/api/services`;
      const method = serviceId ? "PUT" : "POST";

      const res = await fetch(url, { method, body: fd });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.message || `Server error (${res?.status || "?"})`;
        showToast("error", "Save Failed", msg);
        setSubmitting(false);
        return;
      }

      showToast(
        "success",
        serviceId ? "Service Updated" : "Service Added",
        `${serviceName} saved with ${slots.length} slot(s).`,
      );

      if (!serviceId) {
        resetForm();
        if (fileRef.current) fileRef.current.value = null;
      } else {
        const saved = data?.data || null;
        if (saved) {
          setHasExistingImage(Boolean(saved.imageUrl));
          setImagePreview(saved.imageUrl || null);
          setImageFile(null);
          setRemoveImage(false);
        }
      }
    } catch (err) {
      console.error("service submit error:", err);
      showToast("error", "Network error", "Could not reach server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={ad.container.main}>
      <div className={ad.toast.container}>
        {toast && (
          <div
            className={`${ad.toast.toastBase} ${toast.type === "error" ? ad.toast.toastError : toast.type === "info" ? ad.toast.toastInfo : ad.toast.toastSuccess} animate-slideIn`}
          >
            <div className={ad.toast.iconContainer(toast.type)}>
              {toast.type === "error" ? (
                <AlertTriangle className="w-5 h-5" />
              ) : toast.type === "info" ? (
                <Clock className="w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className={ad.toast.title}>{toast.title}</div>

              <div className={ad.toast.message}>{toast.message}</div>
            </div>

            <button
              className={ad.buttons.toastClose}
              onClick={() => setToast(null)}
            >
              <XCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className={ad.container.form}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className={ad.header.title}>
              {serviceId ? "Edit Service" : "Add New Service"}
            </h1>
            <p className={ad.header.subtitle}>
              Create a beatiful service card with unique time slot
            </p>
          </div>
          <div className={ad.headerActions}>
            <button
              type="button"
              onClick={resetForm}
              className={ad.buttons.reset}
            >
              Reset
            </button>

            <button
              type="submit"
              className={ad.buttons.submit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin">
                    Saving...
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {serviceId ? "Update Service" : "Save Service"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* left side  */}

        <div className={ad.grids.main}>
          <div className="lg:col-span-1 md:col-span-1 col-span-1 flex flex-col items-center ">
            <div className={ad.imageUpload.container(errors.image)}>
              <div className={ad.imageUpload.preview}>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={ad.imageUpload.placeholder}>
                    <ImageIcon className="w-10 h-10 " />
                    <div className="mt-2 text-sm">Service Image (required)</div>
                  </div>
                )}
              </div>

              <div className="w-full flex gap-2 items-center">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileRef}
                  onChange={handleImageChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className={ad.buttons.uploadImage}
                >
                  <Plus className="w-4 h-4 " /> `
                  {imagePreview ? "Replace Image" : "Upload Image"}`
                </button>

                {(imagePreview || hasExistingImage) && (
                  <button
                    type="button"
                    onClick={() => {
                      // If current preview is a blob URL, revoke it
                      if (imagePreview && imagePreview.startsWith("blob:")) {
                        try {
                          URL.revokeObjectURL(imagePreview);
                        } catch (err) {}
                      }
                      setImagePreview(null);
                      setImageFile(null);
                      // mark that user wants to remove the existing image
                      if (hasExistingImage) {
                        setRemoveImage(true);
                        setHasExistingImage(false);
                      }
                      if (fileRef.current) fileRef.current.value = null;
                    }}
                    className={ad.buttons.removeImage}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                )}
              </div>
              {hasExistingImage && (
                <div className="w-full text-xs text-gray-600 mt-2 flex items-center gap-2">
                  <input
                    id="remove-img"
                    type="checkbox"
                    checked={removeImage}
                    onChange={(e) => {
                      setRemoveImage(Boolean(e.target.checked));
                      if (e.target.checked) {
                        setImagePreview(null);
                        setImageFile(null);
                        setHasExistingImage(false);
                      }
                    }}
                    className="rounded"
                  />
                  <label htmlFor="remove-img">Remove existing image</label>
                </div>
              )}
            </div>
          </div>
          {/* right side */}

             <div className="lg:col-span-2 md:col-span-1 col-span-1 space-y-6">
            <div className={ad.grids.formFields}>
              <div>
                <label className={ad.labels.standard}>
                  Service name
                </label>
                <input
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g. General Consultation"
                  className={ad.formFields.input(errors.serviceName)}
                />
              </div>

              <div>
                <label className={ad.labels.standard}>
                  Price
                </label>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="₹ 499"
                  className={ad.formFields.input(errors.price)}
                  inputMode="numeric"
                />

                <div className="mt-3">
                  <label className={ad.labels.standard}>
                    Availability
                  </label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className={ad.formFields.select}
                  >
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className={ad.labels.standard}>
                About this service
              </label>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Short description"
                rows={4}
                className={ad.formFields.textarea(errors.about)}
              />
            </div>

            {/* instructions */}
            <div>
              <div className="flex items-center justify-between">
                <label className={ad.labels.standard}>
                  Instructions (point wise)
                </label>
                <button
                  type="button"
                  onClick={addInstruction}
                  className={ad.buttons.addInstruction}
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              <div
                className={ad.instructions.container(errors.instructions)}
              >
                {instructions.map((ins, idx) => (
                  <div
                    key={idx}
                    className={ad.instructions.item}
                  >
                    <div className={ad.icon.number}>
                      {idx + 1}.
                    </div>
                    <input
                      value={ins}
                      onChange={(e) => updateInstruction(idx, e.target.value)}
                      placeholder={`Instruction ${idx + 1}`}
                      className={ad.instructions.input}
                    />
                    {instructions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInstruction(idx)}
                        className={ad.instructions.removeButton}
                      >
                        <Trash2 className={ad.icon.removeInstruction} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* slot controls */}
            <div
              className={ad.slots.container(errors.slots)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-emerald-700 font-medium">
                  <Calendar className="w-5 h-5" /> Slots & Schedule
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-500">
                    {slots.length} slot{slots.length !== 1 ? "s" : ""} added
                  </div>
                </div>
              </div>

              <div className={ad.grids.timeGrid}>
                <div className="min-w-0">
                  <label className={ad.labels.small}>Day</label>
                  <select
                    value={slotDay}
                    onChange={(e) => setSlotDay(e.target.value)}
                    className={ad.formFields.smallSelect}
                  >
                    {days.map((d) => {
                      const dNum = Number(d);
                      const disabled =
                        Number(slotYear) === currentYear &&
                        Number(slotMonth) === currentMonth &&
                        dNum < currentDate;
                      return (
                        <option key={d} value={d} disabled={disabled}>
                          {d}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="min-w-0">
                  <label className={ad.labels.small}>Month</label>
                  <select
                    value={slotMonth}
                    onChange={(e) => setSlotMonth(e.target.value)}
                    className={ad.formFields.smallSelect}
                  >
                    {months.map((m, idx) => {
                      const disabled =
                        Number(slotYear) === currentYear && idx < currentMonth;
                      return (
                        <option key={m} value={String(idx)} disabled={disabled}>
                          {m}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="min-w-0">
                  <label className={ad.labels.small}>Year</label>
                  <select
                    value={slotYear}
                    onChange={(e) => setSlotYear(e.target.value)}
                    className={ad.formFields.smallSelect}
                  >
                    {years.map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={ad.grids.timeSubGrid}>
                  <div className="min-w-0">
                    <label className={ad.labels.small}>Hour</label>
                    <select
                      value={slotHour}
                      onChange={(e) => setSlotHour(e.target.value)}
                      className={ad.formFields.timeSelect}
                    >
                      {hours.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="min-w-0">
                    <label className={ad.labels.small}>Minute</label>
                    <select
                      value={slotMinute}
                      onChange={(e) => setSlotMinute(e.target.value)}
                      className={ad.formFields.timeSelect}
                    >
                      {minutes.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="min-w-0">
                    <label className={ad.labels.small}>AM/PM</label>
                    <select
                      value={slotAmPm}
                      onChange={(e) => setSlotAmPm(e.target.value)}
                      className={ad.formFields.ampmSelect}
                    >
                      {ampm.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <button
                  type="button"
                  onClick={addSlot}
                  className={ad.buttons.addSlot}
                >
                  <Plus className="w-4 h-4" /> Add This Time Slot
                </button>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-2">
                  Added Slots ({slots.length})
                </div>

                <div className={ad.grids.slotsGrid}>
                  {slots.length === 0 ? (
                    <div className="text-sm text-gray-400 italic px-4 py-2">
                      No slots added yet. Select a time and click "Add This Time Slot"
                    </div>
                  ) : (
                    slots.map((s, idx) => (
                      <div
                        key={s}
                        className={ad.slots.slotItem}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Clock className={ad.icon.clock} />
                          <div className={ad.slots.slotText}>
                            {s}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSlot(idx)}
                          className={ad.buttons.slotRemove}
                        >
                          <Trash2 className={ad.icon.trash} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
      <style>{ad.customCSS}</style>
    </div>
  );
};

export default AddService;
