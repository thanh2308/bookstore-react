import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import Header from './components/Header';
import NotificationBanner from './components/NotificationBanner';
import Footer from './components/Footer';
import Home from './pages/Home';
import BookDetail from './pages/BookDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';
import OrderSuccess from './pages/OrderSuccess';
import OrderDetail from './pages/OrderDetail';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import BooksManagement from './admin/pages/BooksManagement';
import OrdersManagement from './admin/pages/OrdersManagement';
import UsersManagement from './admin/pages/UsersManagement';
import Analytics from './admin/pages/Analytics';
import PromotionsManagement from './admin/pages/PromotionsManagement';
import InventoryManagement from './admin/pages/InventoryManagement';
import './App.css';

function App() {
    return (
        <Provider store={store}>
            <ToastProvider>
                <Router>
                    <div className="app">
                        <Header />
                        <NotificationBanner />
                        <main className="main-content">
                            <Routes>
                                {/* Customer Routes */}
                                <Route path="/" element={<Home />} />
                                <Route path="/book/:id" element={<BookDetail />} />
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/wishlist" element={<Wishlist />} />
                                <Route path="/checkout" element={<Checkout />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/profile" element={<Profile />} />

                                {/* User Order Routes */}
                                <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                                <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />

                                {/* Admin Routes - Protected */}
                                <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
                                    <Route index element={<Dashboard />} />
                                    <Route path="dashboard" element={<Dashboard />} />
                                    <Route path="books" element={<BooksManagement />} />
                                    <Route path="orders" element={<OrdersManagement />} />
                                    <Route path="users" element={<UsersManagement />} />
                                    <Route path="analytics" element={<Analytics />} />
                                    <Route path="promotions" element={<PromotionsManagement />} />
                                    <Route path="inventory" element={<InventoryManagement />} />
                                </Route>
                            </Routes>
                        </main>
                        <Footer />
                    </div>
                </Router>
            </ToastProvider>
        </Provider>
    );
}

export default App;
