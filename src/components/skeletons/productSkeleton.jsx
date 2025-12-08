import React from "react";
import "./css/productSkeleton.css";

const ProductSkeleton = () => {
  return (
    <div className="product-skeleton">
      <div className="skeleton skeleton-img"></div>
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-price"></div>
      <div className="skeleton skeleton-btn"></div>
    </div>
  );
};

export default ProductSkeleton;
