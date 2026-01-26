import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>📚 BookStore</h3>
                        <p>Cửa hàng sách trực tuyến - Mang đến những cuốn sách chất lượng với giá tốt nhất.</p>
                    </div>

                    <div className="footer-section">
                        <h4>Liên hệ</h4>
                        <ul className="footer-contact">
                            <li>📞 1900-xxxx</li>
                            <li>📧 contact@bookstore.vn</li>
                            <li>📍 Hà Nội, Việt Nam</li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2025 BookStore. Nhóm 13 - React JS Project.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
