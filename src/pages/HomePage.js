import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/homepage.css';
import { API_BASE } from '../components/Api_base';
import api from '../components/axios-conf';

export default function HomePage() {
    const navigate = useNavigate();
    const [banners, setBanners] = useState([]);
    const [subBanners, setSubBanners] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const timerRef = useRef(null);
    const [shopInfo, setShopInfo] = useState([]);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState({});
    const [pageSize, setPageSize] = useState(5);
    const [currentPage, setCurrentPage] = useState({});
    useEffect(() => {
        // document.title = 'Trang chủ | Web Cake 🍰';
        document.title = 'Trang chủ | Web Thú Cưng 🐶';
    }, []);

    const visibleBanners = useMemo(() => banners || [], [banners]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bannersRes, shopRes, categoriesRes] = await Promise.all([
                    api.get(`${API_BASE}/api/banners`),
                    api.get(`${API_BASE}/api/shopInfo`),
                    api.get(`${API_BASE}/api/categories`),
                ]);

                // Xử lý banners
                const sorted = [...(bannersRes.data || [])].sort((a, b) => {
                    if (a.sort_order === b.sort_order) {
                        return 0;
                    }
                    return a.sort_order - b.sort_order;
                });
                const filtered1 = (sorted || []).filter((b) => b.isSubBanner === false);
                const filtered2 = (sorted || []).filter((b) => b.isSubBanner === true);
                setSubBanners(filtered2 || []);
                setBanners(filtered1 || []);
                setShopInfo(shopRes.data || []);
                setCategories(categoriesRes.data || []);
            } catch (err) {
                console.error('Lỗi fetch data:', err);
            }
        };
        fetchData();
    }, []);

    // Fetch products for each category
    useEffect(() => {
        const fetchProductsByCategory = async () => {
            if (!categories.length) return;

            try {
                const productPromises = categories.map(async (category) => {
                    const res = await api.get(`${API_BASE}/api/products?category_id=${category.id}`);
                    return { categoryId: category.id, products: res.data || [] };
                });

                const results = await Promise.all(productPromises);
                const productsMap = {};
                const pageMap = {};
                results.forEach(({ categoryId, products }) => {
                    productsMap[categoryId] = products;
                    pageMap[categoryId] = 1;
                });
                setProducts(productsMap);
                setCurrentPage(pageMap);
            } catch (err) {
                console.error('Lỗi fetch products:', err);
            }
        };

        fetchProductsByCategory();
    }, [categories]);

    useEffect(() => {
        if (!visibleBanners.length) return;
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev === visibleBanners.length - 1 ? 0 : prev + 1));
        }, 4000);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [visibleBanners.length]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === visibleBanners.length - 1 ? 0 : prev + 1));
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? visibleBanners.length - 1 : prev - 1));
    };

    const handleDot = (idx) => setCurrentIndex(idx);

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    return (
        <div className="home">
            <div className="slider">
                <div className="slides" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                    {visibleBanners.map((banner) => (
                        <div key={banner.id} className="slide">
                            <img
                                className="slide-image"
                                src={`${API_BASE}${banner.image_url}`}
                                alt={banner.title || 'banner'}
                            />
                        </div>
                    ))}
                </div>

                {visibleBanners.length > 1 && (
                    <>
                        <button className="nav prev" onClick={handlePrev} aria-label="Prev">
                            ‹
                        </button>
                        <button className="nav next" onClick={handleNext} aria-label="Next">
                            ›
                        </button>
                        <div className="dots">
                            {visibleBanners.map((_, i) => (
                                <button
                                    key={i}
                                    className={`dot ${i === currentIndex ? 'active' : ''}`}
                                    onClick={() => handleDot(i)}
                                    aria-label={`Go to slide ${i + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="sub-banners-container">
                <div className="sub-banners">
                    {subBanners.map((banner) => (
                        <div key={banner.id} className="sub-item-banner">
                            <img
                                className="sub-item-banner-image"
                                src={`${API_BASE}${banner.image_url}`}
                                alt={banner.title || 'banner'}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <p className="shop-info-name">THÚ CƯNG - PETS YÊU 🐶 {shopInfo.name}</p>

            {/* Products by Category */}
            <div className="products-section">
                {categories.map((category) => {
                    const allProducts = products[category.id] || [];
                    if (allProducts.length === 0) return;
                    const page = currentPage[category.id] || 1;
                    const startIndex = (page - 1) * pageSize;
                    const endIndex = startIndex + pageSize;
                    const paginatedProducts = allProducts.slice(startIndex, endIndex);

                    return (
                        <div key={category.id} className="category-section">
                            <div className="category-header">
                                <a
                                    className="category-title"
                                    onClick={() => navigate(`/products?category=${category.id}`)}
                                >
                                    {category.name}
                                </a>
                                <div className="pagination-buttons">
                                    <button
                                        disabled={page === 1}
                                        onClick={() =>
                                            setCurrentPage((prev) => ({
                                                ...prev,
                                                [category.id]: Math.max(1, page - 1),
                                            }))
                                        }
                                    >
                                        <i className="fa-solid fa-chevron-left color-yellow"></i>
                                    </button>
                                    <span>{page}</span>
                                    <button
                                        disabled={endIndex >= allProducts.length}
                                        onClick={() =>
                                            setCurrentPage((prev) => ({
                                                ...prev,
                                                [category.id]: page + 1,
                                            }))
                                        }
                                    >
                                        <i className="fa-solid fa-chevron-right color-yellow"></i>
                                    </button>
                                </div>
                            </div>

                            <div className="products-grid">
                                {paginatedProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="product-card"
                                        onClick={() => handleProductClick(product.id)}
                                    >
                                        <div className="product-image-container">
                                            <img
                                                src={`${API_BASE}${
                                                    product.images?.[0]?.image_url || '/placeholder.jpg'
                                                }`}
                                                alt={product.name}
                                                className="product-image"
                                            />
                                        </div>
                                        <div className="product-info">
                                            <h3 className="product-name">{product.name}</h3>
                                            <p className="product-code">{product.code}</p>
                                            <p className="product-price">
                                                {formatPrice(product.price) || 'Giá liên hệ'}
                                            </p>
                                            <button className="order-btn">Đặt hàng</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                                <button
                                    className="home-view-all-products"
                                    onClick={() => navigate(`/products?category=${category.id}`)}
                                >
                                    Xem toàn bộ
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
