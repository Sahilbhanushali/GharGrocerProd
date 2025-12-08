// src/pages/MyAccountSignIn.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import signinimage from "../../images/signin-g.svg";
import ScrollToTop from "../ScrollToTop";
import { useAuthStore } from "../../stores/useAuthStore.js";
import { authApi } from "../../api/auth/auth.api.js";

const MyAccountSignIn = () => {

  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [step, setStep] = useState("phone"); // "phone" | "otp"
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    const trimmed = mobile.trim();
    if (!/^\d{10}$/.test(trimmed)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setSending(true);
      // use your authApi wrapper
      const res = await authApi.otpSend({ phone: trimmed });
      console.log("OTP send response:", res.data);
      setStep("otp");
    } catch (err) {
      console.error("Send OTP failed:", err);
      setError("Failed to send OTP. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    try {
      setVerifying(true);
      const res = await authApi.otpVerify({
        phone: mobile.trim(),
        otp: otp.trim(),
      });
      console.log("OTP verify response:", res.data);

       const { success, data } = res.data || {};
      if (!success || !data?.token || !data?.customer) {
        setError("Invalid response from server.");
        return;
      }

       const { token, customer } = data;

      login(token, customer || null);
      
       const isProfileIncomplete =
        !customer.name || !customer.email || !customer.gender || !customer.birthday;

      if (isProfileIncomplete) {
        navigate("/complete-profile");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Verify OTP failed:", err);
      setError("Invalid OTP. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div>
      <ScrollToTop />
      <section className="my-lg-14 my-8">
        <div className="container">
          <div className="row justify-content-center align-items-center">
            {/* Illustration */}
            <div className="col-12 col-md-6 col-lg-4 order-lg-1 order-2">
              <img src={signinimage} alt="Ghar Grocer" className="img-fluid" />
            </div>

            {/* Form */}
            <div className="col-12 col-md-6 offset-lg-1 col-lg-4 order-lg-2 order-1">
              <div className="mb-lg-9 mb-5">
                <h1 className="mb-1 h2 fw-bold">Login to Ghar Grocer</h1>
                <p>Enter your mobile number to receive a one-time password (OTP).</p>
              </div>

              {error && (
                <div className="alert alert-danger py-2" role="alert">
                  {error}
                </div>
              )}

              {step === "phone" && (
                <form onSubmit={handleSendOtp}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label htmlFor="mobile" className="form-label">
                        Mobile Number
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">+91</span>
                        <input
                          type="tel"
                          className="form-control"
                          id="mobile"
                          placeholder="Enter 10-digit mobile number"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          maxLength={10}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12 d-grid">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={sending}
                      >
                        {sending ? "Sending OTP..." : "Send OTP"}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {step === "otp" && (
                <form onSubmit={handleVerifyOtp}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Mobile Number</label>
                      <div className="form-control-plaintext fw-semibold">
                        +91 {mobile}
                      </div>
                    </div>

                    <div className="col-12">
                      <label htmlFor="otp" className="form-label">
                        Enter OTP
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="otp"
                        placeholder="Enter the OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        required
                      />
                    </div>

                    <div className="col-12 d-grid">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={verifying}
                      >
                        {verifying ? "Verifying..." : "Verify & Login"}
                      </button>
                    </div>

                    <div className="col-12 d-flex justify-content-between">
                      <button
                        type="button"
                        className="btn btn-link p-0"
                        onClick={handleSendOtp}
                        disabled={sending}
                      >
                        Resend OTP
                      </button>
                      <button
                        type="button"
                        className="btn btn-link p-0"
                        onClick={() => setStep("phone")}
                      >
                        Change number
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MyAccountSignIn;
