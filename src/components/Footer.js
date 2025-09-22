import { useEffect, useState } from 'react';
import '../assets/css/footer.css';
import { API_BASE } from './Api_base';
import api from './axios-conf';

export default function Footer() {
    const [shopInfo, setShopInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShopInfo = async () => {
            try {
                const response = await api.get('/api/shopInfo');
                setShopInfo(response.data);
            } catch (err) {
                console.error('Lỗi fetch shopInfo:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchShopInfo();
    }, []);

    if (loading) {
        return (
            <footer className="footer">
                <div className="footer-loading">Đang tải...</div>
            </footer>
        );
    }
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    {/* Logo và thông tin cơ bản */}
                    <div className="footer-section">
                        <div className="footer-logo">
                            <img
                                src={shopInfo?.logo_image ? `${API_BASE}${shopInfo?.logo_image}` : '/default-logo.png'}
                                alt="Logo"
                                className="footer-logo-image"
                            />
                            <h3 className="footer-shop-name">{shopInfo?.name || 'Gấu Bông 🐻'}</h3>
                        </div>
                        <p className="footer-description">
                            {shopInfo?.description ||
                                'Chuyên cung cấp các loại gấu bông, dụng cụ học tập, túi ví chất lượng cao với ngoại hình cute hấp dẫn, đảm bảo chất lượng.'}
                        </p>
                    </div>

                    {/* Thông tin liên hệ */}
                    <div className="footer-section">
                        <h4 className="footer-title">Thông tin liên hệ</h4>
                        <div className="footer-contact">
                            {shopInfo?.phone && (
                                <div className="footer-contact-item">
                                    <i className="fa-solid fa-phone"></i>
                                    <span>{shopInfo?.phone}</span>
                                </div>
                            )}
                            {shopInfo?.email && (
                                <div className="footer-contact-item">
                                    <i className="fa-solid fa-envelope"></i>
                                    <span>{shopInfo?.email}</span>
                                </div>
                            )}
                            {shopInfo?.address && (
                                <div className="footer-contact-item">
                                    <i className="fa-solid fa-location-dot"></i>
                                    <span>{shopInfo?.address}</span>
                                </div>
                            )}
                            {shopInfo?.website && (
                                <div className="footer-contact-item">
                                    <i className="fa-solid fa-globe"></i>
                                    <a href={shopInfo?.website} target="_blank" rel="noopener noreferrer">
                                        {shopInfo?.website}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Giờ mở cửa */}
                    <div className="footer-section">
                        <h4 className="footer-title">Giờ mở cửa</h4>
                        <div className="footer-hours">
                            {shopInfo?.opening_hours ? (
                                <div className="footer-hours-text">
                                    {shopInfo?.opening_hours.split('\n').map((line, index) => (
                                        <div key={index}>{line}</div>
                                    ))}
                                </div>
                            ) : (
                                <div className="footer-hours-text">
                                    <div>Thứ 2 - Chủ nhật: 6:00 - 22:00</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mạng xã hội */}
                    <div className="footer-section">
                        <h4 className="footer-title">Theo dõi chúng tôi</h4>
                        <div className="footer-social">
                            {shopInfo?.link_face && (
                                <a
                                    href={shopInfo?.link_face}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer-social-link"
                                    title="Facebook"
                                >
                                    <i className="fab fa-facebook-f"></i>
                                </a>
                            )}
                            {shopInfo?.link_mess && (
                                <a
                                    href={shopInfo?.link_mess}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer-social-link"
                                    title="Messenger"
                                >
                                    <i className="fab fa-facebook-messenger"></i>
                                </a>
                            )}
                            {shopInfo?.link_tiktok && (
                                <a
                                    href={shopInfo?.link_tiktok}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer-social-link"
                                    title="TikTok"
                                >
                                    <i className="fab fa-tiktok"></i>
                                </a>
                            )}
                            {shopInfo?.email && (
                                <a href={`mailto:${shopInfo?.email}`} className="footer-social-link" title="Email">
                                    <i className="fas fa-envelope"></i>
                                </a>
                            )}
                            {shopInfo?.phone && (
                                <a href={`tel:${shopInfo?.phone}`} className="footer-social-link" title="Gọi điện">
                                    <i className="fas fa-phone"></i>
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer bottom */}
                <div className="footer-bottom">
                    <div className="footer-copyright">
                        <p>&copy; 2024 {shopInfo?.name || 'Gấu Bông 🐻'}. Tất cả quyền được bảo lưu.</p>
                    </div>
                    <div className="footer-links">
                        <a href="/" className="footer-link">
                            Trang chủ
                        </a>
                        <a href="/products" className="footer-link">
                            Sản phẩm
                        </a>
                        <a href="/admin/login" className="footer-link">
                            Admin
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
