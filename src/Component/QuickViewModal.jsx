import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { fetchProductById } from "../api/helpers/fetchProducts.js"; // Changed import
import { fetchImagePathFromENV } from "../api/helpers/fetcheImagesPathFromENV.js";
import { useCartStore } from "../stores/useCartStore.js";
import { useWishlistStore } from "../stores/useWishListStore.js";
import Swal from "sweetalert2";

const QuickViewModal = ({ show, handleClose, productId }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  const addToCart = useCartStore((state) => state.addToCart);
  const addToWishlist = useWishlistStore((state) => state.addToWishlist);

  useEffect(() => {
    if (show && productId) {
      loadProduct();
    }
  }, [show, productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      // Use fetchProductBySlug instead of fetchProducts
      const productData = await fetchProductById(productId);
      setProduct(productData);
    } catch (error) {
      console.error("Error loading product:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load product details.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!show) {
      setProduct(null);
      setQuantity(1);
      setSelectedImage(0);
    }
  }, [show]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({ 
        ...product, 
        quantity 
      });
      Swal.fire({
        icon: 'success',
        title: 'Added to Cart',
        text: `${product.name} has been added to your cart!`,
        showConfirmButton: false,
        timer: 2000,
      });
      handleClose();
    }
  };

  const handleAddToWishlist = () => {
    if (product) {
      addToWishlist(product);
      Swal.fire({
        icon: 'success',
        title: 'Added to Wishlist',
        text: `${product.name} has been added to your wishlist!`,
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  const handleQuantityChange = (type) => {
    if (type === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // If product is not loaded and not loading, don't show modal content
  if (!product && !loading) {
    return (
      <Modal show={show} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Product Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center py-5">
            <p>Product not found</p>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Product Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading product details...</p>
          </div>
        ) : product ? (
          <div className="row">
            <div className="col-md-6">
              {/* Main Image */}
              <div className="mb-3">
                <img
                  src={product.images && product.images.length > 0
                    ? fetchImagePathFromENV() + product.images[selectedImage]
                    : "https://via.placeholder.com/400x400?text=Product+Image"
                  }
                  alt={product.name}
                  className="img-fluid rounded"
                  style={{ height: '300px', width: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="d-flex gap-2 mt-3 flex-wrap">
                  {product.images.map((img, index) => (
                    <img
                      key={index}
                      src={fetchImagePathFromENV() + img}
                      alt={`${product.name} ${index + 1}`}
                      className={`img-thumbnail ${selectedImage === index ? 'border-primary border-2' : 'border-light'}`}
                      style={{ 
                        width: '60px', 
                        height: '60px', 
                        objectFit: 'cover', 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => setSelectedImage(index)}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <h3 className="mb-3">{product.name}</h3>
              
              {/* Price */}
              <div className="mb-4">
                <h4 className="text-primary fw-bold mb-2">
                  ₹{parseFloat(product.price).toFixed(2)}
                </h4>
                {product.old_price && parseFloat(product.old_price) > parseFloat(product.price) && (
                  <div className="d-flex align-items-center">
                    <span className="text-decoration-line-through text-muted me-2">
                      ₹{parseFloat(product.old_price).toFixed(2)}
                    </span>
                    <span className="badge bg-danger">
                      Save ₹{(parseFloat(product.old_price) - parseFloat(product.price)).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-4">
  <h6 className="fw-bold">Description:</h6>
  {product.description ? (
    <div
      className="text-muted"
    //   style={{ lineHeight: "1.6" }}
      dangerouslySetInnerHTML={{ __html: product.description }}
    />
  ) : (
    <p className="text-muted" style={{ lineHeight: "1.6" }}>
      No description available.
    </p>
  )}
</div>


              {/* Category */}
              {product.categories && product.categories.length > 0 && (
                <div className="mb-4">
                  <h6 className="fw-bold">Category:</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {product.categories.map((category, index) => (
                      <span key={index} className="badge bg-secondary me-1">
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div className="mb-4">
                <h6 className="fw-bold">Availability:</h6>
                {product.qty > 0 ? (
                  <span className="text-success d-flex align-items-center">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    <span>In Stock </span>
                  </span>
                ) : (
                  <span className="text-danger d-flex align-items-center">
                    <i className="bi bi-x-circle-fill me-2"></i>
                    <span>Out of Stock</span>
                  </span>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="mb-5">
                <h6 className="fw-bold mb-3">Quantity:</h6>
                <div className="d-flex align-items-center" style={{ maxWidth: '150px' }}>
                  <button
                    className="btn btn-outline-secondary rounded-circle"
                    style={{ width: '40px', height: '40px' }}
                    onClick={() => handleQuantityChange('decrease')}
                    disabled={quantity <= 1}
                  >
                    <i className="bi bi-dash"></i>
                  </button>
                  <span className="mx-3 fw-bold fs-5">{quantity}</span>
                  <button
                    className="btn btn-outline-secondary rounded-circle"
                    style={{ width: '40px', height: '40px' }}
                    onClick={() => handleQuantityChange('increase')}
                    disabled={product.qty > 0 && quantity >= product.qty}
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </div>
                {product.qty > 0 && quantity >= product.qty && (
                  <small className="text-danger mt-2 d-block">
                    Maximum available quantity is {product.qty}
                  </small>
                )}
              </div>

              {/* Action Buttons */}
              <div className="d-flex gap-3">
                <Button
                  variant="primary"
                  className="flex-grow-1 py-3"
                  onClick={handleAddToCart}
                  disabled={product.qty <= 0}
                  style={{ 
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  <i className="bi bi-cart-plus me-2"></i>
                  Add to Cart
                </Button>
                <Button
                  variant="outline-danger"
                  className="py-3"
                  onClick={handleAddToWishlist}
                  style={{ 
                    width: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className="bi bi-heart fs-5"></i>
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal.Body>
    </Modal>
  );
};

export default QuickViewModal;