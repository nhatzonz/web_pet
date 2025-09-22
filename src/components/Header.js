import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../assets/css/header.css';
import { API_BASE } from './Api_base';
import api from './axios-conf';

export default function Header() {
    const [shopInfo, setShopInfo] = useState(null);
    const [categories, setCategories] = useState([]);
    const [showCategoryMenu, setShowCategoryMenu] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [allProducts, setAllProducts] = useState([]);
    const [headerCategories, setHeaderCategories] = useState([]);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [shopInfoRes, categoriesRes, productsRes] = await Promise.all([
                    api.get('/api/shopInfo'),
                    api.get('/api/categories'),
                    api.get('/api/products'),
                ]);
                setShopInfo(shopInfoRes.data);
                setCategories(categoriesRes.data || []);
                setAllProducts(productsRes.data || []);
                setHeaderCategories(categoriesRes.data.slice(0, 3) || []);
            } catch (err) {
                console.error('Lỗi fetch data:', err);
            }
        };
        fetchData();
    }, []);

    // Search functionality
    useEffect(() => {
        if (searchTerm.length > 0) {
            const suggestions = allProducts
                .filter(
                    (product) =>
                        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (product.code && product.code.toLowerCase().includes(searchTerm.toLowerCase())),
                )
                .slice(0, 5);
            setSearchSuggestions(suggestions);
            setShowSuggestions(true);
        } else {
            setSearchSuggestions([]);
            setShowSuggestions(false);
        }
    }, [searchTerm, allProducts]);

    const handleHeaderSearch = (term) => {
        if (term.length > 0) {
            navigate(`/products?search=${encodeURIComponent(term)}`);
        } else {
            navigate('/products');
        }
        setSearchTerm('');
        setShowSuggestions(false);
    };

    const handleSuggestionClick = (product) => {
        navigate(`/product/${product.id}`);
        setSearchTerm('');
        setShowSuggestions(false);
    };

    const toggleMobileMenu = () => {
        setShowMobileMenu(!showMobileMenu);
    };

    const closeMobileMenu = () => {
        setShowMobileMenu(false);
    };

    const handleMobileNavigation = (path) => {
        navigate(path);
        closeMobileMenu();
    };

    return (
        <>
            {/* PC Header */}
            <div className="header">
                <div className="header-item">
                    <a style={{ display: 'flex', flex: 1, justifyContent: 'center' }} href="/trang-chu">
                        <img
                            style={{ cursor: 'pointer' }}
                            src={`${API_BASE}${shopInfo?.logo_image}`}
                            alt="logo"
                            className="header-logo"
                        />
                    </a>
                    <div className="header-search-container">
                        <div className="header-search-box">
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                className="header-search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleHeaderSearch(searchTerm)}
                            />
                            <button className="header-search-button" onClick={() => handleHeaderSearch(searchTerm)}>
                                <i className="fa-solid fa-search"></i>
                            </button>

                            {showSuggestions && searchSuggestions.length > 0 && (
                                <div className="header-search-suggestions">
                                    {searchSuggestions.map((product) => (
                                        <div
                                            key={product.id}
                                            className="header-suggestion-item"
                                            onClick={() => handleSuggestionClick(product)}
                                        >
                                            <img
                                                src={`${API_BASE}${
                                                    product.images?.[0]?.image_url || '/placeholder.jpg'
                                                }`}
                                                alt={product.name}
                                                className="header-suggestion-image"
                                            />
                                            <div className="header-suggestion-info">
                                                <div className="header-suggestion-name">{product.name}</div>
                                                <div className="header-suggestion-code">
                                                    Mã: {product.code || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', flex: 1, justifyContent: 'center' }}>
                        <NavLink
                            className="header-admin-button"
                            to="/admin/login"
                            style={{
                                '&:hover': {
                                    background: 'red',
                                },
                            }}
                        >
                            Admin
                        </NavLink>
                    </div>
                </div>
                <div className="header-item">
                    <div
                        className="header-category"
                        onMouseEnter={() => setShowCategoryMenu(true)}
                        onMouseLeave={() => setShowCategoryMenu(false)}
                    >
                        <i className="fa-solid fa-bars color-yellow"></i>
                        {/* <p className="header-link">Danh mục bánh sinh nhật</p> */}
                        <p className="header-link">Danh mục Thú Cưng 🐶</p>
                        <i className="fa-solid fa-caret-down color-yellow"></i>

                        {showCategoryMenu && (
                            <div className="category-submenu">
                                {categories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="category-submenu-item"
                                        onClick={() => navigate(`/products?category=${category.id}`)}
                                    >
                                        {category.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <NavLink to="/trang-chu" className="header-link">
                        Trang chủ
                    </NavLink>
                    <NavLink to="/products" className="header-link">
                        {/* Bánh sinh nhật */}
                        Thú Cưng - Pets yêu 🐶
                    </NavLink>
                    {!token &&
                        headerCategories.map((category) => (
                            <NavLink to={`/products?category=${category.id}`} className="header-link">
                                {category.name}
                            </NavLink>
                        ))}
                    {token && (
                        <>
                            <NavLink to="/admin/upload" className="header-link">
                                Tải Banner
                            </NavLink>

                            <NavLink to="/admin/shop-info" className="header-link">
                                Thông tin cửa hàng
                            </NavLink>

                            <NavLink to="/admin/categories" className="header-link">
                                Danh mục
                            </NavLink>
                            <NavLink to="/admin/products" className="header-link">
                                Sản phẩm Admin
                            </NavLink>
                            <NavLink to="/admin/orders" className="header-link">
                                Đơn hàng
                            </NavLink>
                            <NavLink to="/admin/request-calls" className="header-link">
                                Yêu cầu gọi lại
                            </NavLink>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Header */}
            <div className="mobile-header">
                <div className="mobile-header-content">
                    <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                        <i className="fa-solid fa-bars"></i>
                    </button>

                    <img
                        src={shopInfo?.logo_image ? `${API_BASE}${shopInfo.logo_image}` : '/default-logo.png'}
                        alt="logo"
                        className="mobile-logo"
                    />
                </div>
                <div className="mobile-search-container">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        className="mobile-search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleHeaderSearch(searchTerm)}
                    />
                    <button className="mobile-search-button" onClick={() => handleHeaderSearch(searchTerm)}>
                        <i className="fa-solid fa-search"></i>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {showMobileMenu && <div className="mobile-menu-overlay show" onClick={closeMobileMenu}></div>}
            <div className={`mobile-menu ${showMobileMenu ? 'show open' : ''}`}>
                <div className="mobile-menu-header">
                    <img
                        src={shopInfo?.logo_image ? `${API_BASE}${shopInfo.logo_image}` : '/default-logo.png'}
                        alt="logo"
                        style={{ height: '40px' }}
                    />
                    <button className="mobile-menu-close" onClick={closeMobileMenu}>
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>

                <div className="mobile-menu-content">
                    <div className="mobile-menu-section">
                        <h3>Trang chủ</h3>
                        <a className="mobile-menu-link" onClick={() => handleMobileNavigation('/trang-chu')}>
                            <i className="fa-solid fa-home" style={{ marginRight: '10px' }}></i>
                            Trang chủ
                        </a>
                    </div>

                    <div className="mobile-menu-section">
                        <h3>Danh mục sản phẩm</h3>
                        <a className="mobile-menu-link" onClick={() => handleMobileNavigation('/products')}>
                            <i className="fa-solid fa-th-large" style={{ marginRight: '10px' }}></i>
                            Tất cả sản phẩm
                        </a>
                        {categories.map((category) => (
                            <a
                                key={category.id}
                                className="mobile-menu-link"
                                onClick={() => handleMobileNavigation(`/products?category=${category.id}`)}
                            >
                                <i className="fa-solid fa-cake-candles" style={{ marginRight: '10px' }}></i>
                                {category.name}
                            </a>
                        ))}
                    </div>

                    {token && (
                        <div className="mobile-menu-section">
                            <h3>Quản trị</h3>
                            <a className="mobile-menu-link" onClick={() => handleMobileNavigation('/admin/upload')}>
                                <i className="fa-solid fa-upload" style={{ marginRight: '10px' }}></i>
                                Tải Banner
                            </a>
                            <a className="mobile-menu-link" onClick={() => handleMobileNavigation('/admin/shop-info')}>
                                <i className="fa-solid fa-store" style={{ marginRight: '10px' }}></i>
                                Thông tin cửa hàng
                            </a>
                            <a className="mobile-menu-link" onClick={() => handleMobileNavigation('/admin/categories')}>
                                <i className="fa-solid fa-list" style={{ marginRight: '10px' }}></i>
                                Danh mục
                            </a>
                            <a className="mobile-menu-link" onClick={() => handleMobileNavigation('/admin/products')}>
                                <i className="fa-solid fa-box" style={{ marginRight: '10px' }}></i>
                                Sản phẩm Admin
                            </a>
                            <a className="mobile-menu-link" onClick={() => handleMobileNavigation('/admin/orders')}>
                                <i className="fa-solid fa-receipt" style={{ marginRight: '10px' }}></i>
                                Đơn hàng
                            </a>
                            <a
                                className="mobile-menu-link"
                                onClick={() => handleMobileNavigation('/admin/request-calls')}
                            >
                                <i className="fa-solid fa-phone" style={{ marginRight: '10px' }}></i>
                                Yêu cầu gọi lại
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
