import playstoreIcon from "../logo/GG_logo_artwork-01.png";

import adbanner1 from "../images/ad-banner-1.jpg";
import adbanner2 from "../images/ad-banner-2.jpg";
import adbanner3 from "../images/ad-banner-3.jpg";
import grocerybanner from "../images/grocery-banner.png";
import grocerybanner2 from "../images/grocery-banner-2.jpg";
import map from "../images/map.png";
import iphone from "../images/iphone-2.png";
import googleplay from "../images/googleplay-btn.svg";
import appstore from "../images/appstore-btn.svg";
import bannerdeal from "../images/banner-deal1.jpg";
import clock from "../images/clock.svg";
import gift from "../images/gift.svg";
import package1 from "../images/package.svg";
import refresh from "../images/refresh-cw.svg";
import { Link } from "react-router-dom";
import { useState } from "react";
import Slider from "react-slick";
import { axiosInstance } from "../lib/axios.js";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Slide, Zoom } from "react-awesome-reveal";
import { useEffect } from "react";
import { MagnifyingGlass } from "react-loader-spinner";
import FAQ from "./FooterElements/Faq";
import { fetchImagePathFromENV } from "../api/helpers/fetcheImagesPathFromENV.js";
import { FetchALlCategoryGroupsDetails } from "../api/helpers/fetchCategoryGroups.js";
import { useCartStore } from "../stores/useCartStore.js";
import QuickViewModal from "../Component/QuickViewModal.jsx";
import ProductCarousel from "../Component/ProductCarousel.jsx";
import { fetchProducts } from "../api/helpers/fetchProducts.js"
import "../pages/css/Home.css"
import Swal from "sweetalert2";
import { FetchALlBrands } from "../api/helpers/fetchBrands.js"

