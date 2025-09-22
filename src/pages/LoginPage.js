import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/login.css';
import { API_BASE } from '../components/Api_base';

export default function LoginPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const isToken = localStorage.getItem('token');

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/users/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || 'Login thất bại');
            localStorage.setItem('token', data.token);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Admin Login</h2>
                <form onSubmit={onSubmit} className="login-form">
                    <div className="login-field">
                        <label className="login-label">Username</label>
                        <input
                            className="login-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Nhập username"
                            required
                        />
                    </div>
                    <div className="login-field">
                        <label className="login-label">Password</label>
                        <input
                            className="login-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập password"
                            required
                        />
                    </div>
                    {error && <div className="login-error">{error}</div>}
                    <button className="login-btn" type="submit" disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                    {isToken && (
                        <button
                            className="login-btn"
                            type="button"
                            onClick={() => {
                                localStorage.removeItem('token');
                                navigate('/');
                            }}
                        >
                            Đăng xuất
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
}
