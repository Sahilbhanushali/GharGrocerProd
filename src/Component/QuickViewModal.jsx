import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { fetchProductById } from "../api/helpers/fetchProducts.js";
import { fetchImagePathFromENV } from "../api/helpers/fetcheImagesPathFromENV.js";
import { useCartStore } from "../stores/useCartStore.js";
import Swal from "sweetalert2";

const QuickViewModal = ({ show, handleClose, productId }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFullDesc, setShowFullDesc] = useState(false);

  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    if (show && productId) {
      loadProduct();
    }
  }, [show, productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await fetchProductById(productId);
      setProduct(productData);
      setShowFullDesc(false);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: 'Failed to load product',
        timer: 1500
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!show) {
      setProduct(null);
      setQuantity(1);
      setSelectedImage(0);
      setShowFullDesc(false);
    }
  }, [show]);

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
    Swal.fire({
      icon: 'success',
      title: 'Added!',
      text: `x${quantity} in cart`,
      timer: 1500,
      showConfirmButton: false
    });
    handleClose();
  };

  const handleQuantityChange = (type) => {
    if (type === 'increase') setQuantity(prev => prev + 1);
    else if (type === 'decrease' && quantity > 1) setQuantity(prev => prev - 1);
  };

  const truncateDesc = (html, maxChars = 120) => {
    if (!html) return "No description available";
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    let text = tempDiv.textContent || tempDiv.innerText || '';
    return text.length > maxChars 
      ? text.substring(0, maxChars) + '...' 
      : text;
  };

  if (!product && !loading) return null;

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      size="xl" 
      centered 
      className="qv-modal"
      backdropClassName="qv-backdrop"
    >
      <Modal.Header closeButton className="border-0 pt-4 pb-0">
        <h4 className="fw-bold mb-0 text-dark">Quick View</h4>
      </Modal.Header>
      
      <Modal.Body className="p-0 pb-4">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center min-vh-50">
            <div className="text-center">
              <div className="spinner-border text-primary mb-3" style={{width: '3.5rem', height: '3.5rem'}}/>
              <p className="text-muted fw-medium mb-0">Loading product...</p>
            </div>
          </div>
        ) : product && (
          <div className="row g-0 h-100">
            {/* Images */}
            <div className="col-md-5 p-4">
              <div className="qv-image-container position-relative rounded-4 overflow-hidden shadow-lg">
                <img
                  src={product.images?.[selectedImage] 
                    ? fetchImagePathFromENV() + product.images[selectedImage]
                    : "https://via.placeholder.com/420x420/f8f9fa/6c757d?text=No+Image"
                  }
                  alt={product.name}
                  className="w-100 h-100 qv-main-img"
                />
              </div>
              
              {/* Thumbnails */}
              {product.images?.length > 1 && (
                <div className="qv-thumbnails mt-3">
                  <div className="d-flex gap-2">
                    {product.images.slice(0, 5).map((img, i) => (
                      <div
                        key={i}
                        className={`qv-thumb rounded-3 p-1 cursor-pointer flex-shrink-0 transition-all ${
                          selectedImage === i ? 'qv-thumb-active border-3 border-primary shadow-lg' : 'border-light'
                        }`}
                        style={{width: '56px', height: '56px'}}
                        onClick={() => setSelectedImage(i)}
                      >
                        <img
                          src={fetchImagePathFromENV() + img}
                          className="w-100 h-100 rounded-2 object-cover"
                          alt=""
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="col-md-7 p-4">
              <div className="h-100 d-flex flex-column">
                {/* Title & Price */}
                <div className="mb-4">
                  <h2 className="fw-bold lh-1 mb-3 text-truncate" style={{fontSize: '1.6rem'}}>
                    {product.name}
                  </h2>
                  
                  <div className="d-flex align-items-baseline gap-3 mb-2">
                    <h1 className="fw-black text-primary mb-0" style={{fontSize: '2.2rem'}}>
                      ₹{parseFloat(product.price).toFixed(2)}
                    </h1>
                    {product.old_price && (
                      <span className="text-muted text-decoration-line-through fs-5">
                        ₹{parseFloat(product.old_price).toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  {product.old_price && (
                    <div className="badge bg-success px-3 py-2 fw-semibold">
                      Save ₹{(parseFloat(product.old_price) - parseFloat(product.price)).toFixed(0)}
                    </div>
                  )}
                </div>

                {/* Meta */}
                <div className="meta-row mb-4 p-3 bg-light rounded-3">
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="d-flex align-items-center gap-2 text-muted">
                        <i className={`bi ${product.qty > 0 ? 'bi-check-circle-fill text-success fs-5' : 'bi-x-circle text-danger fs-5'}`}></i>
                        <div>
                          <small className="fw-bold d-block text-dark">Stock</small>
                          <span className="fw-semibold fs-6">{product.qty > 0 ? `${product.qty} available` : 'Out of Stock'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description Toggle */}
                <div className="flex-grow-1 mb-4">
                  <div className="description-card p-3 rounded-3 border">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold mb-0">Description</h6>
                      {product.description && (
                        <button
                          className="btn btn-sm btn-link p-0 text-primary fw-semibold hover-scale"
                          onClick={() => setShowFullDesc(!showFullDesc)}
                        >
                          {showFullDesc ? (
                            <>
                              Less <i className="bi bi-chevron-up ms-1"></i>
                            </>
                          ) : (
                            <>
                              More <i className="bi bi-chevron-down ms-1"></i>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <div 
                      className="desc-text lh-lg"
                      style={{
                        maxHeight: showFullDesc ? 'none' : '80px',
                        overflow: 'hidden',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        fontSize: '14px',
                        lineHeight: '1.5'
                      }}
                      dangerouslySetInnerHTML={{ 
                        __html: product.description || '<em>No description</em>' 
                      }}
                    />
                  </div>
                </div>

                {/* Quantity */}
                <div className="quantity-section mb-4 p-3 bg-light rounded-3">
                  <label className="fw-bold mb-3 d-block small">Quantity</label>
                  <div className="d-flex align-items-center gap-3">
                    <button
                      className="qty-btn border-0 bg-white shadow-sm rounded-circle d-flex align-items-center justify-content-center p-2 transition-all"
                      style={{width: '48px', height: '48px'}}
                      onClick={() => handleQuantityChange('decrease')}
                      disabled={quantity <= 1}
                    >
                      <i className="bi bi-dash fs-5"></i>
                    </button>
                    <div className="qty-display bg-white shadow-sm rounded-3 border px-4 py-2 fw-bold fs-5" 
                         style={{minWidth: '56px'}}>
                      {quantity}
                    </div>
                    <button
                      className="qty-btn border-0 bg-white shadow-sm rounded-circle d-flex align-items-center justify-content-center p-2 transition-all"
                      style={{width: '48px', height: '48px'}}
                      onClick={() => handleQuantityChange('increase')}
                      disabled={product.qty > 0 && quantity >= product.qty}
                    >
                      <i className="bi bi-plus fs-5"></i>
                    </button>
                  </div>
                  {product.qty > 0 && quantity >= product.qty && (
                    <small className="text-danger fw-semibold mt-2 d-block">Max: {product.qty}</small>
                  )}
                </div>

                {/* Add to Cart */}
                <Button
                  variant="primary"
                  className="w-100 py-3 fw-bold rounded-4 shadow-lg border-0 qv-cart-btn position-relative overflow-hidden mb-2"
                  onClick={handleAddToCart}
                  disabled={product.qty <= 0}
                  style={{
                    fontSize: 'clamp(16px, 3vw, 18px)',
                    background: 'linear-gradient(135deg, #00a82d 0%, #00c73d 100%)',
                    minHeight: '56px'
                  }}
                >
                  <i className={`bi ${product.qty > 0 ? 'bi-cart-plus-fill' : 'bi-cart-x-fill'} me-2`}></i>
                  {product.qty > 0 ? 'Add to Cart' : 'Out of Stock'}
                  <div className="btn-glow-effect"></div>
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default QuickViewModal;
