import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { fetchProductById } from '../../api/helpers/fetchProducts.js';
import { fetchImagePathFromENV } from '../../api/helpers/fetcheImagesPathFromENV';
import { MagnifyingGlass } from 'react-loader-spinner';
import { useCartStore } from '../../stores/useCartStore.js';
import Slider from 'react-slick';
import ProductCarousel from '../../Component/ProductCarousel';
import Swal from 'sweetalert2';
import '../singleProductPage/singleProductPage.css';

const SingleProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const addToCart = useCartStore((state) => state.addToCart);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    // Fetch product details
    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                setLoading(true);
                const productData = await fetchProductById(id);
                console.log('Product Data:', productData);
                setProduct(productData);
            } catch (error) {
                console.error('Error fetching product:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load product details',
                });
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProductDetails();
        }
    }, [id]);

    // Quantity handlers
    const increaseQuantity = () => setQuantity(prev => prev + 1);
    const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    // Add to cart handler
    const handleAddToCart = () => {
        addToCart({ ...product, quantity });
        Swal.fire({
            icon: 'success',
            title: 'Added to Cart',
            text: `${product.name} has been added to your cart!`,
            showConfirmButton: false,
            timer: 1500,
        });
    };

    // Buy now handler
    const handleBuyNow = () => {
        handleAddToCart();
        navigate('/checkout');
    };

    // Image slider settings
    const thumbnailSettings = {
        slidesToShow: 4,
        slidesToScroll: 1,
        focusOnSelect: true,
        vertical: false,
        verticalSwiping: false,
        infinite: false,
        responsive: [
            {
                breakpoint: 768,
                settings: { slidesToShow: 4 }
            },
            {
                breakpoint: 480,
                settings: { slidesToShow: 3 }
            }
        ]
    };

    // Loading state
    if (loading) {
        return (
            <div className="loader-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

    // Product not found
    if (!product) {
        return (
            <div className="container my-8">
                <div className="text-center py-8">
                    <h2>Product Not Found</h2>
                    <Link to="/" className="btn btn-primary mt-4">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const images = product.images || [];
    const discount = product.old_price
        ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
        : 0;

    return (
        <div className="single-product-page">
            {/* Breadcrumb */}
            <section className="breadcrumb-section py-4 bg-light">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item">
                                <Link to="/">Home</Link>
                            </li>
                            <li className="breadcrumb-item">
                                <Link to="/shop">Shop</Link>
                            </li>
                            {product.categories?.[0] && (
                                <li className="breadcrumb-item">
                                    <Link to={`/categories/${product.categories[0].slug}`}>
                                        {product.categories[0].name}
                                    </Link>
                                </li>
                            )}
                            <li className="breadcrumb-item active" aria-current="page">
                                {product.name}
                            </li>
                        </ol>
                    </nav>
                </div>
            </section>

            {/* Product Details Section */}
            <section className="product-details-section py-6 py-lg-8">
                <div className="container">
                    <div className="row g-4">
                        {/* Product Images */}
                        <div className="col-lg-6">
                            <div className="product-images-wrapper">
                                {/* Main Image */}
                                <div className="main-image-container mb-3">
                                    {discount > 0 && (
                                        <span className="discount-badge">{discount}% OFF</span>
                                    )}
                                    <img
                                        src={
                                            images[selectedImage]
                                                ? fetchImagePathFromENV() + images[selectedImage]
                                                : 'https://via.placeholder.com/600x600?text=No+Image'
                                        }
                                        alt={product.name}
                                        className="img-fluid rounded"
                                    />
                                </div>

                                {/* Thumbnail Images */}
                                {images.length > 1 && (
                                    <div className="thumbnail-slider">
                                        <Slider {...thumbnailSettings}>
                                            {images.map((img, index) => (
                                                <div key={index} className="thumbnail-item px-2">
                                                    <img
                                                        src={fetchImagePathFromENV() + img}
                                                        alt={`${product.name} ${index + 1}`}
                                                        className={`img-fluid rounded cursor-pointer ${selectedImage === index ? 'active' : ''}`}
                                                        onClick={() => setSelectedImage(index)}
                                                    />
                                                </div>
                                            ))}
                                        </Slider>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="col-lg-6">
                            <div className="product-info-wrapper">
                                {/* Category */}
                                {product.categories?.[0] && (
                                    <Link
                                        to={`/categories/${product.categories[0].slug}`}
                                        className="product-category text-decoration-none"
                                    >
                                        {product.categories[0].name}
                                    </Link>
                                )}

                                {/* Product Title */}
                                <h1 className="product-title mt-2 mb-3">{product.name}</h1>

                                {/* Rating */}
                                <div className="product-rating mb-3">
                                    <div className="d-flex align-items-center">
                                        <div className="stars text-warning me-2">
                                            <i className="bi bi-star-fill"></i>
                                            <i className="bi bi-star-fill"></i>
                                            <i className="bi bi-star-fill"></i>
                                            <i className="bi bi-star-fill"></i>
                                            <i className="bi bi-star-half"></i>
                                        </div>
                                        <span className="rating-text">4.5 (128 reviews)</span>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="product-price mb-4">
                                    <span className="current-price">₹{parseFloat(product.price).toFixed(2)}</span>
                                    {product.old_price && parseFloat(product.old_price) > 0 && (
                                        <>
                                            <span className="original-price ms-2">
                                                ₹{parseFloat(product.old_price).toFixed(2)}
                                            </span>
                                            <span className="save-badge ms-2">
                                                Save ₹{(product.old_price - product.price).toFixed(2)}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Stock Status */}
                                <div className="stock-status mb-4">
                                    {product.qty > 0 ? (
                                        <span className="badge bg-success">
                                            <i className="bi bi-check-circle me-1"></i>
                                            In Stock ({product.qty} available)
                                        </span>
                                    ) : (
                                        <span className="badge bg-danger">
                                            <i className="bi bi-x-circle me-1"></i>
                                            Out of Stock
                                        </span>
                                    )}
                                </div>

                                {/* Quantity Selector */}
                                <div className="quantity-section mb-4">
                                    <label className="form-label fw-semibold">Quantity:</label>
                                    <div className="quantity-controls d-flex align-items-center">
                                        <button
                                            className="btn btn-outline-secondary qty-btn"
                                            onClick={decreaseQuantity}
                                        >
                                            <i className="bi bi-dash"></i>
                                        </button>
                                        <input
                                            type="number"
                                            className="form-control qty-input mx-2"
                                            value={quantity}
                                            readOnly
                                        />
                                        <button
                                            className="btn btn-outline-secondary qty-btn"
                                            onClick={increaseQuantity}
                                        >
                                            <i className="bi bi-plus"></i>
                                        </button>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="product-actions mb-4">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <button
                                                className="btn btn-primary w-100 btn-lg"
                                                onClick={handleAddToCart}
                                                disabled={product.qty <= 0}
                                            >
                                                <i className="bi bi-cart-plus me-2"></i>
                                                Add to Cart
                                            </button>
                                        </div>
                                        <div className="col-md-6">
                                            <button
                                                className="btn btn-success w-100 btn-lg"
                                                onClick={handleBuyNow}
                                                disabled={product.qty <= 0}
                                            >
                                                <i className="bi bi-lightning-fill me-2"></i>
                                                Buy Now
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <button className="btn btn-outline-secondary w-100">
                                            <i className="bi bi-heart me-2"></i>
                                            Add to Wishlist
                                        </button>
                                    </div>
                                </div>

                                {/* Product Features */}
                                <div className="product-features">
                                    <div className="row g-3">
                                        <div className="col-6">
                                            <div className="feature-item">
                                                <i className="bi bi-truck text-primary me-2"></i>
                                                <span>Free Delivery</span>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="feature-item">
                                                <i className="bi bi-arrow-repeat text-primary me-2"></i>
                                                <span>Easy Returns</span>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="feature-item">
                                                <i className="bi bi-shield-check text-primary me-2"></i>
                                                <span>Secure Payment</span>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="feature-item">
                                                <i className="bi bi-clock-history text-primary me-2"></i>
                                                <span>10 Min Delivery</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Accordion Section */}
            <section className="product-accordion-section py-6 bg-light">
                <div className="container">
                    <div className="accordion" id="productAccordion">
                        {/* Description Accordion Item */}
                        <div className="accordion-item">
                            <h2 className="accordion-header" id="headingDescription">
                                <button
                                    className="accordion-button"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target="#collapseDescription"
                                    aria-expanded="true"
                                    aria-controls="collapseDescription"
                                >
                                    <i className="bi bi-file-text me-2"></i>
                                    Description
                                </button>
                            </h2>
                            <div
                                id="collapseDescription"
                                className="accordion-collapse collapse show"
                                aria-labelledby="headingDescription"
                                data-bs-parent="#productAccordion"
                            >
                                <div className="accordion-body">
                                    <h5 className="mb-3">Product Description</h5>
                                    {product.description ? (
                                        <div
                                            className="text-muted mb-4"
                                            dangerouslySetInnerHTML={{ __html: product.description }}
                                        />
                                    ) : (
                                        <p className="text-muted">No description available for this product.</p>
                                    )}
                                    <ul className="product-highlights list-unstyled">
                                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Fresh and high-quality product</li>
                                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Sourced from trusted suppliers</li>
                                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Carefully packaged for freshness</li>
                                        <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>100% authentic and verified</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Additional Information Accordion Item */}
                        <div className="accordion-item">
                            <h2 className="accordion-header" id="headingAdditional">
                                <button
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target="#collapseAdditional"
                                    aria-expanded="false"
                                    aria-controls="collapseAdditional"
                                >
                                    <i className="bi bi-info-circle me-2"></i>
                                    Additional Information
                                </button>
                            </h2>
                            <div
                                id="collapseAdditional"
                                className="accordion-collapse collapse"
                                aria-labelledby="headingAdditional"
                                data-bs-parent="#productAccordion"
                            >
                                <div className="accordion-body">
                                    <table className="table table-bordered mb-0">
                                        <tbody>
                                            <tr>
                                                <td className="fw-semibold" style={{ width: '30%' }}>Weight</td>
                                                <td>{product.weight || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-semibold">SKU</td>
                                                <td>{product.sku || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-semibold">Barcode</td>
                                                <td>{product.barcode || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-semibold">Category</td>
                                                <td>{product.categories?.[0]?.name || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-semibold">Brand</td>
                                                <td>{product.brand?.name || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-semibold">Stock Status</td>
                                                <td>
                                                    {product.qty > 0 ? (
                                                        <span className="badge bg-success">In Stock</span>
                                                    ) : (
                                                        <span className="badge bg-danger">Out of Stock</span>
                                                    )}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Reviews Accordion Item */}
                        <div className="accordion-item">
                            <h2 className="accordion-header" id="headingReviews">
                                <button
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target="#collapseReviews"
                                    aria-expanded="false"
                                    aria-controls="collapseReviews"
                                >
                                    <i className="bi bi-star me-2"></i>
                                    Customer Reviews (128)
                                </button>
                            </h2>
                            <div
                                id="collapseReviews"
                                className="accordion-collapse collapse"
                                aria-labelledby="headingReviews"
                                data-bs-parent="#productAccordion"
                            >
                                <div className="accordion-body">
                                    {/* Review Summary */}
                                    <div className="review-summary mb-4 p-4 bg-white rounded shadow-sm">
                                        <div className="row align-items-center">
                                            <div className="col-md-4 text-center border-end">
                                                <div className="average-rating">
                                                    <h2 className="mb-0 display-4">4.5</h2>
                                                    <div className="stars text-warning mb-2 fs-5">
                                                        <i className="bi bi-star-fill"></i>
                                                        <i className="bi bi-star-fill"></i>
                                                        <i className="bi bi-star-fill"></i>
                                                        <i className="bi bi-star-fill"></i>
                                                        <i className="bi bi-star-half"></i>
                                                    </div>
                                                    <p className="text-muted mb-0">Based on 128 reviews</p>
                                                </div>
                                            </div>
                                            <div className="col-md-8">
                                                <div className="rating-bars">
                                                    {[5, 4, 3, 2, 1].map(star => (
                                                        <div key={star} className="d-flex align-items-center mb-2">
                                                            <span className="me-2" style={{ minWidth: '40px' }}>{star} ★</span>
                                                            <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                                                                <div
                                                                    className="progress-bar bg-warning"
                                                                    style={{ width: `${star * 20}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-muted" style={{ minWidth: '45px' }}>{star * 20}%</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Individual Reviews */}
                                    <div className="reviews-list">
                                        {[1, 2, 3].map(review => (
                                            <div key={review} className="review-item p-3 bg-white rounded mb-3 border">
                                                <div className="d-flex justify-content-between mb-2">
                                                    <div>
                                                        <h6 className="mb-1 fw-bold">Customer Name</h6>
                                                        <div className="stars text-warning">
                                                            <i className="bi bi-star-fill"></i>
                                                            <i className="bi bi-star-fill"></i>
                                                            <i className="bi bi-star-fill"></i>
                                                            <i className="bi bi-star-fill"></i>
                                                            <i className="bi bi-star-fill"></i>
                                                        </div>
                                                    </div>
                                                    <small className="text-muted">2 days ago</small>
                                                </div>
                                                <p className="mb-0 text-muted">
                                                    Great product! Fresh and delivered on time. Highly recommend this to everyone.
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Write Review Button */}
                                    <div className="text-center mt-4">
                                        <button className="btn btn-primary">
                                            <i className="bi bi-pencil-square me-2"></i>
                                            Write a Review
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Products */}
            {product?.categories?.[0]?.slug && (
                <section className="related-products-section py-6">
                    <div className="container">
                        <ProductCarousel
                            title="Related Products"
                            categorySlug={product.categories[0].slug}
                            limit={8}
                        />
                    </div>
                </section>
            )}
        </div>
    );
};

export default SingleProduct;
