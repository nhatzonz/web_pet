import { useEffect, useState } from 'react';
import '../assets/css/shop-info.css';
import { API_BASE } from '../components/Api_base';
import api from '../components/axios-conf';

function ShopInfoPage() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [linkFace, setLinkFace] = useState('');
    const [linkMess, setLinkMess] = useState('');
    const [linkTiktok, setLinkTiktok] = useState('');
    const [logo, setLogo] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [existingShopInfo, setExistingShopInfo] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Fetch existing shop info on component mount
    useEffect(() => {
        fetchShopInfo();
    }, []);

    const fetchShopInfo = async () => {
        try {
            const response = await api.get(`${API_BASE}/api/shopInfo`);
            if (response.data) {
                setExistingShopInfo(response.data);
                setIsEditing(true);
                // Fill form with existing data
                setName(response.data.name || '');
                setPhone(response.data.phone || '');
                setEmail(response.data.email || '');
                setAddress(response.data.address || '');
                setLinkFace(response.data.link_face || '');
                setLinkMess(response.data.link_mess || '');
                setLinkTiktok(response.data.link_tiktok || '');
            }
        } catch (error) {
            console.error('Lỗi khi lấy thông tin cửa hàng:', error);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('Chưa đăng nhập');
            return;
        }

        // Validate required fields
        if (!name.trim()) {
            setMessage('Tên cửa hàng không được để trống');
            return;
        }
        if (!phone.trim()) {
            setMessage('Số điện thoại không được để trống');
            return;
        }

        const form = new FormData();
        if (logo) {
            form.append('image', logo);
        }
        form.append('name', name);
        form.append('phone', phone);
        form.append('email', email);
        form.append('address', address);
        form.append('link_face', linkFace);
        form.append('link_mess', linkMess);
        form.append('link_tiktok', linkTiktok);

        try {
            setLoading(true);
            const method = isEditing ? 'PUT' : 'POST';
            const res = await fetch(`${API_BASE}/api/shopInfo/`, {
                method,
                headers: { Authorization: `Bearer ${token}` },
                body: form,
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok)
                throw new Error(data.message || `${isEditing ? 'Cập nhật' : 'Tạo'} thông tin cửa hàng thất bại`);

            setMessage(`${isEditing ? 'Cập nhật' : 'Tạo'} thông tin cửa hàng thành công`);
            setIsEditing(true);
            await fetchShopInfo(); // Refresh data
        } catch (err) {
            setMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa thông tin cửa hàng?')) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('Chưa đăng nhập');
            return;
        }

        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/shopInfo`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || 'Xóa thông tin cửa hàng thất bại');

            setMessage('Xóa thông tin cửa hàng thành công');
            setExistingShopInfo(null);
            setIsEditing(false);
            // Clear form
            setName('');
            setPhone('');
            setEmail('');
            setAddress('');
            setLinkFace('');
            setLinkMess('');
            setLinkTiktok('');
            setLogo(null);
        } catch (err) {
            setMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="shop-info-container">
            <div className="shop-info-card">
                <div className="shop-info-header">
                    <h2 className="shop-info-title">Thông tin cửa hàng</h2>
                    {existingShopInfo && (
                        <div className="shop-info-actions">
                            <button
                                type="button"
                                className="shop-info-btn shop-info-btn-danger"
                                onClick={handleDelete}
                                disabled={loading}
                            >
                                Xóa thông tin
                            </button>
                        </div>
                    )}
                </div>

                {existingShopInfo && (
                    <div className="shop-info-current">
                        <h3>Thông tin hiện tại:</h3>
                        <div className="shop-info-current-content">
                            <div className="shop-info-current-item">
                                <strong>Tên:</strong> {existingShopInfo.name}
                            </div>
                            <div className="shop-info-current-item">
                                <strong>Điện thoại:</strong> {existingShopInfo.phone}
                            </div>
                            {existingShopInfo.email && (
                                <div className="shop-info-current-item">
                                    <strong>Email:</strong> {existingShopInfo.email}
                                </div>
                            )}
                            {existingShopInfo.address && (
                                <div className="shop-info-current-item">
                                    <strong>Địa chỉ:</strong> {existingShopInfo.address}
                                </div>
                            )}
                            {existingShopInfo.logo_image && (
                                <div className="shop-info-current-item">
                                    <strong>Logo:</strong>
                                    <img
                                        src={`${API_BASE}${existingShopInfo.logo_image}`}
                                        alt="Current logo"
                                        className="shop-info-current-logo"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <form onSubmit={onSubmit} className="shop-info-form">
                    <div className="shop-info-field">
                        <label className="shop-info-label">Tên cửa hàng *</label>
                        <input
                            className="shop-info-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nhập tên cửa hàng"
                            required
                        />
                    </div>

                    <div className="shop-info-grid">
                        <div className="shop-info-field">
                            <label className="shop-info-label">Điện thoại *</label>
                            <input
                                className="shop-info-input"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Nhập số điện thoại"
                                required
                            />
                        </div>
                        <div className="shop-info-field">
                            <label className="shop-info-label">Email</label>
                            <input
                                className="shop-info-input"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Nhập email"
                            />
                        </div>
                    </div>

                    <div className="shop-info-field">
                        <label className="shop-info-label">Địa chỉ</label>
                        <input
                            className="shop-info-input"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Nhập địa chỉ cửa hàng"
                        />
                    </div>

                    <div className="shop-info-grid">
                        <div className="shop-info-field">
                            <label className="shop-info-label">Facebook</label>
                            <input
                                className="shop-info-input"
                                value={linkFace}
                                onChange={(e) => setLinkFace(e.target.value)}
                                placeholder="Link Facebook"
                            />
                        </div>
                        <div className="shop-info-field">
                            <label className="shop-info-label">Messenger</label>
                            <input
                                className="shop-info-input"
                                value={linkMess}
                                onChange={(e) => setLinkMess(e.target.value)}
                                placeholder="Link Messenger"
                            />
                        </div>
                        <div className="shop-info-field">
                            <label className="shop-info-label">TikTok</label>
                            <input
                                className="shop-info-input"
                                value={linkTiktok}
                                onChange={(e) => setLinkTiktok(e.target.value)}
                                placeholder="Link TikTok"
                            />
                        </div>
                    </div>

                    <div className="shop-info-field">
                        <label className="shop-info-label">Logo cửa hàng {!isEditing ? '*' : ''}</label>
                        <div className="shop-info-file-input">
                            <input
                                type="file"
                                id="logo-upload"
                                name="logo"
                                accept="image/*"
                                onChange={(e) => setLogo(e.target.files?.[0] || null)}
                                required={!isEditing}
                            />
                            <label htmlFor="logo-upload" className="shop-info-file-label">
                                <i className="fa-solid fa-upload"></i>
                                <span>{logo ? logo.name : 'Chọn file logo mới'}</span>
                            </label>
                        </div>
                        {logo && (
                            <div className="shop-info-preview">
                                <img
                                    src={URL.createObjectURL(logo)}
                                    alt="Preview"
                                    className="shop-info-preview-image"
                                />
                            </div>
                        )}
                        {isEditing && !logo && (
                            <div className="shop-info-note">
                                <small>Để trống nếu không muốn thay đổi logo hiện tại</small>
                            </div>
                        )}
                    </div>

                    <button className="shop-info-btn" type="submit" disabled={loading}>
                        {loading ? 'Đang lưu...' : isEditing ? 'Cập nhật thông tin' : 'Tạo thông tin'}
                    </button>
                </form>
                {message && (
                    <div className={`shop-info-message ${message.includes('thành công') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ShopInfoPage;
