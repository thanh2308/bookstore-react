import React, { useState, useEffect } from 'react';
import './NotificationBanner.css';

const NotificationBanner = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Check if banner was dismissed
        const dismissed = localStorage.getItem('promoBannerDismissed');
        if (!dismissed) {
            setTimeout(() => setIsVisible(true), 2000);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        setIsDismissed(true);
        localStorage.setItem('promoBannerDismissed', 'true');
    };

    if (isDismissed || !isVisible) return null;

    return (
        <div className={`notification-banner ${isVisible ? 'show' : ''}`}>
            <div className="banner-content">
                <span className="banner-icon">🎉</span>
                <div className="banner-text">
                    <strong>Khuyến mãi đặc biệt!</strong> Giảm 20% cho tất cả sách kỹ năng sống.
                    Áp dụng từ hôm nay đến hết tháng!
                </div>
                <button onClick={handleDismiss} className="banner-close">✕</button>
            </div>
        </div>
    );
};

export default NotificationBanner;
