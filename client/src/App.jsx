import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { ToastProvider } from "./components/Toast";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import Header from "./components/Header";
import NotificationBanner from "./components/NotificationBanner";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.css";

const Home = React.lazy(() => import("./pages/Home"));
const BookDetail = React.lazy(() => import("./pages/BookDetail"));
const Cart = React.lazy(() => import("./pages/Cart"));
const Checkout = React.lazy(() => import("./pages/Checkout"));
const Wishlist = React.lazy(() => import("./pages/Wishlist"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const Profile = React.lazy(() => import("./pages/Profile"));
const MyOrders = React.lazy(() => import("./pages/MyOrders"));
const PaymentResult = React.lazy(() => import("./pages/PaymentResult"));
const OrderSuccess = React.lazy(() => import("./pages/OrderSuccess"));
const OrderDetail = React.lazy(() => import("./pages/OrderDetail"));
const AiChat = React.lazy(() => import("./pages/AiChat"));
const AdminLayout = React.lazy(() => import("./admin/AdminLayout"));
const Dashboard = React.lazy(() => import("./admin/pages/Dashboard"));
const BooksManagement = React.lazy(() => import("./admin/pages/BooksManagement"));
const OrdersManagement = React.lazy(() => import("./admin/pages/OrdersManagement"));
const UsersManagement = React.lazy(() => import("./admin/pages/UsersManagement"));
const Analytics = React.lazy(() => import("./admin/pages/Analytics"));
const PromotionsManagement = React.lazy(() => import("./admin/pages/PromotionsManagement"));
const InventoryManagement = React.lazy(() => import("./admin/pages/InventoryManagement"));

const RouteFallback = () => (
  <div className="route-skeleton" aria-label="Đang tải trang">
    <span className="skeleton route-skeleton-title" />
    <span className="skeleton route-skeleton-line" />
    <span className="skeleton route-skeleton-line short" />
  </div>
);

const AppRoutes = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="app">
      <Header />
      <NotificationBanner />
      <main className="main-content">
        <ErrorBoundary resetKey={location.pathname}>
          <Suspense fallback={<RouteFallback />}>
                <Routes>
                  {/* Customer Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/book/:id" element={<BookDetail />} />
                  <Route path="/books/:id" element={<BookDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/ai" element={<AiChat />} />
                  {/* User Order Routes */}
                  <Route
                    path="/my-orders"
                    element={
                      <ProtectedRoute>
                        <MyOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders/:id"
                    element={
                      <ProtectedRoute>
                        <OrderDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/order-success"
                    element={
                      <ProtectedRoute>
                        <OrderSuccess />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/payment-result" element={<PaymentResult />} />

                  {/* Admin Routes - Protected */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedAdminRoute>
                        <AdminLayout />
                      </ProtectedAdminRoute>
                    }
                  >
                    <Route index element={<Dashboard />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="books" element={<BooksManagement />} />
                    <Route path="orders" element={<OrdersManagement />} />
                    <Route path="users" element={<UsersManagement />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route
                      path="promotions"
                      element={<PromotionsManagement />}
                    />
                    <Route path="inventory" element={<InventoryManagement />} />
                  </Route>
                </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <ToastProvider>
          <Router>
            <AppRoutes />
          </Router>
        </ToastProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