const Home = () => {

  const [isVisible, setIsVisible] = useState(false);
  const [siteDetails, setSiteDetails] = useState(null);
  const [bannerImages, setBannerImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingFeaturedProducts, setLoadingFeaturedProducts] = useState(true);
  const addToCart = useCartStore((state) => state.addToCart);
  const [brands, setBrands] = useState([]);
  const [brandPage, setBrandPage] = useState(1);
  const [brandLastPage, setBrandLastPage] = useState(1);
  const [loadingBrands, setLoadingBrands] = useState(true);

  const [quickViewModal, setQuickViewModal] = useState({
    show: false,
    productId: null
  });

  const handleQuickView = (productId) => {
    setQuickViewModal({ show: true, productId });
  };

  const handleCloseQuickView = () => {
    setQuickViewModal({ show: false, productId: null });
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    Swal.fire({
      icon: 'success',
      title: 'Added to Cart',
      text: `${product.name} has been added to your cart!`,
      showConfirmButton: false,
      timer: 900,
    });
  };



  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  useEffect(() => {

    const fetchSiteDetails = async () => {
      try {
        const response = await axiosInstance.get("/pages");
        const siteData = response.data.data;

        const visibleBanners = siteData[6]?.payload?.filter(
          (item) => item.is_visible === true && item.featured === true
        );

        const images = visibleBanners?.map((item) => item.image) || [];
        setBannerImages(images);

        const siteDetails = {
          orderSettings: siteData.find((item) => item.name === "order-setting"),
          contactUs: siteData.find((item) => item.name === "contact_us"),
          companyDetails: siteData.find(
            (item) => item.name === "company_details"
          ),
          aboutUs: siteData.find((item) => item.name === "about_us"),
        };

        setSiteDetails(siteDetails);

        localStorage.setItem("siteDetails", JSON.stringify(siteDetails));
      } catch (error) {
        console.error("Error fetching site details:", error);
      }
    };
    fetchSiteDetails();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const categoryData = await FetchALlCategoryGroupsDetails();
        setCategories(categoryData);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]); // Set empty array on error
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {

    const fetchFeaturedProducts = async () => {
      try {
        setLoadingFeaturedProducts(true);
        const featuredProductsData = await fetchProducts({ featured: 1 });

        setFeaturedProducts(featuredProductsData.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setFeaturedProducts([]); // Set empty array on error
      } finally {
        setLoadingFeaturedProducts(false);
      }
    };

    fetchFeaturedProducts();

  }, [])

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoadingBrands(true);
        const res = await FetchALlBrands(brandPage, 10);

        console.log('Brands API Response:', res);

        // Handle the API response structure
        if (res && res.data) {
          const pageData = res.data;
          setBrands(pageData.data || []);
          setBrandLastPage(pageData.last_page || 1);
        }
      } catch (error) {
        console.error("Failed to fetch brands:", error);
        setBrands([]);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load brands',
          showConfirmButton: false,
          timer: 2000,
        });
      } finally {
        setLoadingBrands(false);
      }
    };

    fetchBrands();
  }, [brandPage]);
  const handleBrandNext = () => {
    if (brandPage < brandLastPage) {
      setBrandPage(prev => prev + 1);
    }
  };

  const handleBrandPrev = () => {
    if (brandPage > 1) {
      setBrandPage(prev => prev - 1);
    }
  };

  const settings1 = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    initialSlide: 1,
    responsive: [
      {
        breakpoint: 1600,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
    autoplay: true,
    autoplaySpeed: 2000,
  };
  const settings2 = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 5,
    initialSlide: 0,
    responsive: [
      { breakpoint: 1600, settings: { slidesToShow: 5, slidesToScroll: 5 } },
      { breakpoint: 1024, settings: { slidesToShow: 4, slidesToScroll: 4 } },
      { breakpoint: 900, settings: { slidesToShow: 3, slidesToScroll: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 3, slidesToScroll: 3 } },
      { breakpoint: 600, settings: { slidesToShow: 2, slidesToScroll: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
    autoplay: false,
    // When user clicks next/prev, move API page when at ends
    afterChange: (current) => {
      const totalSlides = brands.length;
      const lastVisible = current + settings2.slidesToShow;
      if (lastVisible >= totalSlides && brandPage < brandLastPage) {
        setBrandPage((p) => p + 1);
      }
      if (current === 0 && brandPage > 1) {
        setBrandPage((p) => p - 1);
      }
    },
  };

  const brandSliderSettings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 6,
  slidesToScroll: 1,
  arrows: true,
  responsive: [
    { 
      breakpoint: 1600, 
      settings: { 
        slidesToShow: 6, 
        slidesToScroll: 1 
      } 
    },
    { 
      breakpoint: 1400, 
      settings: { 
        slidesToShow: 5, 
        slidesToScroll: 1 
      } 
    },
    { 
      breakpoint: 1200, 
      settings: { 
        slidesToShow: 4, 
        slidesToScroll: 1 
      } 
    },
    { 
      breakpoint: 992, 
      settings: { 
        slidesToShow: 3, 
        slidesToScroll: 1 
      } 
    },
    { 
      breakpoint: 768, 
      settings: { 
        slidesToShow: 2, 
        slidesToScroll: 1 
      } 
    },
    { 
      breakpoint: 576, 
      settings: { 
        slidesToShow: 1, 
        slidesToScroll: 1 
      } 
    },
  ],
};
  // loading
  const [loaderStatus, setLoaderStatus] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setLoaderStatus(false);
    }, 1500);
  }, []);
  return (
    <div>
      <div>
        {loaderStatus ? (
          <div className="loader-container">
            {/* <PulseLoader loading={loaderStatus} size={50} color="#0aad0a" /> */}
            <MagnifyingGlass
              visible={true}
              height="100"
              width="100"
              ariaLabel="magnifying-glass-loading"
              wrapperStyle={{}}
              wrapperclassName="magnifying-glass-wrapper"
              glassColor="#c0efff"
              color="#0aad0a"
            />
          </div>
        ) : (
          <>
            <>
              <div className="scroll-to-top">
                <button
                  onClick={scrollToTop}
                  className={`scroll-to-top-button ${isVisible ? "show" : ""}`}
                >
                  ↑
                </button>
              </div>
              <section className="hero-section">
                <div className="container mt-8">
                  <div
                    id="carouselExampleFade"
                    className="carousel slide carousel-fade"
                    data-bs-ride="carousel"
                  >
                    <div className="carousel-inner">
                      {bannerImages.map((img, index) => (
                        <div
                          key={index}
                          className={`carousel-item ${index === 0 ? "active" : ""
                            }`}
                        >
                          <div
                            style={{
                              background: `url(${fetchImagePathFromENV() + img
                                }) no-repeat`,
                              backgroundSize: "cover",
                              borderRadius: ".5rem",
                              backgroundPosition: "center",
                              height: "600px",
                            }}
                          ></div>
                        </div>
                      ))}
                    </div>

                    <Link
                      className="carousel-control-prev"
                      to="#carouselExampleFade"
                      role="button"
                      data-bs-slide="prev"
                    >
                      <span
                        className="carousel-control-prev-icon"
                        aria-hidden="true"
                      />
                      <span className="visually-hidden">Previous</span>
                    </Link>

                    <Link
                      className="carousel-control-next"
                      to="#carouselExampleFade"
                      role="button"
                      data-bs-slide="next"
                    >
                      <span
                        className="carousel-control-next-icon"
                        aria-hidden="true"
                      />
                      <span className="visually-hidden">Next</span>
                    </Link>
                  </div>
                </div>
              </section>
            </>
            <>
              <section className="mt-8">
                {/* contianer */}
                <div className="container ">
                  <div className="row">
                    {/* col */}
                    <Slide direction="down">
                      <div className="col-12">
                        {/* cta */}
                        <div className="bg-light d-lg-flex justify-content-between align-items-center py-6 py-lg-3 px-8 rounded-3 text-center text-lg-start">
                          {/* img */}
                          <div className="d-lg-flex align-items-center">
                            <img
                              src={playstoreIcon}
                              alt="about-icon"
                              className="img-fluid"
                              style={{ width: 100 }}
                            />
                            {/* text */}
                            <div className="ms-lg-4">
                              <h1 className="fs-2 mb-1">
                                Welcome to GharGrocer
                              </h1>
                              <span>
                                Download the app get &amp;{" "}
                                <span className="text-primary">50%</span> off on
                                your first order.
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 mt-lg-0">
                            {/* btn */}
                            <Link to="#" className="btn btn-dark">
                              Download GharGrocer
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Slide>
                  </div>
                </div>
              </section>
            </>
            <>
              {/* section */}
              <section className="mt-8">
                <div className="container">
                  {/* row */}
                  <div className="row">
                    <div className="col-lg-4 col-md-6 col-12 fade-in-left">
                      {/* <Slide direction="left"> */}
                      <div className=" banner mb-3">
                        {/* Banner Content */}
                        <div className="position-relative">
                          {/* Banner Image */}
                          <img
                            src={adbanner1}
                            alt="ad-banner"
                            className="img-fluid rounded-3 w-100"
                          />
                          <div className="banner-text">
                            <h3 className="mb-0 fw-bold">
                              10% cashback on <br />
                              personal care{" "}
                            </h3>
                            <div className="mt-4 mb-5 fs-5">
                              <p className="mb-0">Max cashback: $12</p>
                              <span>
                                Code:{" "}
                                <span className="fw-bold text-dark">
                                  CARE12
                                </span>
                              </span>
                            </div>
                            <Link to="#" className="btn btn-dark">
                              Shop Now
                            </Link>
                          </div>
                          {/* Banner Content */}
                        </div>
                      </div>
                      {/* </Slide> */}
                    </div>

                    <div className="col-lg-4 col-md-6  col-12 slide-in-top">
                      {/* <Zoom> */}
                      <div className="banner mb-3 ">
                        {/* Banner Content */}
                        <div className="position-relative">
                          {/* Banner Image */}
                          <img
                            src={adbanner2}
                            alt="ad-banner-2"
                            className="img-fluid rounded-3 w-100"
                          />
                          <div className="banner-text">
                            {/* Banner Content */}
                            <h3 className=" fw-bold mb-2">
                              Say yes to <br />
                              season’s fresh{" "}
                            </h3>
                            <p className="fs-5">
                              Refresh your day <br />
                              the fruity way
                            </p>
                            <Link to="#" className="btn btn-dark mt-2">
                              Shop Now
                            </Link>
                          </div>
                        </div>
                      </div>
                      {/* </Zoom> */}
                    </div>
                    <div className="col-lg-4 col-12 fade-in-left ">
                      {/* <Slide direction="right"> */}
                      <div className="banner mb-3">
                        <div className="banner-img">
                          {/* Banner Image */}
                          <img
                            src={adbanner3}
                            alt="ad-banner-3"
                            className="img-fluid rounded-3 w-100"
                          />
                          {/* Banner Content */}
                          <div className="banner-text">
                            <h3 className="fs-2 fw-bold lh-1 mb-2">
                              When in doubt,
                              <br />
                              eat ice cream{" "}
                            </h3>
                            <p className="fs-5">
                              Enjoy a scoop of
                              <br />
                              summer today
                            </p>
                            <Link to="#" className="btn btn-dark">
                              Shop Now
                            </Link>
                          </div>
                        </div>
                      </div>
                      {/* </Slide> */}
                    </div>
                  </div>
                </div>
              </section>
              {/* section */}
            </>
            <>
              {/* section category */}
              <section className="my-lg-14 my-8">
                <div className="container">
                  <div className="row">
                    <div className="col-12">
                      <div className="mb-6">
                        {/* heading */}
                        <div className="section-head text-center mt-8">
                          <h3
                            className="h3style"
                            data-title="Shop Popular Categories"
                          >
                            Shop Popular Categories
                          </h3>
                          <div className="wt-separator bg-primarys"></div>
                          <div className="wt-separator2 bg-primarys"></div>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className="col-lg-2 col-md-4 col-6 fade-zoom"
                        >
                          <Zoom>
                            <div className="text-center mb-10">
                              {/* img */}
                              <Link to={`/category-group/${category.id}`}>
                                <img
                                  src={`${fetchImagePathFromENV() +
                                    category.image
                                    }`}
                                  alt={category.name.toLowerCase()}
                                  className="card-image rounded-circle"
                                  style={{
                                    width: 120,
                                    height: 100,
                                    objectFit: "contain",
                                  }}
                                />
                              </Link>
                              {/* text */}
                              <div className="mt-4">
                                <h5 className="fs-6 mb-0">
                                  <Link
                                    to={`/categories/${category.id}`}
                                    className="text-inherit"
                                  >
                                    {category.name}
                                  </Link>
                                </h5>
                              </div>
                            </div>
                          </Zoom>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
              {/* section */}
            </>
            <>
              <section>
                <div className="container ">
                  <div className="row">
                    <div className="col-12 col-lg-6 mb-3 mb-lg-0  fade-in-left">
                      <Slide direction="left">
                        <div>
                          <div
                            className="py-10 px-8 rounded-3"
                            style={{
                              background: `url(${grocerybanner}) no-repeat`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          >
                            <div>
                              <h3 className="fw-bold mb-1">
                                Fruits &amp; Vegetables
                              </h3>
                              <p className="mb-4">
                                Get Upto <span className="fw-bold">30%</span>{" "}
                                Off
                              </p>
                              <Link to="#!" className="btn btn-dark">
                                Shop Now
                              </Link>
                            </div>
                          </div>
                        </div>
                      </Slide>
                    </div>
                    <div className="col-12 col-lg-6 fade-in-left ">
                      <Slide direction="right">
                        <div>
                          <div
                            className="py-10 px-8 rounded-3"
                            style={{
                              background: `url(${grocerybanner2}) no-repeat`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          >
                            <div>
                              <h3 className="fw-bold mb-1">
                                Freshly Baked Buns
                              </h3>
                              <p className="mb-4">
                                Get Upto <span className="fw-bold">25%</span>{" "}
                                Off
                              </p>
                              <Link to="#!" className="btn btn-dark">
                                Shop Now
                              </Link>
                            </div>
                          </div>
                        </div>
                      </Slide>
                    </div>
                  </div>
                </div>
              </section>
            </>
            <>
              <ProductCarousel
                title="Popular Products"
                categoryId={null}
                limit={10}
              />
            </>
            <>
              {/* cta section */}
              <section>
                <div
                  className="container"
                  style={{
                    background: `url(${map})no-repeat`,
                    backgroundSize: "cover",
                  }}
                >
                  {/* <hr className="my-lg-14 my-8"> */}
                  {/* row */}
                  <div className="row align-items-center text-center justify-content-center">
                    <div className=" col-lg-6 col-md-6 fade-in-left">
                      <Slide direction="left">
                        <div className="mb-6">
                          <div className="mb-7">
                            {/* heading */}
                            <h1>Get the Ghar Grocer app</h1>
                            <h5 className="mb-0">
                              We will send you a link, open it on your phone to
                              download the app.
                            </h5>
                          </div>
                          <div className="mb-5">
                            {/* form check */}
                            <div className="form-check form-check-inline">

                            </div>
                            {/* form check */}
                            <div className="form-check form-check-inline">

                            </div>
                            <QuickViewModal
                              show={quickViewModal.show}
                              handleClose={handleCloseQuickView}
                              productId={quickViewModal.productId}
                            />
                          </div>
                          <div>
                            {/* app */}
                            {/* <small>Download app from</small> */}
                            <ul className="list-inline mb-0 mt-2 ">
                              {/* list item */}
                              <li className="list-inline-item">
                                {/* img */}
                                <Link to="#!">
                                  {" "}
                                  <img
                                    src={appstore}
                                    alt="appstore"
                                    style={{ width: 140 }}
                                  />
                                </Link>
                              </li>
                              <li className="list-inline-item">
                                {/* img */}
                                <Link to="#!">
                                  {" "}
                                  <img
                                    src={googleplay}
                                    alt="googleplay"
                                    style={{ width: 140 }}
                                  />
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </Slide>
                    </div>
                    <div className=" offset-lg-2 col-lg-4 col-md-6 fade-zoom">
                      <Slide direction="right">
                        <div className="text-lg-start">
                          {/* img */}
                          <img
                            src={iphone}
                            alt="iphone"
                            className=" img-fluid"
                          />
                        </div>
                      </Slide>
                    </div>
                  </div>
                  {/* <hr className="my-lg-14 my-8"> */}
                </div>
              </section>
            </>
            <>

              <section className="my-lg-14 my-8">
                <div className="container">
                  <div className="row">
                    <div className="col-md-12 mb-6">
                      <div className="section-head text-center mt-8">
                        <h3 className="h3style" data-title="Daily Best Sells">
                          Daily Best Sells
                        </h3>
                        <div className="wt-separator bg-primarys"></div>
                        <div className="wt-separator2 bg-primarys"></div>
                      </div>
                    </div>
                  </div>

                  <div className="row g-4">
                    {/* Banner Column */}
                    <div className="col-lg-3 col-md-12 fade-in-left">
                      <div
                        className="daily-best-sells-banner rounded-3"
                        style={{
                          background: `url(${bannerdeal}) no-repeat`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        <div>
                          <h3 className="fw-bold text-white mb-2">
                            100% Organic Coffee Beans.
                          </h3>
                          <p className="text-white mb-4">
                            Get the best deal before close.
                          </p>
                          <Link to="#!" className="btn btn-primary">
                            Shop Now{" "}
                            <i className="feather-icon icon-arrow-right ms-1" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Products Slider Column */}
                    <div className="col-lg-9 col-md-12">
                      <div className="daily-best-sells-slider">
                        <Slider {...settings1}>
                          {featuredProducts.map((product) => (
                            <div className="images swiper-slide" key={product.id}>
                              <div className="col">
                                <div className="card card-product">
                                  <div className="card-body">
                                    {/* Product Image Container */}
                                    <div className="text-center position-relative">
                                      <Link to={`/single-product/${product.id}`}>
                                        <img
                                          src={
                                            product.images?.[0]
                                              ? fetchImagePathFromENV() + product.images[0]
                                              : "https://via.placeholder.com/200x200?text=No+Image"
                                          }
                                          alt={product.name}
                                          className="img-fluid"
                                          loading="lazy"
                                          onError={(e) => {
                                            e.target.src = "https://via.placeholder.com/200x200?text=No+Image";
                                          }}
                                        />
                                      </Link>

                                      {/* Product Action Buttons (optional - quick view, wishlist) */}
                                      <div className="card-product-action">
                                        {/* Add your action buttons here if needed */}
                                      </div>
                                    </div>

                                    {/* Card Content Wrapper */}
                                    <div className="card-content">
                                      {/* Category */}
                                      <div className="text-small mb-1">
                                        <Link
                                          to={`/categories/${product.categories?.[0]?.id || '#'}`}
                                          className="text-decoration-none text-muted"
                                        >
                                          <small>
                                            {product.categories?.[0]?.name || "Category"}
                                          </small>
                                        </Link>
                                      </div>

                                      {/* Product Name */}
                                      <h2 className="fs-6 mb-2">
                                        <Link
                                          to={`/product/${product.id}`}
                                          className="text-inherit text-decoration-none"
                                          title={product.name}
                                        >
                                          {product.name}
                                        </Link>
                                      </h2>

                                      {/* Price and Rating */}
                                      <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                          <span className="text-dark">
                                            ₹{parseFloat(product.price).toFixed(2)}
                                          </span>
                                          {product.old_price && parseFloat(product.old_price) > 0 && (
                                            <>
                                              {" "}
                                              <span className="text-decoration-line-through text-muted">
                                                ₹{parseFloat(product.old_price).toFixed(2)}
                                              </span>
                                            </>
                                          )}
                                        </div>

                                        <div className="d-flex align-items-center gap-1">
                                          <small className="text-warning">
                                            {[...Array(5)].map((_, index) => (
                                              <i
                                                key={index}
                                                className={
                                                  index < 4
                                                    ? "bi bi-star-fill"
                                                    : "bi bi-star-half"
                                                }
                                              />
                                            ))}
                                          </small>
                                          <span className="ms-1">
                                            <small className="text-muted">4.5</small>
                                          </span>
                                        </div>
                                      </div>

                                      {/* Add to Cart Button */}
                                      <div className="d-grid">
                                        <button
                                          className="btn btn-primary"
                                          onClick={() => handleAddToCart(product)}
                                          disabled={product.qty <= 0}
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
                                            className="feather feather-plus me-1"
                                          >
                                            <line x1={12} y1={5} x2={12} y2={19} />
                                            <line x1={5} y1={12} x2={19} y2={12} />
                                          </svg>
                                          Add to cart
                                        </button>
                                      </div>

                                      {/* Countdown Timer (optional) */}
                                      <div className="d-flex justify-content-start text-center">
                                        <div
                                          className="deals-countdown w-100"
                                          data-countdown="2025/12/31 23:59:59"
                                        >
                                          {/* Add your countdown component here if you have one */}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </Slider>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </>
            <>
              <section className="my-lg-14 my-8">
                <div className="container" style={{ marginTop: 50 }}>
                  <div
                    className="row justify-content-center  g-4"
                    style={{ textAlign: "center" }}
                  >
                    <div className="col-md-3 col-sm-6 fade-zoom ">
                      <Zoom>
                        <div className="shadow-effect">
                          <div className="wt-icon-box-wraper center p-a25 p-b50 m-b30 bdr-1 bdr-gray bdr-solid corner-radius step-icon-box bg-white v-icon-effect">
                            <div className="icon-lg m-b20">
                              <div className="mb-6">
                                <img src={refresh} alt="refresh" />
                              </div>
                            </div>
                            <div className="icon-content">
                              <h3 className="h5 mb-3">Easy Returns</h3>
                              <p>
                                Not satisfied with a product? Return it at the
                                doorstep &amp; get a refund within hours. No
                                questions asked
                                <Link to="#!">policy</Link>.
                              </p>
                            </div>
                          </div>
                        </div>
                      </Zoom>
                    </div>
                    <div className="col-md-3 col-sm-12 fade-zoom">
                      <Zoom>
                        <div className="shadow-effect">
                          <div className="wt-icon-box-wraper center p-a25 p-b50 m-b30 bdr-1 bdr-gray bdr-solid corner-radius step-icon-box bg-white v-icon-effect">
                            <div className="icon-lg m-b20">
                              <div className="mb-6">
                                <img src={package1} alt="package" />
                              </div>
                            </div>
                            <div className="icon-content">
                              <h3 className="h5 mb-3">Wide Assortment</h3>
                              <p>
                                Choose from 5000+ products across food, personal
                                care, household, bakery, veg and non-veg &amp;
                                other categories.
                              </p>
                            </div>
                          </div>
                        </div>
                      </Zoom>
                    </div>
                    <div className="col-md-3 col-sm-12 fade-zoom">
                      <Zoom>
                        <div className="shadow-effect">
                          <div className="wt-icon-box-wraper center p-a25 p-b50 m-b30 bdr-1 bdr-gray bdr-solid corner-radius step-icon-box bg-white v-icon-effect">
                            <div className="icon-lg m-b20">
                              <div className="mb-6">
                                <img src={gift} alt="gift" />
                              </div>
                            </div>
                            <div className="icon-content">
                              <h3 className="h5 mb-3">
                                Best Prices &amp; Offers
                              </h3>
                              <p>
                                Cheaper prices than your local supermarket,
                                great cashback offers to top it off. Get best
                                pricess &amp; offers.
                              </p>
                            </div>
                          </div>
                        </div>
                      </Zoom>
                    </div>
                    <div className="col-md-3 col-sm-12 fade-zoom">
                      <Zoom>
                        <div className="shadow-effect">
                          <div className="wt-icon-box-wraper center p-a25 p-b50 m-b30 bdr-1 bdr-gray bdr-solid corner-radius step-icon-box bg-white v-icon-effect">
                            <div className="icon-lg m-b20">
                              <div className="mb-6">
                                <img src={clock} alt="clock" />
                              </div>
                            </div>
                            <div className="icon-content">
                              {/* <h4 className="wt-tilte">Reports</h4> */}
                              <h3 className="h5 mb-3">10 minute grocery now</h3>
                              <p>
                                Get your order delivered to your doorstep at the
                                earliest from FreshCart pickup
                                <span> stores near you.</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </Zoom>
                    </div>
                  </div>
                </div>
              </section>
            </>
           
            <>
              <section className="my-lg-14 my-8">
                <div className="container">
                  <div className="section-head text-center mb-6">
                    <h3 className="h3style" data-title="Our Brands">
                      Our Brands
                    </h3>
                    <div className="wt-separator bg-primarys"></div>
                    <div className="wt-separator2 bg-primarys"></div>
                  </div>

                  {loadingBrands ? (
                    <div className="text-center py-5">
                      <MagnifyingGlass
                        visible={true}
                        height="80"
                        width="80"
                        ariaLabel="magnifying-glass-loading"
                        glassColor="#c0efff"
                        color="#0aad0a"
                      />
                      <p className="mt-3">Loading brands...</p>
                    </div>
                  ) : brands.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-inbox fs-1 text-muted"></i>
                      <p className="mt-3 text-muted">No brands available</p>
                    </div>
                  ) : (
                    <>
                      <div className="position-relative brand-slider-wrapper">
                        <Slider {...brandSliderSettings}>
                          {brands.map((brand) => (
                            <div className="p-3" key={brand.id}>
                              <div className="card card-product mb-3 h-100 brand-card">
                                <div className="card-body text-center py-4">
                                  <Link
                                    to={`/brands/${brand.id}`}
                                    className="text-decoration-none text-inherit"
                                  >
                                    <div className="mb-3 d-flex justify-content-center align-items-center brand-image-wrapper">
                                      <img
                                        src={fetchImagePathFromENV() + brand.image}
                                        alt={brand.name}
                                        className="img-fluid brand-image"
                                        style={{
                                          maxHeight: 80,
                                          maxWidth: '100%',
                                          objectFit: 'contain',
                                        }}
                                        onError={(e) => {
                                          e.target.src =
                                            "https://via.placeholder.com/150x80?text=Brand";
                                        }}
                                      />
                                    </div>
                                    <div className="fw-semibold brand-name">{brand.name}</div>
                                    {brand.products_count > 0 && (
                                      <small className="text-muted">
                                        {brand.products_count} product
                                        {brand.products_count > 1 ? "s" : ""}
                                      </small>
                                    )}
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </Slider>
                      </div>

                      {/* Pagination Controls */}
                      {brandLastPage > 1 && (
                        <div className="d-flex justify-content-center align-items-center mt-4 gap-3">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={handleBrandPrev}
                            disabled={brandPage <= 1}
                          >
                            <i className="bi bi-chevron-left"></i> Previous
                          </button>
                          <span className="text-muted">
                            Page {brandPage} of {brandLastPage}
                          </span>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={handleBrandNext}
                            disabled={brandPage >= brandLastPage}
                          >
                            Next <i className="bi bi-chevron-right"></i>
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </section>
            </>
             <>
              <FAQ />
            </>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
