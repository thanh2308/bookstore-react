import crypto from "crypto";
import qs from "qs";
import moment from "moment";
import mongoose from "mongoose";
import Order from "../models/Order.js";

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

export const createPaymentUrl = async (req, res) => {
  try {
    process.env.TZ = "Asia/Ho_Chi_Minh";
    let date = new Date();
    let createDate = moment(date).format("YYYYMMDDHHmmss");

    let ipAddr =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";

    let tmnCode = process.env.VNPAY_TMN_CODE;
    let secretKey = process.env.VNPAY_HASH_SECRET;
    let vnpUrl = process.env.VNPAY_URL;
    let returnUrl = process.env.VNPAY_RETURN_URL;

    let amount = Number(req.body.amount);
    let bankCode = req.body.bankCode || "";
    let orderId = req.body.orderId;
    if (!orderId) {
      return res.status(400).json({ message: "Thiếu mã đơn hàng" });
    }

    let orderInfo =
      req.body.orderDescription || `Thanh toan don hang ${orderId}`;

    const orderQuery = mongoose.Types.ObjectId.isValid(orderId)
      ? { $or: [{ _id: orderId }, { orderNumber: orderId }] }
      : { orderNumber: orderId };

    const order = await Order.findOne(orderQuery);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Không có quyền thanh toán đơn hàng này" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Đơn hàng đã được thanh toán" });
    }

    amount = order.totalPrice;
    orderId = order._id.toString();
    orderInfo =
      req.body.orderDescription || `Thanh toan don hang ${order.orderNumber}`;
    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = "vn";
    vnp_Params["vnp_CurrCode"] = "VND";
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = orderInfo;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = amount * 100;
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;

    if (bankCode !== null && bankCode !== "") {
      vnp_Params["vnp_BankCode"] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);
    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;

    vnpUrl += "?" + qs.stringify(vnp_Params, { encode: false });

    res.status(200).json({ code: "00", paymentUrl: vnpUrl });
  } catch (error) {
    console.error("Lỗi tạo URL VNPay:", error);
    res.status(500).json({ message: "Lỗi server khi tạo thanh toán" });
  }
};

export const vnpayReturn = async (req, res) => {
  try {
    let vnp_Params = { ...req.query };

    let secureHash = vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);

    let secretKey = process.env.VNPAY_HASH_SECRET;
    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      const responseCode = vnp_Params["vnp_ResponseCode"];
      const orderIdentifier = vnp_Params["vnp_TxnRef"];
      const transactionId = vnp_Params["vnp_TransactionNo"];

      let order = null;
      if (orderIdentifier) {
        const query = mongoose.Types.ObjectId.isValid(orderIdentifier)
          ? {
              $or: [{ _id: orderIdentifier }, { orderNumber: orderIdentifier }],
            }
          : { orderNumber: orderIdentifier };

        order = await Order.findOne(query);
      }

      if (order) {
        if (responseCode === "00") {
          order.paymentStatus = "paid";
          order.paymentDetails = {
            transactionId: transactionId || order.paymentDetails?.transactionId,
            paidAt: new Date(),
          };
        } else if (order.paymentStatus !== "paid") {
          order.paymentStatus = "failed";
        }

        await order.save();
      }

      if (responseCode === "00") {
        res.status(200).json({
          code: responseCode,
          message: "Thanh toán thành công",
        });
      } else {
        res.status(200).json({
          code: responseCode,
          message: "Thanh toán thất bại hoặc bị hủy",
        });
      }
    } else {
      res.status(400).json({ code: "97", message: "Chữ ký không hợp lệ" });
    }
  } catch (error) {
    console.error("Lỗi xử lý kết quả VNPay:", error);
    res.status(500).json({ message: "Lỗi xử lý kết quả VNPay" });
  }
};
