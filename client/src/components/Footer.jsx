import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section footer-brand">
            <h3>📚 BookStore</h3>
            <p>
              Cửa hàng sách trực tuyến - Mang đến những cuốn sách chất lượng với
              giá tốt nhất.
            </p>
            <span className="footer-chip">Cam kết giao hàng toàn quốc</span>
          </div>

          <div className="footer-section">
            <h4>Liên kết nhanh</h4>
            <ul className="footer-links">
              <li>
                <a href="/">Trang chủ</a>
              </li>
              <li>
                <a href="/wishlist">Yêu thích</a>
              </li>
              <li>
                <a href="/cart">Giỏ hàng</a>
              </li>
              <li>
                <a href="/my-orders">Đơn hàng của tôi</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Hỗ trợ khách hàng</h4>
            <ul className="footer-contact">
              <li>🕒 08:00 - 21:00 (Thứ 2 - Chủ nhật)</li>
              <li>🚚 Miễn phí ship đơn từ 299.000đ</li>
              <li>💳 Hỗ trợ COD, Chuyển khoản, VNPay</li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Liên hệ</h4>
            <ul className="footer-contact">
              <li>📞 0399982150</li>
              <li>📧 contact@bookstore.vn</li>
              <li>📍 Hồ Chí Minh, Việt Nam</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 BookStore. Nhóm 13 - React JS Project.</p>
          <p className="footer-bottom-note">
            Nền tảng đọc sách hiện đại, tối ưu cho cả desktop và mobile.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
