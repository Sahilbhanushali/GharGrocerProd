import React from "react";
import {
  MDBBtn,
  MDBCardImage,
  MDBContainer,
  MDBIcon,
  MDBTypography,
  MDBCardText,
} from "mdb-react-ui-kit";
import "./css/shopCart.css";
import { fetchImagePathFromENV } from "../../api/helpers/fetcheImagesPathFromENV.js";
import { useCartStore } from "../../stores/useCartStore.js";
import { Link } from "react-router-dom";

export default function ShopCart() {
  const cart = useCartStore((state) => state.cart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  // Remove this useEffect - cart is already loaded in Header
  // React.useEffect(() => {
  //   loadCartFromAPI();
  // }, [loadCartFromAPI]);

  const cartItems = cart;

  if (!cartItems.length) {
    return (
      <div className="scx-wrapper scx-empty py-5 h-100 d-flex flex-column align-items-center justify-content-center text-center">
        <div className="scx-empty-icon mb-4">
          <MDBIcon fas icon="shopping-bag" size="3x" />
        </div>
        <MDBTypography tag="h5" className="mb-3 fw-bold">
          Your cart is empty
        </MDBTypography>
        <MDBCardText className="text-muted mb-4 px-3">
          Browse products and add items to your cart to see them here.
        </MDBCardText>
        <Link to="/Shop" className="btn btn-outline-primary px-5 py-2 fw-semibold" data-bs-dismiss="offcanvas">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <section className="scx-wrapper scx-cart h-100">
      <MDBContainer fluid className="px-3 py-3 h-100 d-flex flex-column">
        {/* HEADER */}
        <div className="scx-header pb-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <p className="text-muted small mb-1">Your cart</p>
              <h6 className="fw-bold mb-0">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
              </h6>
            </div>
            <h5 className="scx-total-price mb-0 fw-bold">₹{totalPrice.toFixed(2)}</h5>
          </div>
          <div className="scx-delivery-bar">
            <div className="scx-delivery-icon">
              <MDBIcon fas icon="truck" />
            </div>
            <div className="flex-grow-1 ms-2">
              <p className="scx-delivery-text mb-1">Free delivery in 30 mins</p>
              <p className="scx-delivery-subtitle small text-muted mb-0">Order above ₹199</p>
              <div className="scx-progress-small mt-1">
                <div className="scx-progress-fill-small" style={{width: '75%'}} />
              </div>
            </div>
          </div>
        </div>

        {/* ONE-ROW GRID ITEMS */}
        <div className="scx-items-grid flex-grow-1">
          {cartItems.map((item, index) => (
            <div key={item.id || item.cartItemId} className="scx-row-item">
              <div className="scx-row-grid">
                {/* IMAGE */}
                <div className="scx-row-image">
                  <Link
                    to={`/product/${item.product?.slug || item.product_id}`}
                    className="scx-image-link"
                    data-bs-dismiss="offcanvas"
                  >
                    <MDBCardImage
                      src={
                        fetchImagePathFromENV() +
                        (item.product?.images?.[0] || item.images?.[0] || "")
                      }
                      className="scx-row-img"
                      alt={item.product?.name || item.name}
                    />
                  </Link>
                </div>

                {/* NAME */}
                <div className="scx-row-name">
                  <Link
                    to={`/product/${item.product?.slug || item.product_id}`}
                    className="scx-product-link text-decoration-none"
                    data-bs-dismiss="offcanvas"
                  >
                    <h6 className="scx-product-title mb-1">{item.product?.name || item.name}</h6>
                  </Link>
                  <div className="scx-product-meta">
                    <span className="scx-meta-unit">{item.product?.weight || '500g'}</span>
                  </div>
                </div>

                {/* PRICE */}
                <div className="scx-row-price">
                  <h6 className="scx-price mb-0 fw-bold">
                    ₹{Number(item.final_price || item.price).toFixed(2)}
                  </h6>
                  <span className="scx-price-old small text-muted">
                    ₹{Number(item.final_price * 1.2 || item.price * 1.2).toFixed(0)}
                  </span>
                </div>

                {/* QUANTITY + REMOVE */}
                <div className="scx-row-controls">
                  <div className="scx-qty-group">
                    <MDBBtn 
                      color="link" 
                      className="scx-qty-btn scx-minus-btn" 
                      size="sm"
                      disabled={item.qty <= 1}
                      onClick={() => item.qty > 1 && updateQuantity(item.id, item.qty - 1)}
                    >
                      <MDBIcon fas icon="minus" />
                    </MDBBtn>
                    <span className="scx-qty-value">{item.qty}</span>
                    <MDBBtn 
                      color="link" 
                      className="scx-qty-btn scx-plus-btn" 
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.qty + 1)}
                    >
                      <MDBIcon fas icon="plus" />
                    </MDBBtn>
                  </div>
                  <button 
                    className="scx-trash-icon" 
                    onClick={() => removeFromCart(item.id)}
                    title="Remove item"
                  >
                    <MDBIcon fas icon="trash-alt" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="scx-footer pt-3">
          <div className="scx-footer-total mb-4">
            <span className="fw-semibold fs-5">Total</span>
            <h4 className="fw-bold mb-0">₹{totalPrice.toFixed(2)}</h4>
          </div>
          <div className="scx-checkout-buttons mb-3">
            <Link to="/ShopCheckOut" className="btn scx-checkout-btn mb-2" data-bs-dismiss="offcanvas">
              <MDBIcon fas icon="credit-card" className="me-2" />
              Checkout ₹{totalPrice.toFixed(2)}
            </Link>
            <Link to="/ShopCart" className="btn scx-cart-btn" data-bs-dismiss="offcanvas">
              View full cart
            </Link>
          </div>
          <div className="scx-secure">
            <MDBIcon fas icon="lock" className="me-2 text-success" />
            <span>100% secure checkout</span>
          </div>
          <Link to="/Shop" className="scx-continue-link" data-bs-dismiss="offcanvas">
            <MDBIcon fas icon="arrow-left" className="me-1" />
            Continue shopping
          </Link>
        </div>
      </MDBContainer>
    </section>
  );
}