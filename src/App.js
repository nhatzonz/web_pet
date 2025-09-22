import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import FloatingContact from './components/FloatingContact';
import Footer from './components/Footer';
import Header from './components/Header';
import ScrollToTop from './components/ScrollToTop';
import CategoriesPage from './pages/CategoriesPage';
import DetailProduct from './pages/DetailProduct';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import OrderAdminPage from './pages/OrderAdminPage';
import OrderCreatePage from './pages/OrderCreatePage';
import ProductPage from './pages/ProductPage';
import ProductsAdminPage from './pages/ProductsAdminPage';
import RequestCallPage from './pages/RequestCallPage';
import ShopInfoPage from './pages/ShopInfoPage';
import UploadBannerPage from './pages/UploadBanner';
function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <div className="container__main">
                <div className="container__main-header">
                    <Header />
                </div>
                <div className="container__main-content">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/trang-chu" element={<HomePage />} />
                        <Route path="/products" element={<ProductPage />} />
                        <Route path="/product/:id" element={<DetailProduct />} />
                        <Route path="/order/create" element={<OrderCreatePage />} />
                        <Route path="/admin/login" element={<LoginPage />} />
                        <Route path="/admin/upload" element={<UploadBannerPage />} />
                        <Route path="/admin/shop-info" element={<ShopInfoPage />} />
                        <Route path="/admin/categories" element={<CategoriesPage />} />
                        <Route path="/admin/products" element={<ProductsAdminPage />} />
                        <Route path="/admin/orders" element={<OrderAdminPage />} />
                        <Route path="/admin/request-calls" element={<RequestCallPage />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
            </div>
            <FloatingContact />
            <Footer />
        </BrowserRouter>
    );
}

export default App;
