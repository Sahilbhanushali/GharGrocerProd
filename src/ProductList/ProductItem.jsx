import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useWishlistStore } from "../stores/useWishListStore.js";
import { useCartStore } from "../stores/useCartStore.js";
import { fetchProducts } from "../api/helpers/fetchProducts.js";
import ProductSkeleton from "../components/skeletons/productSkeleton.jsx";
import {fetchImagePathFromENV} from "../api/helpers/fetcheImagesPathFromENV.js";

const ProductItem = () => {
  const addToWishlist = useWishlistStore((state) => state.addToWishlist);
  const addToCart = useCartStore((state) => state.addToCart);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productData = await fetchProducts();
        // Assuming fetchProducts returns the full API response
        // If it returns just the data array, adjust accordingly
        if (productData.success && productData.data.data) {
          setProducts(productData.data.data);
        } else {
          setProducts(productData.data || productData);
        }
      } catch (error) {
        setError("Error in fetching products: " + error.message);
        console.error("Error fetching products:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load products. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    Swal.fire({
      icon: 'success',
      title: 'Added to Cart',
      text: `${product.name} has been added to your cart!`,
      showConfirmButton: true,
      timer: 3000,
    });
  };

  const handleAddToWishlist = (product) => {
    addToWishlist(product);
    Swal.fire({
      icon: 'success',
      title: 'Added to Wishlist',
      text: `${product.name} has been added to your wishlist!`,
      showConfirmButton: true,
      timer: 3000,
    });
  };

  const getDiscountPercentage = (price, oldPrice) => {
    if (!oldPrice || oldPrice <= price) return null;
    const discount = ((oldPrice - price) / oldPrice) * 100;
    return Math.round(discount);
  };

  const getProductImage = (images) => {
    if (images && images.length > 0) {
      // Assuming images are stored with full URLs or relative paths
      // Adjust the base URL as needed for your application
      const baseUrl = "https://dashboard.ghargrocer.com/";
      return baseUrl + images[0];
    }
    // Return a placeholder image if no image is available
    return "https://via.placeholder.com/300x300?text=No+Image";
  };

  const getCategoryName = (categories) => {
    if (categories && categories.length > 0) {
      return categories[0].name;
    }
    return "Uncategorized";
  };

  // Render loading skeletons
  if (loading) {
    return (
      <div className="container">
        <div className="row">
          <div className="col-12 mb-6">
            <div className="section-head text-center mt-8">
              <h3 className='h3style' data-title="Popular Products">Popular Products</h3>
              <div className="wt-separator bg-primarys"></div>
              <div className="wt-separator2 bg-primarys"></div>
            </div>
          </div>
        </div>
        <div className="row g-4 row-cols-lg-5 row-cols-2 row-cols-md-3">
          {[...Array(10)].map((_, index) => (
            <div className="col fade-zoom" key={index}>
              <ProductSkeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render error message
  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  // Render no products message
  if (!products || products.length === 0) {
    return (
      <div className="container">
        <div className="text-center py-5">
          <h4>No products available</h4>
          <p>Check back later for new products!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Popular Products Start*/}
      <section className="my-lg-14 my-8">
        <div className="container">
          <div className="row">
            <div className="col-12 mb-6">
              <div className="section-head text-center mt-8">
                <h3 className='h3style' data-title="Popular Products">Popular Products</h3>
                <div className="wt-separator bg-primarys"></div>
                <div className="wt-separator2 bg-primarys"></div>
              </div>
            </div>
          </div>
          <div className="row g-4 row-cols-lg-5 row-cols-2 row-cols-md-3">
            {products.map((product) => {
              const discountPercent = getDiscountPercentage(
                parseFloat(product.price),
                parseFloat(product.old_price)
              );

              return (
                <div className="col fade-zoom" key={product.id}>
                  <div className="card card-product">
                    <div className="card-body">
                      <div className="text-center position-relative">
                        {/* Discount/Sale Badge */}
                        {discountPercent && (
                          <div className="position-absolute top-0 start-0">
                            <span className="badge bg-danger">
                              {discountPercent}% OFF
                            </span>
                          </div>
                        )}
                        
                        {/* Featured Badge */}
                        {product.featured && (
                          <div className="position-absolute top-0 end-0">
                            <span className="badge bg-warning">Featured</span>
                          </div>
                        )}

                        {/* Product Image */}
                        <Link to={`/product/${product.slug}`}>
                          <img
                            src={fetchImagePathFromENV() + product.images[0]}
                            alt={product.name}
                            className="mb-3 img-fluid"
                            style={{ height: '200px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/300x300?text=Product+Image";
                            }}
                          />
                        </Link>

                        {/* Product Actions */}
                        <div className="card-product-action">
                          <Link
                            to={`/product/${product.slug}`}
                            className="btn-action"
                            title="Quick View"
                          >
                            <i className="bi bi-eye" />
                          </Link>
                          <Link
                            to="#"
                            className="btn-action"
                            title="Wishlist"
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddToWishlist(product);
                            }}
                          >
                            <i className="bi bi-heart" />
                          </Link>
                          <Link
                            to="#"
                            className="btn-action"
                            title="Compare"
                            onClick={(e) => e.preventDefault()}
                          >
                            <i className="bi bi-arrow-left-right" />
                          </Link>
                        </div>
                      </div>

                      {/* Product Category */}
                      <div className="text-small mb-1">
                        <Link to="#" className="text-decoration-none text-muted">
                          <small>{getCategoryName(product.categories)}</small>
                        </Link>
                      </div>

                      {/* Product Name */}
                      <h2 className="fs-6">
                        <Link
                          to={`/product/${product.slug}`}
                          className="text-inherit text-decoration-none"
                          title={product.name}
                        >
                          {product.name.length > 50 
                            ? `${product.name.substring(0, 50)}...` 
                            : product.name}
                        </Link>
                      </h2>

                      {/* Product Rating - Using placeholder since API doesn't provide ratings */}
                      <div className="text-warning mb-2">
                        <small>
                          <i className="bi bi-star-fill" />
                          <i className="bi bi-star-fill" />
                          <i className="bi bi-star-fill" />
                          <i className="bi bi-star-fill" />
                          <i className="bi bi-star-half" />
                        </small>
                        <span className="text-muted small ms-1">4.5(149)</span>
                      </div>

                      {/* Product Price and Add to Cart Button */}
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <div>
                          <span className="text-dark fs-5 fw-bold">
                            ₹{parseFloat(product.price).toFixed(2)}
                          </span>
                          {product.old_price && parseFloat(product.old_price) > parseFloat(product.price) && (
                            <span className="text-decoration-line-through text-muted ms-2">
                              ₹{parseFloat(product.old_price).toFixed(2)}
                            </span>
                          )}
                        </div>
                        <div>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleAddToCart(product)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={16}
                              height={16}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="feather feather-plus"
                            >
                              <line x1={12} y1={5} x2={12} y2={19} />
                              <line x1={5} y1={12} x2={19} y2={12} />
                            </svg>{" "}
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Stock Status */}
                      <div className="mt-2">
                        {product.qty > 0 ? (
                          <small className="text-success">
                            <i className="bi bi-check-circle-fill me-1"></i>
                            In Stock 
                          </small>
                        ) : (
                          <small className="text-danger">
                            <i className="bi bi-x-circle-fill me-1"></i>
                            Out of Stock
                          </small>
                        )}
                      </div>

                      {/* Backorder Notice */}
                      {product.backorder && product.qty <= 0 && (
                        <div className="mt-1">
                          <small className="text-info">
                            <i className="bi bi-info-circle-fill me-1"></i>
                            Available for backorder
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* Popular Products End*/}
    </div>
  );
};

export default ProductItem;