import { useEffect, useState } from 'react';
import '../assets/css/request-call.css';
import { API_BASE } from '../components/Api_base';
import api from '../components/axios-conf';

export default function RequestCallPage() {
    const [requestCalls, setRequestCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingRequestCall, setEditingRequestCall] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchRequestCalls();
    }, []);

    const fetchRequestCalls = async () => {
        try {
            setLoading(true);
            const response = await api.get(`${API_BASE}/api/request-calls`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequestCalls(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách yêu cầu gọi lại:', error);
            alert('Lỗi khi lấy danh sách yêu cầu gọi lại');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRequestCall = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa yêu cầu gọi lại này?')) {
            try {
                await api.delete(`${API_BASE}/api/request-calls/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert('Xóa yêu cầu gọi lại thành công');
                fetchRequestCalls();
            } catch (error) {
                console.error('Lỗi khi xóa yêu cầu gọi lại:', error);
                alert('Lỗi khi xóa yêu cầu gọi lại');
            }
        }
    };

    const handleEditRequestCall = (requestCall) => {
        setEditingRequestCall(requestCall);
        setShowEditForm(true);
    };

    const handleUpdateRequestCall = async (updatedData) => {
        try {
            await api.put(`${API_BASE}/api/request-calls/${editingRequestCall.id}`, updatedData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Cập nhật yêu cầu gọi lại thành công');
            setShowEditForm(false);
            setEditingRequestCall(null);
            fetchRequestCalls();
        } catch (error) {
            console.error('Lỗi khi cập nhật yêu cầu gọi lại:', error);
            alert('Lỗi khi cập nhật yêu cầu gọi lại');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    if (loading) {
        return (
            <div className="request-call-container">
                <div className="loading">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="request-call-container">
            <div className="request-call-header">
                <h1 className="request-call-title">Quản lý yêu cầu gọi lại</h1>
                <button className="request-call-refresh-btn" onClick={fetchRequestCalls}>
                    Làm mới
                </button>
            </div>

            <div className="request-call-stats">
                <div className="stat-card">
                    <div className="stat-number">{requestCalls.length}</div>
                    <div className="stat-label">Tổng yêu cầu</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">
                        {
                            requestCalls.filter((rc) => {
                                const today = new Date();
                                const requestDate = new Date(rc.created_at);
                                return requestDate.toDateString() === today.toDateString();
                            }).length
                        }
                    </div>
                    <div className="stat-label">Hôm nay</div>
                </div>
            </div>

            <div className="request-call-table-container">
                <table className="request-call-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Số điện thoại</th>
                            <th>Ghi chú</th>
                            <th>Ngày tạo</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requestCalls.map((requestCall) => (
                            <tr key={requestCall.id}>
                                <td className="request-call-id">#{requestCall.id}</td>
                                <td className="request-call-phone">{requestCall.phone}</td>
                                <td className="request-call-note">{requestCall.note || 'Không có ghi chú'}</td>
                                <td className="request-call-date">{formatDate(requestCall.created_at)}</td>
                                <td className="request-call-actions">
                                    <button
                                        className="action-btn edit-btn"
                                        onClick={() => handleEditRequestCall(requestCall)}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className="action-btn delete-btn"
                                        onClick={() => handleDeleteRequestCall(requestCall.id)}
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showEditForm && editingRequestCall && (
                <RequestCallEditModal
                    requestCall={editingRequestCall}
                    onClose={() => {
                        setShowEditForm(false);
                        setEditingRequestCall(null);
                    }}
                    onSave={handleUpdateRequestCall}
                />
            )}
        </div>
    );
}

function RequestCallEditModal({ requestCall, onClose, onSave }) {
    const [formData, setFormData] = useState({
        phone: requestCall.phone || '',
        note: requestCall.note || '',
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
                    <h2>Chỉnh sửa yêu cầu gọi lại #{requestCall.id}</h2>
                    <button className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Số điện thoại *</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Ghi chú</label>
                        <textarea name="note" value={formData.note} onChange={handleChange} rows="4"></textarea>
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
