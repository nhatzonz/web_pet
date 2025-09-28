import { useEffect, useState } from 'react';
import '../assets/css/productadmin.css';
import { API_BASE } from '../components/Api_base';

export default function ProductsAdminPage() {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCat, setSelectedCat] = useState('');
    const [attributes, setAttributes] = useState([]);
    const [showCreated, setShowCreated] = useState(false);

    const [form, setForm] = useState({
        name: '',
        code: '',
        price: '',
        category_id: '',
        description: '',
        sort_order: 0,
    });
    const [images, setImages] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [token, setToken] = useState(null);
    const [errors, setErrors] = useState({});

    // Quick create category / attribute
    const [quickCat, setQuickCat] = useState({ open: false, name: '', slug: '' });
    const [quickAttr, setQuickAttr] = useState({ open: false, name: '', slug: '' });

    // Attribute rows attach to product
    const [attrRows, setAttrRows] = useState([{ attribute_id: '', value: '', extra_price: 0 }]);
    const [replaceImages, setReplaceImages] = useState(false);

    // Product sections
    const [productSections, setProductSections] = useState([]);
    const [showSections, setShowSections] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Format price function
    const formatPrice = (price) => {
        if (!price || price === '') return '';
        const num = typeof price === 'string' ? parseFloat(price) : price;
        if (isNaN(num)) return '';
        return new Intl.NumberFormat('vi-VN').format(num);
    };

    // Parse price from formatted string
    const parsePrice = (formattedPrice) => {
        if (!formattedPrice) return '';
        return formattedPrice.replace(/\./g, '');
    };

    const handleImagesChange = (files) => {
        const newImages = Array.from(files).map((f) => ({
            file: f,
            preview: URL.createObjectURL(f),
            isMain: false,
        }));
        setImages((prev) => [...prev, ...newImages]); // nối thêm, không ghi đè
    };

    const setMainImage = (idx) => {
        setImages((prev) =>
            prev.map((img, i) => ({
                ...img,
                isMain: i === idx,
            })),
        );
    };

    const removeImage = (idx) => {
        setImages((prev) => prev.filter((_, i) => i !== idx));
    };

    const fetchCats = async () => {
        try {
            const tokenx = localStorage.getItem('token');
            if (!tokenx) return;
            setToken(tokenx);
            const res = await fetch(`${API_BASE}/api/categories`, {
                headers: { Authorization: `Bearer ${tokenx}` },
            });
            const data = await res.json();
            setCategories(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchProducts = async (category_id = '') => {
        try {
            const qs = category_id ? `?category_id=${category_id}` : '';
            const res = await fetch(`${API_BASE}/api/products${qs}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setProducts(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchAttributes = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/products/attributes`);
            const data = await res.json();

            setAttributes(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchCats();
        fetchProducts();
        fetchAttributes();
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (!form.name.trim()) {
            newErrors.name = 'Tên sản phẩm là bắt buộc';
        }

        if (!form.category_id) {
            newErrors.category_id = 'Vui lòng chọn danh mục';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submit = async (e) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        try {
            const fd = new FormData();
            fd.append('name', form.name);
            if (form.code) fd.append('code', form.code);
            fd.append('price', String(parsePrice(form.price) || 0));
            if (form.category_id) fd.append('category_id', String(form.category_id));
            if (form.description) fd.append('description', form.description);
            fd.append('sort_order', String(form.sort_order));
            const attrsPayload = attrRows.filter((r) => r.attribute_id && r.value);
            if (attrsPayload.length) fd.append('attributes', JSON.stringify(attrsPayload));
            if (editingId) {
                fd.append('replace_attributes', 'true');
                fd.append('remove_missing', 'true');
            }
            images.forEach((img) => fd.append('images', img.file));
            const mainIndex = images.findIndex((img) => img.isMain);
            if (mainIndex !== -1) fd.append('main_index', mainIndex);
            if (editingId && replaceImages) fd.append('replace_images', 'true');

            const url = editingId ? `${API_BASE}/api/products/${editingId}` : `${API_BASE}/api/products/`;
            const method = editingId ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: fd });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || 'Lỗi lưu sản phẩm');

            alert(editingId ? 'Cập nhật sản phẩm thành công!' : 'Tạo sản phẩm thành công!');

            setForm({ name: '', code: '', price: '', category_id: '', description: '', sort_order: 0 });
            setImages([]);
            setEditingId(null);
            setAttrRows([{ attribute_id: '', value: '', extra_price: 0 }]);
            setReplaceImages(false);
            setErrors({});
            setShowCreated(false); // Tự động đóng form sau khi lưu
            await fetchProducts(selectedCat);
        } catch (error) {
            console.error('Lỗi:', error);
            alert('Có lỗi xảy ra: ' + error.message);
        }
    };

    // Ngăn Enter gửi form (trừ textarea)
    const handleFormKeyDown = (e) => {
        if (e.key === 'Enter') {
            const tag = e.target?.tagName?.toLowerCase();
            if (tag !== 'textarea') {
                e.preventDefault();
            }
        }
    };

    // Enter trong dòng thuộc tính => thêm dòng mới với cùng attribute_id
    const handleAttrKeyDown = (e, rowIndex) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        const current = attrRows[rowIndex];
        const nextRows = [...attrRows];
        const newRow = { attribute_id: current.attribute_id || '', value: '', extra_price: 0 };
        nextRows.splice(rowIndex + 1, 0, newRow);
        setAttrRows(nextRows);
        setTimeout(() => {
            const el = document.querySelector(`[data-attr-row="${rowIndex + 1}"][data-field="value"]`);
            if (el) el.focus();
        }, 50);
    };

    const startEdit = (p) => {
        setShowCreated(true);
        setEditingId(p.id);
        setForm({
            name: p.name,
            code: p.code || '',
            price: p.price ? formatPrice(p.price) : '',
            category_id: p.category_id || '',
            description: p.description || '',
            sort_order: p.sort_order || 0,
        });
        setImages([]);
        setReplaceImages(false);
        setErrors({});

        // Nạp thuộc tính hiện có của sản phẩm
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/api/products/${p.id}`, {
                    headers: { Authorization: token ? `Bearer ${token}` : undefined },
                });
                const detail = await res.json().catch(() => ({}));
                if (res.ok && detail?.product_attribute_values) {
                    const rows = (detail.product_attribute_values || []).map((v) => ({
                        attribute_id: v?.product_attribute?.id || '',
                        value: v?.value || '',
                        extra_price: v?.extra_price ? Number(v.extra_price) : 0,
                    }));
                    setAttrRows(rows.length ? rows : [{ attribute_id: '', value: '', extra_price: 0 }]);
                } else {
                    setAttrRows([{ attribute_id: '', value: '', extra_price: 0 }]);
                }
            } catch (err) {
                console.error('Lỗi tải chi tiết sản phẩm:', err);
                setAttrRows([{ attribute_id: '', value: '', extra_price: 0 }]);
            }
        })();

        // Tự động cuộn lên form sau khi mở
        setTimeout(() => {
            const formElement = document.querySelector('.product-admin-filter');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    const remove = async (id) => {
        if (!window.confirm('Xoá sản phẩm này?')) return;
        const res = await fetch(`${API_BASE}/api/products/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Xoá thất bại');
        await fetchProducts(selectedCat);
    };

    // Product Sections Functions
    const fetchProductSections = async (productId) => {
        try {
            const res = await fetch(`${API_BASE}/api/product-sections/product/${productId}`);
            const data = await res.json();
            if (res.ok) {
                setProductSections(data);
            }
        } catch (error) {
            console.error('Lỗi fetch product sections:', error);
        }
    };

    const addSection = () => {
        const maxSectionSort = Math.max(-1, ...productSections.map((s) => Number(s.sort_order ?? 0)));
        setProductSections([
            ...productSections,
            {
                id: Date.now(),
                title: '',
                sort_order: maxSectionSort + 1,
                items: [{ id: Date.now() + 1, content: '', is_image: false, sort_order: 0 }],
            },
        ]);
    };

    const updateSection = (index, field, value) => {
        const updated = [...productSections];
        updated[index] = { ...updated[index], [field]: value };
        setProductSections(updated);
    };

    const removeSection = (index) => {
        setProductSections(productSections.filter((_, i) => i !== index));
    };

    const addSectionItem = (sectionIndex) => {
        const updated = [...productSections];
        const currentMax = Math.max(-1, ...updated[sectionIndex].items.map((it) => Number(it.sort_order ?? 0)));
        const newItem = {
            id: Date.now(),
            content: '',
            is_image: false,
            sort_order: currentMax + 1,
        };
        updated[sectionIndex].items = [...updated[sectionIndex].items, newItem];
        setProductSections(updated);
    };

    const updateSectionItem = (sectionIndex, itemIndex, field, value) => {
        const updated = [...productSections];
        updated[sectionIndex].items[itemIndex] = {
            ...updated[sectionIndex].items[itemIndex],
            [field]: value,
        };
        setProductSections(updated);
    };

    const removeSectionItem = (sectionIndex, itemIndex) => {
        const updated = [...productSections];
        updated[sectionIndex].items = updated[sectionIndex].items.filter((_, i) => i !== itemIndex);
        setProductSections(updated);
    };

    const uploadSectionImage = async (file) => {
        try {
            setUploadingImage(true);
            const token = localStorage.getItem('token');
            if (!token) return null;

            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE}/api/product-sections/upload-image/`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Upload thất bại');

            return data.imageUrl;
        } catch (error) {
            console.error('Lỗi upload ảnh:', error);
            alert('Lỗi upload ảnh: ' + error.message);
            return null;
        } finally {
            setUploadingImage(false);
        }
    };

    const handleImageUpload = async (sectionIndex, itemIndex, file) => {
        const imageUrl = await uploadSectionImage(file);
        if (imageUrl) {
            updateSectionItem(sectionIndex, itemIndex, 'content', imageUrl);
        }
    };

    const saveProductSections = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Xóa tất cả sections cũ
            const existingSections = productSections.filter((s) => s.id && typeof s.id === 'number' && s.id < 1000000);
            for (const section of existingSections) {
                await fetch(`${API_BASE}/api/product-sections/${section.id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            // Chuẩn hoá và sắp xếp theo sort_order trước khi gửi
            const normalized = [...productSections]
                .map((s, sIdx) => ({
                    ...s,
                    sort_order: Number(s.sort_order ?? sIdx),
                    items: [...(s.items || [])]
                        .map((it, iIdx) => ({ ...it, sort_order: Number(it.sort_order ?? iIdx) }))
                        .sort((a, b) => a.sort_order - b.sort_order),
                }))
                .sort((a, b) => a.sort_order - b.sort_order);

            // Tạo sections mới
            for (const section of normalized) {
                if (section.title.trim()) {
                    await fetch(`${API_BASE}/api/product-sections/product/${productId}/`, {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(section),
                    });
                }
            }

            alert('Lưu mô tả sản phẩm thành công!');
            setShowSections(false);
        } catch (error) {
            console.error('Lỗi lưu product sections:', error);
            alert('Lỗi lưu mô tả sản phẩm!');
        }
    };

    return (
        <div className="product-admin-container">
            <div className="product-admin-card">
                <h2 className="product-admin-title">Quản lý sản phẩm</h2>

                {/* Filter */}
                <div className="product-admin-filter">
                    <label>Lọc theo danh mục:</label>
                    <select
                        value={selectedCat}
                        onChange={(e) => {
                            setSelectedCat(e.target.value);
                            fetchProducts(e.target.value);
                        }}
                        className="product-admin-select"
                    >
                        <option value="">Tất cả</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    style={{ cursor: 'pointer' }}
                    className="product-admin-btn product-admin-btn-primary"
                    onClick={() => {
                        setShowCreated(!showCreated);
                        if (!showCreated) {
                            // Tự động cuộn lên form khi mở
                            setTimeout(() => {
                                const formElement = document.querySelector('.product-admin-filter');
                                if (formElement) {
                                    formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            }, 100);
                        }
                    }}
                >
                    {showCreated ? 'Đóng' : 'Tạo sản phẩm mới'}
                </button>

                {/* Form */}
                {showCreated && (
                    <form onSubmit={submit} onKeyDown={handleFormKeyDown} className="product-admin-form">
                        <div className="product-admin-grid">
                            <div className="product-admin-field">
                                <label className="required">Tên sản phẩm</label>
                                <input
                                    className={`product-admin-input ${errors.name ? 'error' : ''}`}
                                    value={form.name}
                                    onChange={(e) => {
                                        setForm({ ...form, name: e.target.value });
                                        if (errors.name) {
                                            setErrors({ ...errors, name: null });
                                        }
                                    }}
                                    placeholder="Nhập tên sản phẩm"
                                />
                                {errors.name && <div className="error-message">{errors.name}</div>}
                            </div>

                            <div className="product-admin-field">
                                <label>Mã sản phẩm</label>
                                <input
                                    className="product-admin-input"
                                    value={form.code}
                                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                                    placeholder="VD: SP-001"
                                />
                            </div>

                            <div className="product-admin-field">
                                <label>Giá</label>
                                <input
                                    className="product-admin-input"
                                    type="text"
                                    value={form.price}
                                    onChange={(e) => {
                                        const rawValue = e.target.value;
                                        const numericValue = rawValue.replace(/[^0-9]/g, '');
                                        const formattedValue = formatPrice(numericValue);
                                        setForm({ ...form, price: formattedValue });
                                    }}
                                    onBlur={(e) => {
                                        const numericValue = parsePrice(e.target.value);
                                        if (numericValue && !isNaN(numericValue)) {
                                            const formattedValue = formatPrice(numericValue);
                                            setForm({ ...form, price: formattedValue });
                                        }
                                    }}
                                    placeholder="Nhập giá sản phẩm (VD: 500.000)"
                                />
                            </div>

                            <div className="product-admin-field">
                                <label className="required">Danh mục</label>
                                <select
                                    className={`product-admin-input ${errors.category_id ? 'error' : ''}`}
                                    value={form.category_id}
                                    onChange={(e) => {
                                        setForm({ ...form, category_id: e.target.value });
                                        if (errors.category_id) {
                                            setErrors({ ...errors, category_id: null });
                                        }
                                    }}
                                >
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id && <div className="error-message">{errors.category_id}</div>}

                                {/* Quick create category */}
                                {quickCat.open ? (
                                    <div className="product-admin-quick-create">
                                        <input
                                            className="product-admin-input"
                                            placeholder="Tên danh mục"
                                            value={quickCat.name}
                                            onChange={(e) => setQuickCat({ ...quickCat, name: e.target.value })}
                                        />
                                        <input
                                            className="product-admin-input"
                                            placeholder="Slug (tùy chọn)"
                                            value={quickCat.slug}
                                            onChange={(e) => setQuickCat({ ...quickCat, slug: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            className="product-admin-btn"
                                            onClick={async () => {
                                                const t = localStorage.getItem('token');
                                                if (!t || !quickCat.name.trim()) return;
                                                const fd = new FormData();
                                                fd.append('name', quickCat.name);
                                                if (quickCat.slug) fd.append('slug', quickCat.slug);
                                                const res = await fetch(`${API_BASE}/api/categories/`, {
                                                    method: 'POST',
                                                    headers: { Authorization: `Bearer ${t}` },
                                                    body: fd,
                                                });
                                                const d = await res.json().catch(() => ({}));
                                                if (!res.ok) {
                                                    alert(d.message || 'Tạo danh mục thất bại');
                                                    return;
                                                }
                                                setQuickCat({ open: false, name: '', slug: '' });
                                                await fetchCats();
                                            }}
                                        >
                                            Lưu
                                        </button>
                                        <button
                                            type="button"
                                            className="product-admin-btn product-admin-btn-secondary"
                                            onClick={() => setQuickCat({ open: false, name: '', slug: '' })}
                                        >
                                            Huỷ
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        className="product-admin-btn"
                                        onClick={() => setQuickCat({ open: true, name: '', slug: '' })}
                                    >
                                        Tạo nhanh danh mục
                                    </button>
                                )}
                            </div>

                            <div className="product-admin-field">
                                <label>Mô tả</label>
                                <input
                                    className="product-admin-input"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                />
                            </div>

                            {/* Attributes */}
                            <div className="product-admin-field">
                                <label>Thuộc tính</label>
                                {/* Quick create attribute */}
                                {quickAttr.open ? (
                                    <div className="product-admin-quick-create">
                                        <input
                                            className="product-admin-input"
                                            placeholder="Tên thuộc tính"
                                            value={quickAttr.name}
                                            onChange={(e) => setQuickAttr({ ...quickAttr, name: e.target.value })}
                                        />
                                        <input
                                            className="product-admin-input"
                                            placeholder="Slug (tùy chọn)"
                                            value={quickAttr.slug}
                                            onChange={(e) => setQuickAttr({ ...quickAttr, slug: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            className="product-admin-btn"
                                            onClick={async () => {
                                                const t = localStorage.getItem('token');
                                                if (!t || !quickAttr.name.trim()) return;
                                                const res = await fetch(`${API_BASE}/api/products/attributes/`, {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        Authorization: `Bearer ${t}`,
                                                    },
                                                    body: JSON.stringify({
                                                        name: quickAttr.name,
                                                        slug: quickAttr.slug,
                                                    }),
                                                });
                                                const d = await res.json().catch(() => ({}));
                                                if (!res.ok) {
                                                    alert(d.message || 'Tạo thuộc tính thất bại');
                                                    return;
                                                }
                                                setQuickAttr({ open: false, name: '', slug: '' });
                                                await fetchAttributes();
                                            }}
                                        >
                                            Lưu
                                        </button>
                                        <button
                                            type="button"
                                            className="product-admin-btn product-admin-btn-secondary"
                                            onClick={() => setQuickAttr({ open: false, name: '', slug: '' })}
                                        >
                                            Huỷ
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        className="product-admin-btn"
                                        onClick={() => setQuickAttr({ open: true, name: '', slug: '' })}
                                    >
                                        Tạo nhanh thuộc tính
                                    </button>
                                )}

                                {/* Attribute rows */}
                                <div className="product-admin-attr-list">
                                    {attrRows.map((row, idx) => (
                                        <div key={idx} className="product-admin-attr-row">
                                            <select
                                                className="product-admin-input"
                                                value={row.attribute_id}
                                                onChange={(e) => {
                                                    const next = [...attrRows];
                                                    next[idx].attribute_id = e.target.value;
                                                    setAttrRows(next);
                                                }}
                                                onKeyDown={(e) => handleAttrKeyDown(e, idx)}
                                            >
                                                <option value="">-- Chọn --</option>
                                                {attributes.map((a) => (
                                                    <option key={a.id} value={a.id}>
                                                        {a.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                className="product-admin-input"
                                                placeholder="Giá trị"
                                                value={row.value}
                                                onChange={(e) => {
                                                    const next = [...attrRows];
                                                    next[idx].value = e.target.value;
                                                    setAttrRows(next);
                                                }}
                                                data-attr-row={idx}
                                                data-field="value"
                                                onKeyDown={(e) => handleAttrKeyDown(e, idx)}
                                            />
                                            <input
                                                className="product-admin-input"
                                                type="number"
                                                placeholder="Phụ thu"
                                                value={row.extra_price}
                                                onChange={(e) => {
                                                    const next = [...attrRows];
                                                    next[idx].extra_price = Number(e.target.value);
                                                    setAttrRows(next);
                                                }}
                                                onKeyDown={(e) => handleAttrKeyDown(e, idx)}
                                            />
                                            <button
                                                type="button"
                                                className="product-admin-btn product-admin-btn-danger"
                                                onClick={() => setAttrRows(attrRows.filter((_, i) => i !== idx))}
                                            >
                                                Xoá
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="product-admin-btn"
                                        onClick={() =>
                                            setAttrRows([...attrRows, { attribute_id: '', value: '', extra_price: 0 }])
                                        }
                                    >
                                        + Thêm thuộc tính
                                    </button>
                                </div>
                            </div>

                            <div className="product-admin-field">
                                <label>Thứ tự hiển thị</label>
                                <input
                                    className="product-admin-input"
                                    type="number"
                                    value={form.sort_order}
                                    onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                                />
                            </div>

                            <div className="product-admin-field">
                                <label>Ảnh sản phẩm</label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => handleImagesChange(e.target.files)}
                                />
                                {editingId && (
                                    <div className="product-admin-inline">
                                        <label className="product-admin-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={replaceImages}
                                                onChange={(e) => setReplaceImages(e.target.checked)}
                                            />
                                            Thay thế toàn bộ ảnh hiện có bằng bộ ảnh mới
                                        </label>
                                    </div>
                                )}
                            </div>
                            <div className="product-admin-image-preview">
                                {images.map((img, idx) => (
                                    <div key={idx} className={`product-admin-image-box ${img.isMain ? 'active' : ''}`}>
                                        <img src={img.preview} alt={`preview-${idx}`} />
                                        <button type="button" onClick={() => setMainImage(idx)}>
                                            {img.isMain ? 'Ảnh chính ✓' : 'Chọn ảnh chính'}
                                        </button>
                                        <button type="button" onClick={() => removeImage(idx)}>
                                            Xoá
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={submit}
                                className="product-admin-btn product-admin-btn-primary"
                                type="submit"
                                disabled={!form.name.trim() || !form.category_id}
                            >
                                {editingId ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm mới'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Table */}
                <div className="product-admin-table-wrapper">
                    <table className="product-admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên</th>
                                <th>Giá</th>
                                <th>Danh mục</th>
                                <th>Thứ tự hiển thị</th>
                                <th>HĐ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p) => (
                                <tr key={p.id}>
                                    <td>{p.id}</td>
                                    <td>{p.name}</td>
                                    <td>{formatPrice(p.price)}</td>
                                    <td>{p.category_id || ''}</td>
                                    <td>{p.sort_order}</td>
                                    <td>
                                        <button className="product-admin-btn" onClick={() => startEdit(p)}>
                                            Sửa
                                        </button>
                                        <button
                                            className="product-admin-btn product-admin-btn-secondary"
                                            onClick={() => {
                                                fetchProductSections(p.id);
                                                setShowSections(true);
                                                setEditingId(p.id);
                                            }}
                                        >
                                            Mô tả
                                        </button>
                                        <button
                                            className="product-admin-btn product-admin-btn-danger"
                                            onClick={() => remove(p.id)}
                                        >
                                            Xoá
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Product Sections Modal */}
                {showSections && (
                    <div className="product-admin-modal-overlay">
                        <div className="product-admin-modal">
                            <div className="product-admin-modal-header">
                                <h3>Quản lý mô tả sản phẩm</h3>
                                <button className="product-admin-modal-close" onClick={() => setShowSections(false)}>
                                    ×
                                </button>
                            </div>

                            <div className="product-admin-modal-content">
                                <div className="product-admin-sections">
                                    {productSections.map((section, sectionIndex) => (
                                        <div key={section.id} className="product-admin-section">
                                            <div className="product-admin-section-header">
                                                <input
                                                    className="product-admin-input"
                                                    placeholder="Tiêu đề section"
                                                    value={section.title}
                                                    onChange={(e) =>
                                                        updateSection(sectionIndex, 'title', e.target.value)
                                                    }
                                                />
                                                <button
                                                    className="product-admin-btn product-admin-btn-danger"
                                                    onClick={() => removeSection(sectionIndex)}
                                                >
                                                    Xóa section
                                                </button>
                                            </div>

                                            <div className="product-admin-section-items">
                                                {section.items?.map((item, itemIndex) => (
                                                    <div key={item.id} className="product-admin-section-item">
                                                        <div className="product-admin-section-item-header">
                                                            <label>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={item.is_image}
                                                                    onChange={(e) =>
                                                                        updateSectionItem(
                                                                            sectionIndex,
                                                                            itemIndex,
                                                                            'is_image',
                                                                            e.target.checked,
                                                                        )
                                                                    }
                                                                />
                                                                Là hình ảnh
                                                            </label>
                                                            <button
                                                                className="product-admin-btn product-admin-btn-danger"
                                                                onClick={() =>
                                                                    removeSectionItem(sectionIndex, itemIndex)
                                                                }
                                                            >
                                                                Xóa
                                                            </button>
                                                        </div>

                                                        {item.is_image ? (
                                                            <div className="product-admin-image-upload">
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="product-admin-file-input"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            handleImageUpload(
                                                                                sectionIndex,
                                                                                itemIndex,
                                                                                file,
                                                                            );
                                                                        }
                                                                    }}
                                                                    disabled={uploadingImage}
                                                                />
                                                                {item.content && (
                                                                    <div className="product-admin-image-preview">
                                                                        <img
                                                                            src={`${API_BASE}${item.content}`}
                                                                            alt="Preview"
                                                                            className="product-admin-preview-image"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            className="product-admin-btn product-admin-btn-danger product-admin-btn-small"
                                                                            onClick={() =>
                                                                                updateSectionItem(
                                                                                    sectionIndex,
                                                                                    itemIndex,
                                                                                    'content',
                                                                                    '',
                                                                                )
                                                                            }
                                                                        >
                                                                            Xóa ảnh
                                                                        </button>
                                                                    </div>
                                                                )}
                                                                {uploadingImage && (
                                                                    <div className="product-admin-uploading">
                                                                        Đang upload...
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <textarea
                                                                className="product-admin-textarea"
                                                                placeholder="Nội dung text"
                                                                value={item.content}
                                                                onChange={(e) =>
                                                                    updateSectionItem(
                                                                        sectionIndex,
                                                                        itemIndex,
                                                                        'content',
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                rows={3}
                                                            />
                                                        )}
                                                    </div>
                                                ))}

                                                <button
                                                    className="product-admin-btn product-admin-btn-secondary"
                                                    onClick={() => addSectionItem(sectionIndex)}
                                                >
                                                    + Thêm item
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        className="product-admin-btn product-admin-btn-primary"
                                        onClick={addSection}
                                    >
                                        + Thêm section
                                    </button>
                                </div>
                            </div>

                            <div className="product-admin-modal-footer">
                                <button
                                    className="product-admin-btn product-admin-btn-secondary"
                                    onClick={() => setShowSections(false)}
                                >
                                    Hủy
                                </button>
                                <button
                                    className="product-admin-btn product-admin-btn-primary"
                                    onClick={() => saveProductSections(editingId)}
                                >
                                    Lưu mô tả
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
