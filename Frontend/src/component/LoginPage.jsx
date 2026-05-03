import React, { useState } from "react";
import { loginPageStyles as l, toastStyles } from "../assets/dummyStyles";
import logo from "../assets/logo.png";
import { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";

const STORAGE_KEY = "doctorToken_v1";

const LoginPage = () => {
  const API_BASE = "http://localhost:4000";
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({
      ...s,
      [name]: value,
    }));
  };

  // to login

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("All feilds are reqired", {
        style: toastStyles.errorToast,
      });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/doctors/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(json?.message || "Login failed", { duration: 4000 });
        setBusy(false);
        return;
      }
      const token = json?.token || json?.data?.token;
      if (!token) {
        toast.error("Authentication token missing");
        setBusy(false);
        return;
      }

      const doctorId =
        json?.data?._id || json?.doctor?._id || json?.data?.doctor?._id;
      if (!doctorId) {
        toast.error("Doctor ID missing from server response");
        setBusy(false);
        return;
      }

      localStorage.setItem(STORAGE_KEY, token);
      window.dispatchEvent(
        new StorageEvent("storage", { key: STORAGE_KEY, newValue: token }),
      );
      toast.success("Login successful — redirecting...", {
        style: toastStyles.successToast,
      });
      setTimeout(() => {
        navigate(`/doctor-admin/${doctorId}`);
      }, 700);
    } catch (err) {
      console.error("login error", err);
      toast.error("Network error during login");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={l.mainContainer}>
      <Toaster position="top-right" reverseOrder={false} />

      <button onClick={() => navigate("/")} className={l.backButton}>
        <ArrowLeft className={l.backButtonIcon} />
        Back To Home
      </button>
      <div className={l.loginCard}>
        <div className={l.logoContainer}>
          <img src={logo} alt="logo" className={l.logo} />
        </div>
        <h2 className={l.title}>Doctor Admin </h2>
        <p className={l.subtitle}>Sign in to manage your profile and shedule</p>

        <form onSubmit={handleLogin} className={l.form}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className={l.input}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
            className={l.input}
            required
          />

          <button type="submit" disabled={busy} className={l.submitButton}>
            {busy ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
