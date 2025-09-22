import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../assets/css/detailproduct.css';
import { API_BASE } from '../components/Api_base';
import api from '../components/axios-conf';

export default function DetailProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [zoomOrigin, setZoomOrigin] = useState({ x: '50%', y: '50%' });
    const [related, setRelated] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [selectedByAttrId, setSelectedByAttrId] = useState({}); // {attribute_id: valueObj}
    const [shopInfo, setShopInfo] = useState(null);
    const [phoneRequestCall, setPhoneRequestCall] = useState('');
    const [productSections, setProductSections] = useState([]);
    const [isSectionsExpanded, setIsSectionsExpanded] = useState(false); // Track if sections are expanded
    const [isImageModalOpen, setIsImageModalOpen] = useState(false); // Track if image modal is open
    useEffect(() => {
        // document.title = 'Chi tiết sản phẩm | Web Cake 🍰';
        document.title = 'Chi tiết sản phẩm | Web Teddy 🐻';
    }, []);
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const [res, res2, res3] = await Promise.all([
                    api.get(`${API_BASE}/api/products/${id}`),
                    api.get(`${API_BASE}/api/shopInfo`),
                    api.get(`${API_BASE}/api/product-sections/product/${id}`),
                ]);
                setProduct(res.data);
                setShopInfo(res2.data);
                setProductSections(res3.data || []);
                const imgs = res.data?.images || [];
                const mainIdx = Math.max(
                    0,
                    imgs.findIndex((i) => i.is_main),
                );
                setSelectedImageIndex(mainIdx === -1 ? 0 : mainIdx);
            } catch (err) {
                console.error('Lỗi fetch product:', err);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id, navigate]);

    // Fetch related products by category
    useEffect(() => {
        const fetchRelated = async () => {
            try {
                if (!product?.category?.id) return;
                const res = await api.get(`${API_BASE}/api/products?category_id=${product.category.id}`);
                const list = Array.isArray(res.data) ? res.data : [];
                setRelated(list.filter((p) => p.id !== product.id).slice(0, 10));
            } catch (e) {
                console.error(e);
            }
        };
        fetchRelated();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product?.category?.id, product?.id]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const handleSelectAttr = (attr) => {
        setSelectedByAttrId((prev) => ({ ...prev, [attr.product_attribute?.id]: attr }));
    };

    const calcUnitPrice = () => {
        const base = Number(product?.price || 0);
        // const extra = Object.values(selectedByAttrId).reduce((sum, v) => sum + Number(v.extra_price || 0), 0);
        return base;
        // return base + extra;
    };

    const handleOrder = () => {
        const groups = groupedAttributes;
        const requiredAttrIds = Object.values(product.product_attribute_values || [])
            .map((v) => v.product_attribute?.id)
            .filter((v, i, a) => a.indexOf(v) === i);
        const missing = requiredAttrIds.filter((id) => !selectedByAttrId[id]);
        if (missing.length > 0) {
            alert('Vui lòng chọn đầy đủ các thuộc tính!');
            return;
        }

        const unitPrice = calcUnitPrice();
        const payload = {
            product_id: product.id,
            name: product.name,
            code: product.code || '',
            category: product.category || null,
            main_image:
                (product.images || []).find((i) => i.is_main)?.image_url || (product.images || [])[0]?.image_url || '',
            attributes: Object.values(selectedByAttrId).map((v) => ({
                attribute_id: v.product_attribute?.id,
                attribute_name: v.product_attribute?.name,
                value: v.value,
                extra_price: Number(v.extra_price || 0),
            })),
            quantity,
            unit_price: unitPrice,
            total: unitPrice * quantity,
        };
        navigate('/order/create', { state: payload });
    };

    const handleRequestCall = async () => {
        if (!phoneRequestCall) {
            alert('Vui lòng nhập số điện thoại');
            return;
        }
        const payload = {
            phone: phoneRequestCall,
            note: `Yêu cầu gọi lại từ sản phẩm: ${product.name}`,
        };

        try {
            await api.post(`${API_BASE}/api/request-calls/`, payload);
            alert('Gửi yêu cầu thành công');
            setPhoneRequestCall('');
        } catch (err) {
            console.error(err);
            alert('Gửi yêu cầu thất bại');
        }
    };

    const toggleSectionsExpansion = () => {
        setIsSectionsExpanded(!isSectionsExpanded);
    };

    const hasLongContent = () => {
        return productSections.some((section) =>
            section.items.some((item) => !item.is_image && item.content.length > 200),
        );
    };

    if (loading) {
        return (
            <div className="detail-product-container">
                <div className="loading">Đang tải...</div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="detail-product-container">
                <div className="error">Không tìm thấy sản phẩm</div>
            </div>
        );
    }

    const images = product.images || [];
    const displayedImage = images[selectedImageIndex] || images.find((img) => img.is_main) || images[0];
    const groupedAttributes = (product.product_attribute_values || []).reduce((acc, attr) => {
        const key = attr.product_attribute?.name;
        if (!acc[key]) acc[key] = [];
        acc[key].push(attr);
        return acc;
    }, {});
    const groupOrder = Object.keys(groupedAttributes);
    const formatPhone = (phone) => {
        const phoneNumber = phone.toString();
        const firstPart = phoneNumber.slice(0, 4);
        const secondPart = phoneNumber.slice(4, 7);
        const thirdPart = phoneNumber.slice(7);
        return `${firstPart}.${secondPart}.${thirdPart}`;
    };
    return (
        <div className="detail-product-container">
            <div className="detail-product-content">
                <div className="product-images">
                    <div
                        className="main-image"
                        onMouseMove={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = ((e.clientX - rect.left) / rect.width) * 100;
                            const y = ((e.clientY - rect.top) / rect.height) * 100;
                            setZoomOrigin({ x: `${x}%`, y: `${y}%` });
                        }}
                        onClick={() => setIsImageModalOpen(true)}
                        style={{ cursor: 'pointer' }}
                    >
                        <img
                            src={`${API_BASE}${displayedImage?.image_url || '/placeholder.jpg'}`}
                            alt={product.name}
                            style={{ transformOrigin: `${zoomOrigin.x} ${zoomOrigin.y}` }}
                        />
                    </div>
                    {images.length > 1 && (
                        <div className="thumbnail-images">
                            {images.map((img, index) => (
                                <img
                                    key={img.id}
                                    src={`${API_BASE}${img.image_url}`}
                                    alt={`${product.name} ${index + 1}`}
                                    className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                                    onClick={() => setSelectedImageIndex(index)}
                                />
                            ))}
                        </div>
                    )}
                    <div className="product-info">
                        <div className="info-item">
                            <strong>Danh mục:</strong> {product.category?.name || 'Chưa phân loại'}
                        </div>
                        <div className="info-item">
                            <strong>Tình trạng:</strong>
                            <span className={product.instock ? 'in-stock' : 'out-of-stock'}>
                                {product.instock ? 'Còn hàng' : 'Hết hàng'}
                            </span>
                        </div>
                    </div>
                    <div className="zalo-button-container">
                        <a
                            className="zalo-button "
                            href={`https://zalo.me/${shopInfo?.phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Liên hệ Zalo
                            <p className="zalo-button-text">{formatPhone(shopInfo?.phone)}</p>
                        </a>
                    </div>
                </div>

                <div className="product-details">
                    <h1 className="product-title">{product.name}</h1>
                    <p className="product-code">Mã sản phẩm: {product.code || ' Chưa có'}</p>
                    <div className="product-price">{formatPrice(product.price || 'Giá liên hệ')}</div>

                    {product.description && (
                        <div className="product-description">
                            <h3>Mô tả sản phẩm</h3>
                            <p>{product.description}</p>
                        </div>
                    )}

                    {Object.keys(groupedAttributes).length > 0 && (
                        <div className="product-attributes">
                            <h3>Thông tin chi tiết</h3>
                            {Object.entries(groupedAttributes).map(([attrName, values]) => (
                                <div key={attrName} className="attribute-group">
                                    <span className="attribute-title">{attrName}:</span>
                                    <div className="attribute-values">
                                        {values.map((attr) => {
                                            const isActive =
                                                selectedByAttrId[attr.product_attribute?.id]?.id === attr.id;
                                            return (
                                                <button
                                                    key={attr.id}
                                                    className={`attribute-value ${isActive ? 'active' : ''}`}
                                                    onClick={() => handleSelectAttr(attr)}
                                                    type="button"
                                                >
                                                    {attr.value}
                                                    {/* {Number(attr.extra_price) > 0 && (
                                                        <span className="attribute-extra-price">
                                                            (+{formatPrice(attr.extra_price)})
                                                        </span>
                                                    )} */}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="product-actions">
                        {/* <div className="price-summary">
                            <div>
                                Đơn giá: <strong>{formatPrice(calcUnitPrice())}</strong>
                            </div>
                            <div>
                                Thành tiền: <strong>{formatPrice(calcUnitPrice() * quantity)}</strong>
                            </div>
                        </div> */}
                        <div className="quantity-selector">
                            <label>Số lượng:</label>
                            <div className="quantity-controls">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="quantity-btn">
                                    -
                                </button>
                                <span className="quantity-value">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="quantity-btn">
                                    +
                                </button>
                            </div>
                        </div>

                        <button className="detail-product-order-btn" onClick={handleOrder}>
                            <p>Đặt hàng ngay</p>
                            <p style={{ fontSize: '0.6rem', color: '#333', marginTop: '8px' }}>
                                Freeship dưới 3km cho đơn từ 300k
                            </p>
                        </button>
                        <div
                            style={{
                                display: 'flex',
                                borderRadius: '5px',
                                overflow: 'hidden',
                                marginTop: '10px',
                            }}
                        >
                            <p
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    fontSize: '0.8rem',
                                    color: '#333',
                                    margin: 0,
                                }}
                            >
                                Yêu cầu gọi lại:
                            </p>
                            <input
                                style={{
                                    flex: 3,
                                    padding: '5px',
                                    fontSize: '0.8rem',
                                    color: '#333',
                                    border: 'none',
                                    outline: 'none',
                                    border: '1px solid #ccc',
                                    borderRadius: '5px 0 0 5px',
                                }}
                                type="text"
                                placeholder="Nhập số điện thoại"
                                value={phoneRequestCall}
                                onChange={(e) => setPhoneRequestCall(e.target.value)}
                            />
                            <button
                                style={{
                                    flex: 0.4,
                                    padding: '10px',
                                    fontSize: '0.8rem',
                                    color: '#fff',
                                    backgroundColor: 'var(--color-website)',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                                onClick={handleRequestCall}
                            >
                                Gửi
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="back-button">
                <button onClick={() => navigate(-1)} className="btn-back">
                    ← Quay lại
                </button>
            </div>

            {/* Product Sections */}
            {productSections.length > 0 && (
                <div className="product-sections">
                    <h3 className="sections-title">Mô tả chi tiết</h3>
                    <div className={`sections-content ${isSectionsExpanded ? 'expanded' : 'collapsed'}`}>
                        {[...productSections]
                            .map((s) => ({
                                ...s,
                                items: [...(s.items || [])]
                                    .map((it, idx) => ({ ...it, sort_order: Number(it.sort_order ?? idx) }))
                                    .sort((a, b) => a.sort_order - b.sort_order),
                                sort_order: Number(s.sort_order ?? 0),
                            }))
                            .sort((a, b) => a.sort_order - b.sort_order)
                            .map((section) => (
                                <div key={section.id} className="product-section">
                                    <h4 className="section-title">{section.title}</h4>
                                    {section.items.length > 0 && (
                                        <div className="section-items">
                                            {section.items?.map((item) => (
                                                <div key={item.id} className="section-item">
                                                    {item.is_image ? (
                                                        <img
                                                            src={`${API_BASE}${item.content}`}
                                                            alt={section.title}
                                                            className="section-image"
                                                        />
                                                    ) : (
                                                        (() => {
                                                            const lines = String(item.content || '')
                                                                .split(/\r?\n/)
                                                                .map((t) => t.trim())
                                                                .filter((t) => t.length > 0);
                                                            if (lines.length > 1) {
                                                                return (
                                                                    <ul className="section-bullets">
                                                                        {lines.map((line, idx) => (
                                                                            <li key={idx}>
                                                                                {line.replace(/^[-•\s]+/, '')}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                );
                                                            }
                                                            return <p className="section-text">{lines[0] || ''}</p>;
                                                        })()
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                    {productSections.length > 0 && (
                        <div className="sections-toggle-container">
                            <button className="sections-toggle-btn" onClick={toggleSectionsExpansion}>
                                {isSectionsExpanded ? (
                                    <>
                                        <i className="fas fa-chevron-up"></i>
                                        Thu gọn
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-chevron-down"></i>
                                        Xem thêm
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {related.length > 0 && (
                <div className="related-section">
                    <h3 className="related-title">Sản phẩm cùng danh mục</h3>
                    <div className="products-grid">
                        {related.map((p) => (
                            <div key={p.id} className="product-card" onClick={() => navigate(`/product/${p.id}`)}>
                                <div className="product-image-container">
                                    <img
                                        src={`${API_BASE}${p.images?.[0]?.image_url || '/placeholder.jpg'}`}
                                        alt={p.name}
                                        className="product-image"
                                    />
                                </div>
                                <div className="product-info">
                                    <h4 className="product-name">{p.name}</h4>
                                    <div className="product-price" style={{ marginBottom: '10px' }}>
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                        }).format(p.price) || 'Giá liên hệ'}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                            <button className="home-view-all-products" onClick={() => navigate('/products')}>
                                Xem tất cả
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Modal */}
            {isImageModalOpen && (
                <div className="image-modal-overlay" onClick={() => setIsImageModalOpen(false)}>
                    <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="image-modal-close"
                            onClick={() => setIsImageModalOpen(false)}
                            aria-label="Đóng ảnh"
                        >
                            ×
                        </button>
                        <img
                            src={`${API_BASE}${displayedImage?.image_url || '/placeholder.jpg'}`}
                            alt={product.name}
                            className="image-modal-img"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
