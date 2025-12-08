// src/pages/CompleteProfile.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore.js";
import { axiosInstance } from "../lib/axios.js"; 

const CompleteProfile = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [birthday, setBirthday] = useState(user?.birthday || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !gender || !birthday) {
      setError("Please fill all fields.");
      return;
    }

    try {
      setSaving(true);

      const res = await axiosInstance.post(
        "/customer/update_profile",
        { name, email, gender, birthday },
        { useLocalToken: true }
      );

      // Adjust to your backend shape; fallback to local values
      const apiCustomer =
        res.data?.data?.customer || res.data?.customer || null;

      const updatedCustomer = apiCustomer || {
        ...(user || {}),
        name,
        email,
        gender,
        birthday,
      };

      updateUser(updatedCustomer);
      navigate("/cart");
    } catch (err) {
      console.error("Profile update failed:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="my-lg-14 my-8">
      <div className="container">
        <h2 className="mb-4">Complete your profile</h2>

        {error && (
          <div className="alert alert-danger py-2" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-12">
            <label className="form-label">Full Name</label>
            <input
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label">Gender</label>
            <select
              className="form-select"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="col-12">
            <label className="form-label">Birthday</label>
            <input
              type="date"
              className="form-control"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              required
            />
          </div>

          <div className="col-12 d-grid">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save & Go to Cart"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CompleteProfile;
