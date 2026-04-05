import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

// Send email
const sendEmail = async ({ to, subject, html }) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Cửa Hàng Sách" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw error;
    }
};

// Order confirmation email
export const sendOrderConfirmation = async (order, user) => {
    const itemsList = order.items.map(item => `
        <tr>
            <td>${item.title}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">${item.price.toLocaleString('vi-VN')}₫</td>
            <td style="text-align: right;">${(item.price * item.quantity).toLocaleString('vi-VN')}₫</td>
        </tr>
    `).join('');

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background: #f0f0f0; }
                .total { font-size: 18px; font-weight: bold; color: #4CAF50; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Đặt Hàng Thành Công!</h1>
                </div>
                <div class="content">
                    <p>Xin chào <strong>${user.name}</strong>,</p>
                    <p>Cảm ơn bạn đã đặt hàng tại Cửa Hàng Sách. Đơn hàng của bạn đã được tiếp nhận.</p>
                    
                    <h3>Thông tin đơn hàng #${order.orderNumber}</h3>
                    <p><strong>Ngày đặt:</strong> ${new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                    <p><strong>Địa chỉ giao hàng:</strong> ${order.shippingAddress.address}, ${order.shippingAddress.city}</p>
                    
                    <h3>Chi tiết đơn hàng:</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th style="text-align: center;">Số lượng</th>
                                <th style="text-align: right;">Đơn giá</th>
                                <th style="text-align: right;">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsList}
                        </tbody>
                    </table>
                    
                    ${order.discount > 0 ? `<p><strong>Giảm giá:</strong> -${order.discount.toLocaleString('vi-VN')}₫ (Mã: ${order.promotionCode})</p>` : ''}
                    <p class="total">Tổng cộng: ${order.totalPrice.toLocaleString('vi-VN')}₫</p>
                    
                    <p>Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng.</p>
                    <p>Hotline: 1900-xxxx</p>
                </div>
                <div class="footer">
                    <p>© 2026 Cửa Hàng Sách. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    await sendEmail({
        to: user.email,
        subject: `Xác nhận đơn hàng #${order.orderNumber}`,
        html
    });
};

// Order status update email
export const sendOrderStatusUpdate = async (order, user) => {
    const statusMessages = {
        confirmed: 'Đơn hàng đã được xác nhận',
        processing: 'Đơn hàng đang được chuẩn bị',
        shipping: 'Đơn hàng đang được giao',
        delivered: 'Đơn hàng đã được giao thành công',
        cancelled: 'Đơn hàng đã bị hủy'
    };

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .status { font-size: 20px; font-weight: bold; color: #2196F3; text-align: center; padding: 20px; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📦 Cập Nhật Đơn Hàng</h1>
                </div>
                <div class="content">
                    <p>Xin chào <strong>${user.name}</strong>,</p>
                    <p>Đơn hàng #${order.orderNumber} của bạn có cập nhật mới:</p>
                    
                    <div class="status">${statusMessages[order.status]}</div>
                    
                    ${order.trackingNumber ? `<p><strong>Mã vận đơn:</strong> ${order.trackingNumber}</p>` : ''}
                    
                    <p>Cảm ơn bạn đã mua hàng tại Cửa Hàng Sách!</p>
                </div>
                <div class="footer">
                    <p>© 2026 Cửa Hàng Sách. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    await sendEmail({
        to: user.email,
        subject: `Cập nhật đơn hàng #${order.orderNumber}`,
        html
    });

    
};

// Gửi email chào mừng khi đăng ký thành công
export const sendWelcomeEmail = async (user) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4CAF50;">Chào mừng đến với Cửa Hàng Sách! 🎉</h2>
            <p>Xin chào <strong>${user.name}</strong>,</p>
            <p>Cảm ơn bạn đã đăng ký tài khoản. Chúng tôi rất vui được đồng hành cùng bạn trên con đường khám phá tri thức.</p>
            <p>Hãy truy cập ngay website để tìm kiếm những cuốn sách yêu thích của bạn nhé!</p>
            <p>Trân trọng,<br>Đội ngũ Cửa Hàng Sách</p>
        </div>
    `;

    await sendEmail({
        to: user.email,
        subject: 'Chào mừng bạn đến với Cửa Hàng Sách',
        html
    });
};

// Gửi email reset mật khẩu
export const sendResetPasswordEmail = async (user, resetUrl) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #f44336;">Yêu cầu đặt lại mật khẩu 🔒</h2>
            <p>Xin chào <strong>${user.name}</strong>,</p>
            <p>Bạn nhận được email này vì đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
            <p>Vui lòng click vào nút bên dưới để đặt lại mật khẩu (Link có hiệu lực trong 10 phút):</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #f44336; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Đặt lại mật khẩu</a>
            </div>
            <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này và mật khẩu của bạn sẽ được giữ nguyên.</p>
        </div>
    `;

    await sendEmail({
        to: user.email,
        subject: 'Yêu cầu đặt lại mật khẩu',
        html
    });
};

export default { 
    sendOrderConfirmation, 
    sendOrderStatusUpdate,
    sendWelcomeEmail,
    sendResetPasswordEmail
};
