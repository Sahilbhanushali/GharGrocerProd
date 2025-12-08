import React from "react";

import "./css/cartSkelton.css";

const CartSkeleton = () => {
  return (
    <div className="container my-8">
      <div className="mb-4">
        <div className="skeleton skeleton-title mb-2" style={{ width: "140px" }} />
        <div className="skeleton skeleton-text" style={{ width: "120px" }} />
      </div>

      {[...Array(3)].map((_, idx) => (
        <div className="card mb-3" key={idx}>
          <div className="card-body py-3">
            <div className="row align-items-center">
              <div className="col-3 col-md-2">
                <div className="skeleton" style={{ width: "80px", height: "80px", borderRadius: "8px" }} />
              </div>
              <div className="col-5 col-md-6">
                <div className="skeleton skeleton-text mb-2" style={{ width: "70%" }} />
                <div className="skeleton skeleton-text" style={{ width: "40%" }} />
              </div>
              <div className="col-4 col-md-4 text-end">
                <div className="skeleton skeleton-text mb-2" style={{ width: "60px", marginLeft: "auto" }} />
                <div className="skeleton skeleton-pill" style={{ width: "100px", marginLeft: "auto" }} />
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="card mt-4">
        <div className="card-body">
          <div className="skeleton skeleton-text mb-2" style={{ width: "40%" }} />
          <div className="skeleton skeleton-text mb-2" style={{ width: "60%" }} />
          <div className="skeleton skeleton-pill" style={{ width: "100%", height: "44px" }} />
        </div>
      </div>
    </div>
  );
};

export default CartSkeleton;
