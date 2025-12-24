import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MagnifyingGlass } from "react-loader-spinner";
import { useCartStore } from "../../stores/useCartStore.js";
import { fetchImagePathFromENV } from "../../api/helpers/fetcheImagesPathFromENV.js";
import Swal from "sweetalert2";
import "../Shop/css/shopCheckout.css";

const ShopCheckOut = () => {
  const navigate = useNavigate();
  const cart = useCartStore((state) => state.cart);
  const getTotalPrice = useCartStore((state) => state.totalPrice);
  const clearCart = useCartStore((state) => state.clearCart);

  const totalPrice = typeof getTotalPrice === "function" ? getTotalPrice() : getTotalPrice || 0;
  const cartItems = cart || [];

  const [loaderStatus, setLoaderStatus] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Address
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    pincode: "",
    
    // Delivery
    deliveryDate: "today",
    deliveryTime: "10am-2pm",
    instructions: "",
    
    // Payment
    paymentMethod: "cod",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCVV: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setTimeout(() => setLoaderStatus(false), 1000);
  }, []);

  useEffect(() => {
    if (cartItems.length === 0 && !loaderStatus) {
      Swal.fire({
        icon: "warning",
        title: "Cart is Empty",
        text: "Please add items to cart before checkout",
        confirmButtonColor: "#0aad0a",
      }).then(() => {
        navigate("/Shop");
      });
    }
  }, [cartItems.length, loaderStatus, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.firstName) newErrors.firstName = "First name is required";
      if (!formData.lastName) newErrors.lastName = "Last name is required";
      if (!formData.email) newErrors.email = "Email is required";
      if (!formData.phone) newErrors.phone = "Phone is required";
      if (!formData.address) newErrors.address = "Address is required";
      if (!formData.city) newErrors.city = "City is required";
      if (!formData.state) newErrors.state = "State is required";
      if (!formData.pincode) newErrors.pincode = "Pincode is required";
    }

    if (step === 3 && formData.paymentMethod === "card") {
      if (!formData.cardNumber) newErrors.cardNumber = "Card number is required";
      if (!formData.cardName) newErrors.cardName = "Name on card is required";
      if (!formData.cardExpiry) newErrors.cardExpiry = "Expiry date is required";
      if (!formData.cardCVV) newErrors.cardCVV = "CVV is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlaceOrder = async () => {
    if (!validateStep(currentStep)) return;

    try {
      const orderData = {
        items: cartItems,
        total: totalPrice,
        ...formData,
      };

      console.log("Order Data:", orderData);

      await Swal.fire({
        icon: "success",
        title: "Order Placed Successfully!",
        text: "Thank you for your order. You will receive a confirmation email shortly.",
        confirmButtonColor: "#0aad0a",
      });

      clearCart();
      navigate("/MyAccountOrder");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Order Failed",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: "#0aad0a",
      });
    }
  };

  const deliveryCharge = totalPrice >= 199 ? 0 : 40;
  const finalTotal = totalPrice + deliveryCharge;

  if (loaderStatus) {
    return (
      <div className="loader-container">
        <MagnifyingGlass
          visible={true}
          height="100"
          width="100"
          ariaLabel="magnifying-glass-loading"
          glassColor="#c0efff"
          color="#0aad0a"
        />
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {/* Header */}
      <section className="checkout-header py-4 bg-light">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-0 h3 fw-bold">Checkout</h1>
              <p className="text-muted mb-0">Complete your order</p>
            </div>
            <Link to="/ShopCart" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-2"></i>Back to Cart
            </Link>
          </div>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="progress-section py-4">
        <div className="container">
          <div className="checkout-progress">
            <div className={`progress-step ${currentStep >= 1 ? "active" : ""} ${currentStep > 1 ? "completed" : ""}`}>
              <div className="step-icon">
                {currentStep > 1 ? <i className="bi bi-check-lg"></i> : "1"}
              </div>
              <div className="step-label">Address</div>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${currentStep >= 2 ? "active" : ""} ${currentStep > 2 ? "completed" : ""}`}>
              <div className="step-icon">
                {currentStep > 2 ? <i className="bi bi-check-lg"></i> : "2"}
              </div>
              <div className="step-label">Delivery</div>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${currentStep >= 3 ? "active" : ""}`}>
              <div className="step-icon">3</div>
              <div className="step-label">Payment</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="checkout-content py-5">
        <div className="container">
          <div className="row g-4">
            {/* Left Column - Forms */}
            <div className="col-lg-8">
              {/* Step 1: Address */}
              {currentStep === 1 && (
                <div className="checkout-card fade-in">
                  <div className="card-header">
                    <i className="bi bi-geo-alt me-2"></i>
                    <h5 className="mb-0">Delivery Address</h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">First Name *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.firstName ? "is-invalid" : ""}`}
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="John"
                        />
                        {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Last Name *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.lastName ? "is-invalid" : ""}`}
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Doe"
                        />
                        {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className={`form-control ${errors.email ? "is-invalid" : ""}`}
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="john.doe@example.com"
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Phone Number *</label>
                        <input
                          type="tel"
                          className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+91 98765 43210"
                        />
                        {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                      </div>
                      <div className="col-12">
                        <label className="form-label">Address *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.address ? "is-invalid" : ""}`}
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="House No., Building Name, Street"
                        />
                        {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                      </div>
                      <div className="col-12">
                        <label className="form-label">Apartment, Suite, etc. (Optional)</label>
                        <input
                          type="text"
                          className="form-control"
                          name="apartment"
                          value={formData.apartment}
                          onChange={handleInputChange}
                          placeholder="Apartment, suite, unit, etc."
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">City *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.city ? "is-invalid" : ""}`}
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Surat"
                        />
                        {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">State *</label>
                        <select
                          className={`form-select ${errors.state ? "is-invalid" : ""}`}
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                        >
                          <option value="">Select State</option>
                          <option value="Gujarat">Gujarat</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Delhi">Delhi</option>
                        </select>
                        {errors.state && <div className="invalid-feedback">{errors.state}</div>}
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Pincode *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.pincode ? "is-invalid" : ""}`}
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          placeholder="395001"
                        />
                        {errors.pincode && <div className="invalid-feedback">{errors.pincode}</div>}
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <button className="btn btn-primary w-100" onClick={handleNext}>
                      Continue to Delivery
                      <i className="bi bi-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Delivery */}
              {currentStep === 2 && (
                <div className="checkout-card fade-in">
                  <div className="card-header">
                    <i className="bi bi-truck me-2"></i>
                    <h5 className="mb-0">Delivery Options</h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-4">
                      <h6 className="mb-3">Select Delivery Date</h6>
                      <div className="delivery-options">
                        {[
                          { value: "today", label: "Today", subtitle: "Dec 21" },
                          { value: "tomorrow", label: "Tomorrow", subtitle: "Dec 22" },
                          { value: "dayafter", label: "Day After", subtitle: "Dec 23" },
                        ].map((option) => (
                          <label key={option.value} className="delivery-option">
                            <input
                              type="radio"
                              name="deliveryDate"
                              value={option.value}
                              checked={formData.deliveryDate === option.value}
                              onChange={handleInputChange}
                            />
                            <div className="option-content">
                              <div className="option-label">{option.label}</div>
                              <div className="option-subtitle">{option.subtitle}</div>
                            </div>
                            <i className="bi bi-check-circle-fill"></i>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h6 className="mb-3">Select Time Slot</h6>
                      <div className="time-slots">
                        {[
                          { value: "10am-2pm", label: "10 AM - 2 PM", badge: "Free", badgeClass: "success" },
                          { value: "2pm-6pm", label: "2 PM - 6 PM", badge: "₹20", badgeClass: "warning" },
                          { value: "6pm-10pm", label: "6 PM - 10 PM", badge: "₹40", badgeClass: "warning" },
                        ].map((slot) => (
                          <label key={slot.value} className="time-slot">
                            <input
                              type="radio"
                              name="deliveryTime"
                              value={slot.value}
                              checked={formData.deliveryTime === slot.value}
                              onChange={handleInputChange}
                            />
                            <div className="slot-content">
                              <span className="slot-label">{slot.label}</span>
                              <span className={`badge bg-${slot.badgeClass}`}>{slot.badge}</span>
                            </div>
                            <i className="bi bi-check-circle-fill"></i>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Delivery Instructions (Optional)</label>
                      <textarea
                        className="form-control"
                        name="instructions"
                        value={formData.instructions}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Any specific instructions for delivery..."
                      ></textarea>
                    </div>
                  </div>
                  <div className="card-footer d-flex gap-2">
                    <button className="btn btn-outline-secondary flex-fill" onClick={handlePrev}>
                      <i className="bi bi-arrow-left me-2"></i>Back
                    </button>
                    <button className="btn btn-primary flex-fill" onClick={handleNext}>
                      Continue to Payment
                      <i className="bi bi-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <div className="checkout-card fade-in">
                  <div className="card-header">
                    <i className="bi bi-credit-card me-2"></i>
                    <h5 className="mb-0">Payment Method</h5>
                  </div>
                  <div className="card-body">
                    <div className="payment-methods">
                      {/* Cash on Delivery */}
                      <label className="payment-method">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={formData.paymentMethod === "cod"}
                          onChange={handleInputChange}
                        />
                        <div className="method-content">
                          <div className="method-icon">
                            <i className="bi bi-cash-coin"></i>
                          </div>
                          <div className="method-details">
                            <div className="method-name">Cash on Delivery</div>
                            <div className="method-desc">Pay when you receive</div>
                          </div>
                        </div>
                        <i className="bi bi-check-circle-fill"></i>
                      </label>

                      {/* Online Payment */}
                      <label className="payment-method">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="online"
                          checked={formData.paymentMethod === "online"}
                          onChange={handleInputChange}
                        />
                        <div className="method-content">
                          <div className="method-icon">
                            <i className="bi bi-wallet2"></i>
                          </div>
                          <div className="method-details">
                            <div className="method-name">UPI / Net Banking</div>
                            <div className="method-desc">Pay securely online</div>
                          </div>
                        </div>
                        <i className="bi bi-check-circle-fill"></i>
                      </label>

                      {/* Card Payment */}
                      <label className="payment-method">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={formData.paymentMethod === "card"}
                          onChange={handleInputChange}
                        />
                        <div className="method-content">
                          <div className="method-icon">
                            <i className="bi bi-credit-card-2-front"></i>
                          </div>
                          <div className="method-details">
                            <div className="method-name">Credit / Debit Card</div>
                            <div className="method-desc">Visa, Mastercard, Rupay</div>
                          </div>
                        </div>
                        <i className="bi bi-check-circle-fill"></i>
                      </label>
                    </div>

                    {/* Card Details Form */}
                    {formData.paymentMethod === "card" && (
                      <div className="card-form mt-4 p-4 border rounded">
                        <div className="row g-3">
                          <div className="col-12">
                            <label className="form-label">Card Number *</label>
                            <input
                              type="text"
                              className={`form-control ${errors.cardNumber ? "is-invalid" : ""}`}
                              name="cardNumber"
                              value={formData.cardNumber}
                              onChange={handleInputChange}
                              placeholder="1234 5678 9012 3456"
                              maxLength="19"
                            />
                            {errors.cardNumber && <div className="invalid-feedback">{errors.cardNumber}</div>}
                          </div>
                          <div className="col-12">
                            <label className="form-label">Name on Card *</label>
                            <input
                              type="text"
                              className={`form-control ${errors.cardName ? "is-invalid" : ""}`}
                              name="cardName"
                              value={formData.cardName}
                              onChange={handleInputChange}
                              placeholder="John Doe"
                            />
                            {errors.cardName && <div className="invalid-feedback">{errors.cardName}</div>}
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Expiry Date *</label>
                            <input
                              type="text"
                              className={`form-control ${errors.cardExpiry ? "is-invalid" : ""}`}
                              name="cardExpiry"
                              value={formData.cardExpiry}
                              onChange={handleInputChange}
                              placeholder="MM/YY"
                              maxLength="5"
                            />
                            {errors.cardExpiry && <div className="invalid-feedback">{errors.cardExpiry}</div>}
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">CVV *</label>
                            <input
                              type="text"
                              className={`form-control ${errors.cardCVV ? "is-invalid" : ""}`}
                              name="cardCVV"
                              value={formData.cardCVV}
                              onChange={handleInputChange}
                              placeholder="123"
                              maxLength="3"
                            />
                            {errors.cardCVV && <div className="invalid-feedback">{errors.cardCVV}</div>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="card-footer d-flex gap-2">
                    <button className="btn btn-outline-secondary flex-fill" onClick={handlePrev}>
                      <i className="bi bi-arrow-left me-2"></i>Back
                    </button>
                    <button className="btn btn-success flex-fill" onClick={handlePlaceOrder}>
                      <i className="bi bi-check-circle me-2"></i>
                      Place Order ₹{finalTotal.toFixed(2)}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Order Summary */}
            <div className="col-lg-4">
              <div className="order-summary sticky-top">
                <div className="card-header">
                  <h5 className="mb-0">Order Summary</h5>
                </div>
                <div className="card-body">
                  <div className="summary-items">
                    {cartItems.slice(0, 3).map((item) => {
                      const itemId = item.product_id || item.id;
                      const itemQty = item.qty || item.quantity || 1;
                      const itemPrice = Number(item.final_price || item.price || 0);

                      return (
                        <div key={itemId} className="summary-item">
                          <img
                            src={
                              item.product?.images?.[0]
                                ? fetchImagePathFromENV() + item.product.images[0]
                                : item.images?.[0]
                                ? fetchImagePathFromENV() + item.images[0]
                                : "https://via.placeholder.com/60x60"
                            }
                            alt={item.product?.name || item.name}
                          />
                          <div className="item-details">
                            <div className="item-name">{item.product?.name || item.name}</div>
                            <div className="item-qty">Qty: {itemQty}</div>
                          </div>
                          <div className="item-price">₹{(itemPrice * itemQty).toFixed(2)}</div>
                        </div>
                      );
                    })}
                    {cartItems.length > 3 && (
                      <div className="text-center text-muted small">
                        + {cartItems.length - 3} more items
                      </div>
                    )}
                  </div>

                  <div className="summary-divider"></div>

                  <div className="summary-row">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Delivery Charges</span>
                    <span className={deliveryCharge === 0 ? "text-success" : ""}>
                      {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                    </span>
                  </div>

                  {totalPrice < 199 && (
                    <div className="free-delivery-bar">
                      <div className="bar-text">
                        <i className="bi bi-truck"></i>
                        Add ₹{(199 - totalPrice).toFixed(2)} more for FREE delivery
                      </div>
                      <div className="progress mt-2">
                        <div
                          className="progress-bar bg-success"
                          style={{ width: `${(totalPrice / 199) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="summary-divider"></div>

                  <div className="summary-total">
                    <span>Total Amount</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="card-footer">
                  <div className="secure-badge">
                    <i className="bi bi-shield-check text-success me-2"></i>
                    <span>100% Secure Payments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShopCheckOut;