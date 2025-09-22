import { useEffect, useState } from 'react';
import '../assets/css/banner.css';
import { API_BASE } from '../components/Api_base';

export default function UploadBannerPage() {
    const [file, setFile] = useState(null);
    const [isSubBanner, setIsSubBanner] = useState(false);
    const [sortOrder, setSortOrder] = useState(0);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [banners, setBanners] = useState([]);
    const [editing, setEditing] = useState(null);
    const [editFile, setEditFile] = useState(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const fetchList = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/banners`);
            const data = await res.json();
            setBanners(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchList();
    }, []);

    const onUpload = async (e) => {
        e.preventDefault();
        setMessage('');
        if (!file) {
            setMessage('Chọn ảnh trước');
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('Chưa đăng nhập');
            return;
        }
        const formData = new FormData();
        formData.append('image', file);
        formData.append('isSubBanner', String(isSubBanner));
        formData.append('sort_order', String(sortOrder));
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/banners/`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || 'Upload thất bại');
            setMessage('Upload thành công: ' + (data.image_url || ''));
            await fetchList();
        } catch (err) {
            setMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (b) => {
        setEditing({ id: b.id, isSubBanner: !!b.isSubBanner, sort_order: Number(b.sort_order) || 0 });
        setEditFile(null);
    };

    const cancelEdit = () => {
        setEditing(null);
        setEditFile(null);
    };

    const saveEdit = async () => {
        if (!editing) return;
        const form = new FormData();
        form.append('isSubBanner', String(editing.isSubBanner));
        form.append('sort_order', String(editing.sort_order));
        if (editFile) form.append('image', editFile);
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/banners/${editing.id}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body: form,
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || 'Cập nhật thất bại');
            await fetchList();
            cancelEdit();
        } catch (e) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    const remove = async (id) => {
        if (!window.confirm('Xoá banner này?')) return;
        try {
            const res = await fetch(`${API_BASE}/api/banners/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || 'Xoá thất bại');
            await fetchList();
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <div className="banner-container">
            <div className="banner-card">
                <h2>Upload Banner</h2>
                <form onSubmit={onUpload} className="banner-form">
                    <div>
                        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </div>
                    <div className="banner-row">
                        <label>
                            <input
                                type="checkbox"
                                checked={isSubBanner}
                                onChange={(e) => setIsSubBanner(e.target.checked)}
                            />
                            <span className="banner-label">Sub Banner</span>
                        </label>
                        <div className="banner-sort">
                            <label>Sort order</label>
                            <input
                                className="banner-input"
                                type="number"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <button className="banner-btn" type="submit" disabled={loading}>
                        {loading ? 'Đang upload...' : 'Upload'}
                    </button>
                </form>
                {message && <div className="banner-message">{message}</div>}

                <hr className="banner-divider" />
                <h3 className="banner-title">Danh sách Banner</h3>
                <div className="banner-table-wrapper">
                    <table className="banner-table">
                        <thead>
                            <tr>
                                <th>Ảnh</th>
                                <th>Sub</th>
                                <th>Sort</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {banners.map((b) => (
                                <tr key={b.id}>
                                    <td>
                                        <img src={`${API_BASE}${b.image_url}`} alt="banner" className="banner-image" />
                                    </td>
                                    <td>{b.isSubBanner ? 'Yes' : 'No'}</td>
                                    <td>{b.sort_order}</td>
                                    <td>
                                        <button className="banner-btn" onClick={() => startEdit(b)}>
                                            Sửa
                                        </button>
                                        <button className="banner-btn banner-btn-danger" onClick={() => remove(b.id)}>
                                            Xoá
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {editing && (
                    <div className="banner-edit">
                        <h3>Sửa banner</h3>
                        <div className="banner-row">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={editing.isSubBanner}
                                    onChange={(e) => setEditing({ ...editing, isSubBanner: e.target.checked })}
                                />{' '}
                                Sub
                            </label>
                            <label>Sort</label>
                            <input
                                className="banner-input"
                                type="number"
                                value={editing.sort_order}
                                onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                            />
                        </div>
                        <div className="banner-file">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                            />
                        </div>
                        <div className="banner-row">
                            <button className="banner-btn" disabled={loading} onClick={saveEdit}>
                                {loading ? 'Đang lưu...' : 'Lưu'}
                            </button>
                            <button className="banner-btn banner-btn-secondary" onClick={cancelEdit}>
                                Huỷ
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
