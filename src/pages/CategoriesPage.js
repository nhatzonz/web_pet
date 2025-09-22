import { useEffect, useState } from 'react';
import '../assets/css/categorie.css';
import { API_BASE } from '../components/Api_base';
export default function CategoriesPage() {
    const [dataCreate, setDataCreate] = useState({
        name: '',
        slug: '',
        description: '',
        image: null,
    });
    const [list, setList] = useState([]);
    const [editing, setEditing] = useState(null); // {id, name, slug, description}
    const [editFile, setEditFile] = useState(null);
    const [token, setToken] = useState(null);

    const fetchList = async () => {
        const tokenx = localStorage.getItem('token');
        if (!tokenx) {
            return;
        }
        setToken(tokenx);
        try {
            const res = await fetch(`${API_BASE}/api/categories`, {
                headers: { Authorization: `Bearer ${tokenx}` },
            });
            const data = await res.json();
            setList(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchList();
    }, []);
    const onSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', dataCreate.name);
        formData.append('slug', dataCreate.slug);
        formData.append('description', dataCreate.description);
        formData.append('image', dataCreate.image);
        const token = localStorage.getItem('token');
        if (!token) {
            return;
        }
        const res = await fetch(`${API_BASE}/api/categories/`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
        const data = await res.json().catch(() => ({}));
        // if (!res.ok) throw new Error(data.message || 'Tạo danh mục bánh sinh nhật thất bại');
        if (!res.ok) throw new Error(data.message || 'Tạo danh mục pets yêu thất bại');

        setDataCreate({ name: '', slug: '', description: '', image: null });
        await fetchList();
    };
    const startEdit = (c) => {
        setEditing({ id: c.id, name: c.name, slug: c.slug || '', description: c.description || '' });
        setEditFile(null);
    };

    const cancelEdit = () => {
        setEditing(null);
        setEditFile(null);
    };

    const saveEdit = async () => {
        if (!editing) return;
        const token = localStorage.getItem('token');
        if (!token) return;
        const form = new FormData();
        form.append('name', editing.name);
        form.append('slug', editing.slug);
        form.append('description', editing.description);
        if (editFile) form.append('image', editFile);
        const res = await fetch(`${API_BASE}/api/categories/${editing.id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: form,
        });
        const data = await res.json().catch(() => ({}));
        // if (!res.ok) throw new Error(data.message || 'Cập nhật danh mục thất bại');
        if (!res.ok) throw new Error(data.message || 'Cập nhật danh mục pets yêu thất bại');
        await fetchList();
        cancelEdit();
    };

    const remove = async (id) => {
        if (!window.confirm('Xoá danh mục này?')) return;
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API_BASE}/api/categories/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Xoá danh mục thất bại');
        await fetchList();
    };

    return (
        <div className="categorie-container">
            <div className="categorie-card">
                <h2 className="categorie-title">Tạo danh mục pets yêu</h2>
                <form onSubmit={onSubmit} className="categorie-form">
                    <div className="categorie-row">
                        <label>Tên danh mục</label>
                        <input
                            type="text"
                            name="name"
                            value={dataCreate.name}
                            onChange={(e) => setDataCreate({ ...dataCreate, name: e.target.value })}
                        />
                    </div>
                    <div className="categorie-row">
                        <label>Slug</label>
                        <input
                            type="text"
                            name="slug"
                            value={dataCreate.slug}
                            onChange={(e) => setDataCreate({ ...dataCreate, slug: e.target.value })}
                        />
                    </div>
                    <div className="categorie-row">
                        <label>Mô tả</label>
                        <input
                            type="text"
                            name="description"
                            value={dataCreate.description}
                            onChange={(e) => setDataCreate({ ...dataCreate, description: e.target.value })}
                        />
                    </div>
                    <div className="categorie-row">
                        <label>Ảnh</label>
                        <input
                            type="file"
                            name="image"
                            onChange={(e) => setDataCreate({ ...dataCreate, image: e.target.files[0] })}
                        />
                    </div>
                    <button className="categorie-btn" type="submit">
                        Tạo
                    </button>
                </form>

                <hr className="categorie-sep" />
                <h3 className="categorie-subtitle">Danh sách danh mục</h3>
                <div className="categorie-table-wrap">
                    <table className="categorie-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên</th>
                                <th>Slug</th>
                                <th>Mô tả</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.map((c) => (
                                <tr key={c.id}>
                                    <td>{c.id}</td>
                                    <td>{c.name}</td>
                                    <td>{c.slug}</td>
                                    <td className="cate-desc">{c.description}</td>
                                    <td>
                                        <button className="categorie-btn" onClick={() => startEdit(c)}>
                                            Sửa
                                        </button>
                                        <button className="categorie-btn danger" onClick={() => remove(c.id)}>
                                            Xoá
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {editing && (
                    <div className="categorie-edit">
                        <h3 className="categorie-subtitle">Sửa danh mục</h3>
                        <div className="categorie-row">
                            <label>Tên danh mục</label>
                            <input
                                type="text"
                                value={editing.name}
                                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                            />
                        </div>
                        <div className="categorie-row">
                            <label>Slug</label>
                            <input
                                type="text"
                                value={editing.slug}
                                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                            />
                        </div>
                        <div className="categorie-row">
                            <label>Mô tả</label>
                            <input
                                type="text"
                                value={editing.description}
                                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                            />
                        </div>
                        <div className="categorie-row">
                            <label>Ảnh</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                            />
                        </div>
                        <div className="categorie-actions">
                            <button className="categorie-btn" onClick={saveEdit}>
                                Lưu
                            </button>
                            <button className="categorie-btn ghost" onClick={cancelEdit}>
                                Huỷ
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
