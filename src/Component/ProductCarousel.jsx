import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useWishlistStore } from "../stores/useWishListStore.js";
import { useCartStore } from "../stores/useCartStore.js";
import { fetchProducts, fetchProductsByCategorySlug } from "../api/helpers/fetchProducts.js";
import ProductSkeleton from "../components/skeletons/productSkeleton.jsx";
import { fetchImagePathFromENV } from "../api/helpers/fetcheImagesPathFromENV.js";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./css/ProductCarousel.css";
import QuickViewModal from "./QuickViewModal.jsx";

const ProductCarousel = ({ 
  title = "Popular Products", 
  categoryId = null, 
  categorySlug = null, 
  limit = 10 
}) => {
  const addToWishlist = useWishlistStore((state) => state.addToWishlist);
  const addToCart = useCartStore((state) => state.addToCart);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inView, setInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [quickViewModal, setQuickViewModal] = useState({ show: false, productId: null });
  const containerRef = useRef(null);

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1200,
        settings: { slidesToShow: 3, slidesToScroll: 1 },
      },
      {
        breakpoint: 992,
        settings: { slidesToShow: 2, slidesToScroll: 1 },
      },
      {
        breakpoint: 576,
        settings: { slidesToShow: 1, slidesToScroll: 1 },
      },
    ],
    autoplay: true,
    autoplaySpeed: 3000,
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setInView(true);
        }
      },
      { root: null, rootMargin: "50px", threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [hasLoaded]);

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      if (!inView || hasLoaded) return;

      try {
        setLoading(true);
        let productData;

    
        if (categorySlug) {
          console.log("Fetching by category slug:", categorySlug);
          productData = await fetchProductsByCategorySlug(categorySlug);
        } else if (categoryId) {
          console.log("Fetching by category ID:", categoryId);
          const params = { category_id: categoryId, limit: limit };
          productData = await fetchProducts(params);
        } else {
          console.log("Fetching all products with limit:", limit);
          const params = { limit: limit };
          productData = await fetchProducts(params);
        }

        console.log("Loaded products:", productData);

        // Handle different response structures
        if (Array.isArray(productData)) {
          setProducts(productData);
        } else if (productData?.data) {
          setProducts(Array.isArray(productData.data) ? productData.data : []);
        } else {
          setProducts([]);
        }

        setHasLoaded(true);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products");
        // Don't show alert for every error
        if (!error.message?.includes("Network")) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to load products. Please try again.",
            showConfirmButton: true,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [inView, categoryId, categorySlug, limit, hasLoaded]);

  const handleAddToCart = (product) => {
    addToCart(product);
    Swal.fire({
      icon: "success",
      title: "Added to Cart",
      text: `${product.name} has been added to your cart!`,
      showConfirmButton: false,
      timer: 900,
    });
  };

  const handleAddToWishlist = (product) => {
    addToWishlist(product);
    Swal.fire({
      icon: "success",
      title: "Added to Wishlist",
      text: `${product.name} has been added to your wishlist!`,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const handleQuickView = (productId) => {
    setQuickViewModal({ show: true, productId });
  };

  const handleCloseQuickView = () => {
    setQuickViewModal({ show: false, productId: null });
  };

  const getDiscountPercentage = (price, oldPrice) => {
    if (!oldPrice || oldPrice <= price) return null;
    const discount = ((oldPrice - price) / oldPrice) * 100;
    return Math.round(discount);
  };

  const getCategoryName = (categories) => {
    if (categories && categories.length > 0) {
      return categories[0].name;
    }
    return "Uncategorized";
  };

  // Loading state
  if (loading && !hasLoaded) {
    return (
      <div className="container" ref={containerRef}>
        <div className="row">
          <div className="col-12 mb-4">
            <div className="section-head text-center">
              <h3 className="h3style">{title}</h3>
              <div className="wt-separator bg-primarys"></div>
              <div className="wt-separator2 bg-primarys"></div>
            </div>
          </div>
        </div>
        <div className="row">
          {[...Array(4)].map((_, index) => (
            <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4" key={index}>
              <ProductSkeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container" ref={containerRef}>
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  // No products state
  if (!products || products.length === 0) {
    return (
      <div className="container" ref={containerRef}>
        <div className="section-head text-center mb-4">
          <h3 className="h3style">{title}</h3>
          <div className="wt-separator bg-primarys"></div>
          <div className="wt-separator2 bg-primarys"></div>
        </div>
        <div className="text-center py-5">
          <h4>No products available</h4>
          <p>Check back later for new products!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="my-lg-14 my-8" ref={containerRef}>
        <div className="container">
          <div className="row">
            <div className="col-12 mb-6">
              <div className="section-head text-center">
                <h3 className="h3style">{title}</h3>
                <div className="wt-separator bg-primarys"></div>
                <div className="wt-separator2 bg-primarys"></div>
              </div>
            </div>
          </div>

          <Slider {...settings}>
            {products.map((product) => {
              const discountPercent = getDiscountPercentage(
                parseFloat(product.price),
                parseFloat(product.old_price)
              );

              return (
                <div className="px-2" key={product.id}>
                  <div className="card card-product h-100">
                    <div className="card-body p-3">
                      <div className="position-relative image-container">
                        {/* Discount Badge */}
                        {discountPercent && (
                          <div className="position-absolute start-0 top-50 translate-middle-y z-3">
                            <span className="badge bg-danger fs-6">
                              {discountPercent}% OFF
                            </span>
                          </div>
                        )}

                        {/* Featured Badge */}
                        {product.featured && (
                          <div className="position-absolute top-0 end-0 z-3">
                            <span className="badge bg-warning">Featured</span>
                          </div>
                        )}

                        {/* Product Image */}
                        <Link to={`/single-product/${product.id}`}>
                          <div className="product-image-wrapper">
                            <img
                              src={
                                product.images && product.images.length > 0
                                  ? fetchImagePathFromENV() + product.images[0]
                                  : "https://via.placeholder.com/300x300?text=Product+Image"
                              }
                              alt={product.name}
                              className="product-image img-fluid"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/300x300?text=Product+Image";
                              }}
                            />
                          </div>
                        </Link>

                        {/* Quick View Button */}
                        <button
                          className="btn-quick-view position-absolute z-3"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleQuickView(product.id);
                          }}
                          title="Quick View"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                      </div>

                      {/* Product Details */}
                      <div className="text-small mb-1 mt-3">
                        <Link to="#" className="text-decoration-none text-muted">
                          <small>{getCategoryName(product.categories)}</small>
                        </Link>
                      </div>

                      <h2 className="fs-6 product-name mb-2">
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

                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <span className="text-dark fs-5 fw-bold">
                            ₹{parseFloat(product.price).toFixed(2)}
                          </span>
                          {product.old_price &&
                            parseFloat(product.old_price) >
                              parseFloat(product.price) && (
                              <span className="text-decoration-line-through text-muted ms-2 fs-6">
                                ₹{parseFloat(product.old_price).toFixed(2)}
                              </span>
                            )}
                        </div>
                        <button
                          className="btn btn-primary btn-sm px-3"
                          onClick={() => handleAddToCart(product)}
                          disabled={product.qty <= 0}
                        >
                          <i className="bi bi-cart-plus me-1"></i>Add
                        </button>
                      </div>

                      {/* Stock Status */}
                      <div className="mb-2">
                        {product.qty > 0 ? (
                          <small className="text-success">
                            <i className="bi bi-check-circle-fill me-1"></i>In
                            Stock
                          </small>
                        ) : (
                          <small className="text-danger">
                            <i className="bi bi-x-circle-fill me-1"></i>Out of
                            Stock
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </Slider>
        </div>
      </section>

      {/* QuickViewModal */}
      {quickViewModal.show && (
        <QuickViewModal
          show={quickViewModal.show}
          handleClose={handleCloseQuickView}
          productId={quickViewModal.productId}
        />
      )}
    </>
  );
};

export default ProductCarousel;
