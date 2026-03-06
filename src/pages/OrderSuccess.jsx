import React from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderSuccess.css';

const OrderSuccess = () => {
    const navigate = useNavigate();

    return (
        <div className="order-success-page">
            <div className="container">
                <div className="success-card">
                    <div className="success-icon">✅</div>
                    <h1>Đặt Hàng Thành Công!</h1>
                    <p className="success-message">
                        Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng.
                    </p>

                    <div className="success-info">
                        <div className="info-item">
                            <span className="icon">📧</span>
                            <p>Email xác nhận đã được gửi đến hộp thư của bạn</p>
                        </div>
                        <div className="info-item">
                            <span className="icon">📦</span>
                            <p>Đơn hàng sẽ được xử lý trong vòng 24h</p>
                        </div>
                        <div className="info-item">
                            <span className="icon">🚚</span>
                            <p>Thời gian giao hàng dự kiến: 3-5 ngày làm việc</p>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button
                            onClick={() => navigate('/my-orders')}
                            className="btn btn-primary"
                        >
                            Xem Đơn Hàng
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="btn btn-outline"
                        >
                            Tiếp Tục Mua Sắm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
