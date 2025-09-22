import React, { useEffect, useState } from 'react';
import '../assets/css/floatingcontact.css';
import { API_BASE } from '../components/Api_base';
import api from '../components/axios-conf';

const FloatingContact = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [shopInfo, setShopInfo] = useState([]);
    useEffect(() => {
        const fetchShopInfo = async () => {
            const res = await api.get(`${API_BASE}/api/shopInfo`);
            setShopInfo(res.data);
        };
        fetchShopInfo();
    }, []);

    return (
        <>
            <div className="floating-btn" onClick={() => setIsOpen(!isOpen)}>
                <i className="fas fa-headset"></i>
            </div>

            <div className={`contact-menu ${isOpen ? 'open' : ''}`}>
                <a href={shopInfo?.link_face} target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-facebook-messenger"></i> Messenger
                </a>
                <a href={`https://zalo.me/${shopInfo?.phone}`} target="_blank" rel="noopener noreferrer">
                    <i className="fas fa-comment"></i> Zalo
                </a>
                <a href={`tel:${shopInfo?.phone}`}>
                    <i className="fas fa-phone"></i> Gọi {shopInfo?.phone}
                </a>
            </div>
        </>
    );
};

export default FloatingContact;
