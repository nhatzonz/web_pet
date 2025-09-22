import { useEffect, useState } from 'react';
import '../assets/css/order-admin.css';
import { API_BASE } from '../components/Api_base';
import api from '../components/axios-conf';

export default function OrderAdminPage() {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingOrder, setEditingOrder] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const token = localStorage.getItem('token');
    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const [response, products] = await Promise.all([
                api.get(`${API_BASE}/api/orders`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                api.get(`${API_BASE}/api/products`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);
            setOrders(response.data);
            setProducts(products.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách đơn hàng:', error);
            alert('Lỗi khi lấy danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };
    const handleDeleteOrder = async (id) => {
        // Nếu người dùng ấn Cancel thì dừng luôn
        if (!window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) return;

        try {
            await api.delete(`${API_BASE}/api/orders/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Xóa đơn hàng thành công');
            fetchOrders();
        } catch (error) {
            console.error('Lỗi khi xóa đơn hàng:', error);
            alert('Lỗi khi xóa đơn hàng');
        }
    };

    const handleEditOrder = (order) => {
        setEditingOrder(order);
        setShowEditForm(true);
    };

    const handleUpdateOrder = async (updatedData) => {
        try {
            await api.put(`${API_BASE}/api/orders/${editingOrder.id}`, updatedData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Cập nhật đơn hàng thành công');
            setShowEditForm(false);
            setEditingOrder(null);
            fetchOrders();
        } catch (error) {
            console.error('Lỗi khi cập nhật đơn hàng:', error);
            alert('Lỗi khi cập nhật đơn hàng');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#f39c12',
            confirmed: '#3498db',
            shipped: '#9b59b6',
            completed: '#27ae60',
            cancelled: '#e74c3c',
        };
        return colors[status] || '#95a5a6';
    };

    const getStatusText = (status) => {
        const texts = {
            pending: 'Chờ xác nhận',
            confirmed: 'Đã xác nhận',
            shipped: 'Đang giao',
            completed: 'Hoàn thành',
            cancelled: 'Đã hủy',
        };
        return texts[status] || status;
    };

    if (loading) {
        return (
            <div className="order-admin-container">
                <div className="loading">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="order-admin-container">
            <div className="order-admin-header">
                <h1 className="order-admin-title">Quản lý đơn hàng</h1>
                <button className="order-admin-refresh-btn" onClick={fetchOrders}>
                    Làm mới
                </button>
            </div>

            <div className="order-admin-stats">
                <div className="stat-card">
                    <div className="stat-number">{orders.length}</div>
                    <div className="stat-label">Tổng đơn hàng</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{orders.filter((o) => o.status === 'pending').length}</div>
                    <div className="stat-label">Chờ xác nhận</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{orders.filter((o) => o.status === 'completed').length}</div>
                    <div className="stat-label">Hoàn thành</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">
                        {formatPrice(orders.reduce((sum, o) => sum + Number(o.total), 0))}
                    </div>
                    <div className="stat-label">Tổng doanh thu</div>
                </div>
            </div>

            <div className="order-admin-table-container">
                <table className="order-admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Ảnh sản phẩm</th>
                            <th>Khách hàng</th>
                            <th>Số điện thoại</th>
                            <th>Sản phẩm</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td className="order-id">#{order.id}</td>
                                <td className="order-image">
                                    <img
                                        style={{ width: '100px', height: '100px', objectFit: 'contain' }}
                                        src={`${API_BASE}${
                                            products.find((p) => p.id === order.items[0].product_id)?.images[0]
                                                .image_url
                                        }`}
                                        alt="ảnh sản phẩm"
                                    />
                                </td>
                                <td className="order-customer">
                                    <div className="customer-name">{order.customer_name}</div>
                                    <div className="delivery-type">
                                        {order.delivery_type === 'self' ? 'Đặt cho tôi' : 'Đặt đơn tặng'}
                                    </div>
                                    <div>
                                        {products.find((p) => p.id === order.items[0].product_id)?.code ||
                                            'Chưa có mã sp'}
                                    </div>
                                </td>
                                <td className="order-phone">{order.customer_phone}</td>
                                <td className="order-items">
                                    {order.items?.map((item, index) => (
                                        <div key={index} className="order-item">
                                            <div className="item-name">{item.product_name}</div>
                                            <div className="item-details">
                                                SL: {item.quantity} - {formatPrice(item.price)}
                                            </div>
                                            {item.attribute_summary && (
                                                <div className="item-attributes">{item.attribute_summary}</div>
                                            )}
                                        </div>
                                    ))}
                                </td>
                                <td className="order-total">{formatPrice(order.total)}</td>
                                <td className="order-status">
                                    <span
                                        className="status-badge"
                                        style={{ backgroundColor: getStatusColor(order.status) }}
                                    >
                                        {getStatusText(order.status)}
                                    </span>
                                </td>
                                <td className="order-date">{formatDate(order.created_at)}</td>
                                <td className="order-actions">
                                    <button className="action-btn edit-btn" onClick={() => handleEditOrder(order)}>
                                        Sửa
                                    </button>
                                    <button
                                        className="action-btn delete-btn"
                                        onClick={() => handleDeleteOrder(order.id)}
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showEditForm && editingOrder && (
                <OrderEditModal
                    order={editingOrder}
                    onClose={() => {
                        setShowEditForm(false);
                        setEditingOrder(null);
                    }}
                    onSave={handleUpdateOrder}
                />
            )}
        </div>
    );
}

function OrderEditModal({ order, onClose, onSave }) {
    const [formData, setFormData] = useState({
        customer_name: order.customer_name || '',
        customer_phone: order.customer_phone || '',
        delivery_type: order.delivery_type || 'self',
        status: order.status || 'pending',
        delivery_time: order.delivery_time || '',
        message_on_cake: order.message_on_cake || '',
        district: order.district || '',
        ward: order.ward || '',
        province: order.province || '',
        address: order.address || '',
        pickup_branch: order.pickup_branch || '',
        note: order.note || '',
        payment_method: order.payment_method || 'cod',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Chỉnh sửa đơn hàng #{order.id}</h2>
                    <button className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Tên khách hàng *</label>
                            <input
                                type="text"
                                name="customer_name"
                                value={formData.customer_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Số điện thoại *</label>
                            <input
                                type="text"
                                name="customer_phone"
                                value={formData.customer_phone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Phương thức đặt đơn</label>
                            <select name="delivery_type" value={formData.delivery_type} onChange={handleChange}>
                                <option value="self">Đặt cho tôi</option>
                                <option value="gift">Đặt đơn tặng</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Trạng thái</label>
                            <select name="status" value={formData.status} onChange={handleChange}>
                                <option value="pending">Chờ xác nhận</option>
                                <option value="confirmed">Đã xác nhận</option>
                                <option value="shipped">Đang giao</option>
                                <option value="completed">Hoàn thành</option>
                                <option value="cancelled">Đã hủy</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Thời gian nhận đơn</label>
                            <input
                                type="datetime-local"
                                name="delivery_time"
                                value={formData.delivery_time}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Nội dung ghi trên đơn</label>
                            <input
                                type="text"
                                name="message_on_cake"
                                value={formData.message_on_cake}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Tỉnh/Thành phố</label>
                            <input type="text" name="province" value={formData.province} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Quận/Huyện</label>
                            <input type="text" name="district" value={formData.district} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Xã/Phường</label>
                            <input type="text" name="ward" value={formData.ward} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Địa chỉ</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Nhận đơn ở</label>
                            <input
                                type="text"
                                name="pickup_branch"
                                value={formData.pickup_branch}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Phương thức thanh toán</label>
                            <select name="payment_method" value={formData.payment_method} onChange={handleChange}>
                                <option value="cod">Thanh toán khi nhận hàng</option>
                                <option value="bank">Chuyển khoản</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Ghi chú</label>
                        <textarea name="note" value={formData.note} onChange={handleChange} rows="3"></textarea>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Hủy
                        </button>
                        <button type="submit" className="btn-primary">
                            Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
