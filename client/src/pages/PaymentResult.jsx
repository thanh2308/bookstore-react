import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api";

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Đang xử lý kết quả...");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Lấy toàn bộ tham số trên URL mà VNPay gửi về
        const queryString = searchParams.toString();

        // Gọi API backend để kiểm tra chữ ký bảo mật
        const res = await api.get(`/payment/vnpay_return?${queryString}`);

        if (res.data.code === "00") {
          setStatus("✅ Thanh toán thành công tuyệt đối!");
        } else {
          setStatus("❌ Thanh toán thất bại hoặc đã bị hủy!");
        }
      } catch (error) {
        console.error(error);
        setStatus("⚠️ Lỗi xác thực chữ ký VNPay!");
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>{status}</h1>
      <br />
      <Link to="/" className="btn-primary">
        Quay về trang chủ
      </Link>
    </div>
  );
};

export default PaymentResult;
