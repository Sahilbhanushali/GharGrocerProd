import React, { useState, useEffect, useRef } from "react";
import Grocerylogo from "../logo/GG_logo_artwork-01.jpg";
import { useCartStore } from "../stores/useCartStore.js";
import { useAuthStore } from "../stores/useAuthStore.js";
import { Link } from "react-router-dom";
import ShopCart from "../pages/Shop/ShopCart.jsx";
import "./css/header.css";

const Header = () => {
  const loadCartFromAPI = useCartStore((state) => state.loadCartFromAPI);
  const cartCount = useCartStore((state) => state.count);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    loadCartFromAPI();
  }, []);

  function handleLogout() {
    useAuthStore.getState().logout();
  }

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const locationRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setLocationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationClick = (e) => {
    e.preventDefault();
    setLocationOpen(!locationOpen);
  };

  const handleFetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          console.log('Location fetched:', lat, lng);
          alert('Location fetched successfully!\nLat: ' + lat + '\nLng: ' + lng);
          setLocationOpen(false);
        },
        (error) => {
          console.error('Error fetching location:', error);
          alert('Please enable location access in your browser settings');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Spacer to prevent content jump */}
      <div className="hn-spacer"></div>
      
      <div className="hn-wrapper">
        {/* NAVBAR */}
        <nav className={`hn-navbar navbar navbar-expand-lg navbar-light ${scrolled ? 'scrolled' : ''}`}>
          <div className="container-fluid hn-container">
            {/* Logo - Hidden on mobile */}
            <Link className="navbar-brand hn-logo" to="/">
              <img src={Grocerylogo} alt="GharGrocer"/>
            </Link>

            {/* LOCATION BUTTON - Hidden on mobile */}
            <div className="hn-location-col" ref={locationRef}>
              <button 
                className="hn-location-btn"
                onClick={handleLocationClick}
              >
                <svg className="hn-location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span className="hn-location-text">Delhi, India</span>
                <svg className={`hn-dropdown-arrow ${locationOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </button>
              {locationOpen && (
                <div className="hn-location-dropdown">
                  <div className="hn-location-current">
                    <strong>Current Location</strong>
                    <span>Delhi, India</span>
                  </div>
                  <button className="hn-fetch-location-btn" onClick={handleFetchLocation}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="16"/>
                      <line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                    Fetch My Location
                  </button>
                </div>
              )}
            </div>

            {/* SEARCH - Full width on mobile */}
            <div className="hn-search-col">
              <div className="hn-search-wrapper">
                <svg className="hn-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  className="form-control hn-search-input"
                  placeholder="Search groceries, fruits, vegetables..."
                />
              </div>
            </div>

            {/* Toggler - Always visible on mobile */}
            <button className="navbar-toggler hn-toggler" type="button" onClick={handleClick}>
              <span className={`hn-hamburger ${isOpen ? 'open' : ''}`}>
                <span className="hn-bar"></span>
                <span className="hn-bar"></span>
                <span className="hn-bar"></span>
              </span>
            </button>

            {/* Nav Items */}
            <div className={`collapse navbar-collapse hn-navbar-collapse ${isOpen ? 'show' : ''}`} id="mobile_nav">
              <ul className="navbar-nav ms-auto hn-nav-simple">
                <li className="nav-item">
                  <Link className="nav-link hn-nav-link" to="/" onClick={() => setIsOpen(false)}>
                    <svg className="hn-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    <span>Home</span>
                  </Link>
                </li>

                <li className="nav-item dropdown hn-dropdown">
                  <Link className="nav-link hn-nav-link dropdown-toggle" to="/AboutUs" data-bs-toggle="dropdown">
                    <svg className="hn-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    <span>About</span>
                  </Link>
                  <ul className="dropdown-menu hn-dropdown-menu">
                    <li><Link className="dropdown-item" to="/Blog" onClick={() => setIsOpen(false)}>Blog</Link></li>
                    <li><Link className="dropdown-item" to="/AboutUs" onClick={() => setIsOpen(false)}>About us</Link></li>
                    <li><Link className="dropdown-item" to="/Contact" onClick={() => setIsOpen(false)}>Contact</Link></li>
                  </ul>
                </li>

                <li className="nav-item dropdown hn-account">
                  <Link className="nav-link hn-nav-link dropdown-toggle" to="#" data-bs-toggle="dropdown">
                    <svg className="hn-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span>Account</span>
                  </Link>
                  <ul className="dropdown-menu hn-dropdown-menu">
                    {isAuthenticated ? (
                      <>
                        <li><Link className="dropdown-item" to="/MyAccountOrder" onClick={() => setIsOpen(false)}>Orders</Link></li>
                        <li><Link className="dropdown-item" to="/MyAccountAddress" onClick={() => setIsOpen(false)}>Address</Link></li>
                        <li><hr className="dropdown-divider"/></li>
                        <li><Link className="dropdown-item text-danger" to="#" onClick={(e) => { handleLogout(); setIsOpen(false); }}>Logout</Link></li>
                      </>
                    ) : (
                      <li><Link className="dropdown-item" to="/MyAccountSignIn" onClick={() => setIsOpen(false)}>Sign in</Link></li>
                    )}
                  </ul>
                </li>

                {/* CART */}
                <li className="nav-item hn-cart-item">
                  <button 
                    className="hn-cart-btn position-relative"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#offcanvasRight"
                  >
                    <svg className="hn-cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <path d="M16 10a4 4 0 0 1-8 0"/>
                    </svg>
                    <span className="hn-cart-text">Cart</span>
                    {cartCount > 0 && <span className="hn-cart-badge">{cartCount}</span>}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Offcanvas Cart */}
        <div className="offcanvas offcanvas-end h-100" tabIndex="-1" id="offcanvasRight" aria-labelledby="offcanvasRightLabel">
          <div className="offcanvas-header border-bottom">
            <h5 className="mb-0 fw-bold" id="offcanvasRightLabel">My Cart</h5>
            <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas"/>
          </div>
          <div className="offcanvas-body d-flex flex-column p-0">
            <div className="flex-grow-1 overflow-auto">
              <ShopCart />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;