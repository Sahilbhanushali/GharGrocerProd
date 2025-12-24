import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCategoryGroupDetailsById } from '../../api/helpers/fetchCategoryGroups.js';
import { fetchProductsByCategorySlug } from '../../api/helpers/fetchProducts.js';
import { fetchImagePathFromENV } from '../../api/helpers/fetcheImagesPathFromENV';
import { useCartStore } from '../../stores/useCartStore';
import { MagnifyingGlass } from 'react-loader-spinner';
import Swal from 'sweetalert2';
import './css/categoryGroup.css';

// Skeleton Components
const ProductCardSkeleton = () => (
  <div className="product-card skeleton">
    <div className="product-image skeleton-image"></div>
    <div className="product-details">
      <div className="skeleton-text long"></div>
      <div className="skeleton-text short"></div>
      <div className="product-footer">
        <div className="skeleton-text price"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  </div>
);

const CategoryGroupPage = () => {
  const { id } = useParams();
  const addToCart = useCartStore((state) => state.addToCart);

  const [categoryGroupName, setCategoryGroupName] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsInitialLoading, setProductsInitialLoading] = useState(true);

  const [productsPage, setProductsPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);

  const productsEndRef = useRef(null);
  const productsObserverRef = useRef(null);
  const categoryScrollRef = useRef(null);

  // Load more products function
  const loadMoreProducts = useCallback(async () => {
    if (productsLoading || productsInitialLoading || !hasMoreProducts || !selectedCategory) return;

    setProductsLoading(true);
    try {
      const nextPage = productsPage + 1;
      const response = await fetchProductsByCategorySlug(selectedCategory.slug, nextPage);
      
      if (response && response.data) {
        const productsData = response.data.data || [];
        const pagination = response.data;
        
        setProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNew = productsData.filter(p => p && !existingIds.has(p.id));
          return [...prev, ...uniqueNew];
        });

        setProductsPage(nextPage);
        
        const hasMore = pagination.current_page < pagination.last_page;
        setHasMoreProducts(hasMore);
        
        if (!hasMore && productsObserverRef.current) {
          productsObserverRef.current.disconnect();
        }
      } else {
        setHasMoreProducts(false);
      }
    } catch (error) {
      console.error("Error loading more products:", error);
      setHasMoreProducts(false);
    } finally {
      setProductsLoading(false);
    }
  }, [productsLoading, productsInitialLoading, hasMoreProducts, productsPage, selectedCategory]);

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const response = await fetchCategoryGroupDetailsById(id, 1);
        
        if (response) {
          const categoryItems = response || [];
          const extractedCategories = categoryItems.map(item => item.category);
          setCategories(extractedCategories);
          
          if (extractedCategories.length > 0) {
            setCategoryGroupName(extractedCategories[0]?.category_group?.name || 'Categories');
            setSelectedCategory(extractedCategories[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching category group:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load category group',
          confirmButtonColor: '#0aad0a',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id]);

  // Fetch products when category changes
  useEffect(() => {
    if (!selectedCategory) return;

    const fetchProductsData = async () => {
      setProducts([]);
      setProductsPage(1);
      setHasMoreProducts(true);
      setProductsInitialLoading(true);

      try {
        const response = await fetchProductsByCategorySlug(selectedCategory.slug, 1);
        
        if (response) {
          const productsData = response.data || [];
          const pagination = response;
          
          setProducts(productsData);
          
          const hasMore = pagination.current_page < pagination.last_page;
          setHasMoreProducts(hasMore);
        } else {
          setProducts([]);
          setHasMoreProducts(false);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        setHasMoreProducts(false);
      } finally {
        setProductsInitialLoading(false);
        setProductsLoading(false);
      }
    };

    fetchProductsData();
  }, [selectedCategory]);

  // IntersectionObserver for products
  useEffect(() => {
    if (productsLoading || productsInitialLoading || !hasMoreProducts || !selectedCategory) return;

    if (productsObserverRef.current) {
      productsObserverRef.current.disconnect();
    }

    productsObserverRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const currentRef = productsEndRef.current;
    if (currentRef && hasMoreProducts && !productsLoading && !productsInitialLoading) {
      productsObserverRef.current.observe(currentRef);
    }

    return () => {
      if (productsObserverRef.current) {
        productsObserverRef.current.disconnect();
      }
    };
  }, [hasMoreProducts, productsLoading, productsInitialLoading, selectedCategory, loadMoreProducts]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    Swal.fire({
      icon: 'success',
      title: 'Added!',
      text: `${product.name} added to cart`,
      timer: 1000,
      showConfirmButton: false,
    });
  };

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = 200;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <MagnifyingGlass visible={true} height="100" width="100" glassColor="#c0efff" color="#0aad0a" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="container my-8 text-center">
        <h3>No Categories Found</h3>
        <Link to="/" className="btn btn-primary mt-3">Back to Home</Link>
      </div>
    );
  }

  return (
   <div className='container'>
    <div className="category-group-page">
      {/* Header */}
      <div className="category-header">
        <div className="container-fluid">
          <div className="header-content">
            <Link to="/" className="back-button">
              <i className="bi bi-arrow-left"></i>
            </Link>
            <div className="header-text">
              <h1 className="category-title">{categoryGroupName}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Category Filter */}
      <div className="category-filter-wrapper">
        <div className="container-fluid">
          <div className="category-filter-container">
            <button 
              className="scroll-button left" 
              onClick={() => scrollCategories('left')}
              aria-label="Scroll left"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            
            <div className="category-filter-scroll" ref={categoryScrollRef}>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`category-filter-item ${selectedCategory?.id === category.id ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="category-filter-image">
                    <img
                      src={fetchImagePathFromENV() + category.image}
                      alt={category.name}
                      onError={(e) => (e.target.src = 'https://via.placeholder.com/60x60?text=Cat')}
                    />
                  </div>
                  <span className="category-filter-name">{category.name}</span>
                </button>
              ))}
            </div>

            <button 
              className="scroll-button right" 
              onClick={() => scrollCategories('right')}
              aria-label="Scroll right"
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="products-wrapper">
        <div className="container-fluid">
          {selectedCategory && (
            <div className="products-header">
              <h2 className="products-title">{selectedCategory.name}</h2>
              <p className="products-count">
                {products.length} {products.length === 1 ? 'product' : 'products'}
              </p>
            </div>
          )}

          {productsInitialLoading ? (
            <div className="products-grid">
              {Array(8).fill().map((_, i) => (
                <ProductCardSkeleton key={`skeleton-${i}`} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-inbox"></i>
              <h4>No products found</h4>
              <p>This category is empty</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => {
                if (!product) return null;
                
                const discount = product.old_price
                  ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
                  : 0;

                return (
                  <div key={product.id} className="product-card">
                    {discount > 0 && <div className="discount-badge">{discount}% OFF</div>}

                    <Link to={`/single-product/${product.id}`} className="product-image-link">
                      <img
                        src={product.images?.[0] ? fetchImagePathFromENV() + product.images[0] : 'https://via.placeholder.com/200x200?text=Product'}
                        alt={product.name}
                        className="product-image"
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/200x200?text=Product')}
                      />
                    </Link>

                    <div className="product-details">
                      <div className="delivery-time">
                        <i className="bi bi-lightning-fill"></i>
                        <span>9 mins</span>
                      </div>

                      <Link to={`/single-product/${product.id}`} className="product-name">
                        {product.name}
                      </Link>

                      {product.unit_value && (
                        <p className="product-weight">{product.unit_value} {product.unit}</p>
                      )}

                      <div className="product-footer">
                        <div className="product-price">
                          <span className="current-price">₹{parseFloat(product.price).toFixed(0)}</span>
                          {product.old_price > 0 && (
                            <span className="old-price">₹{parseFloat(product.old_price).toFixed(0)}</span>
                          )}
                        </div>

                        <button
                          className="btn-add"
                          onClick={() => handleAddToCart(product)}
                          disabled={product.qty <= 0}
                        >
                          {product.qty <= 0 ? 'Out of Stock' : 'ADD'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {productsLoading && (
                <>
                  <ProductCardSkeleton />
                  <ProductCardSkeleton />
                  <ProductCardSkeleton />
                  <ProductCardSkeleton />
                </>
              )}

              {hasMoreProducts && !productsLoading && (
                <div ref={productsEndRef} style={{ height: '20px', gridColumn: '1/-1' }} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default CategoryGroupPage;   