# Phan cong code cho 5 nguoi

Muc tieu: chia ro ownership de moi nguoi quan ly 1 phan code, giam conflict khi merge.

## Tong quan chia 5 phan

| Nguoi | Phan quan ly                                 | Folder chinh                                                                                                                                                                                                                      |
| ----- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Frontend UI khach hang (catalog + trinh bay) | `client/src/components`, `client/src/pages/Home*`, `client/src/pages/BookDetail*`, `client/src/pages/Wishlist*`, `client/src/pages/Cart*`, `client/src/pages/Checkout*`                                                           |
| 2     | Frontend Auth + tai khoan + don hang user    | `client/src/pages/Login.jsx`, `client/src/pages/Register.jsx`, `client/src/pages/Profile*`, `client/src/pages/MyOrders*`, `client/src/pages/OrderDetail*`, `client/src/pages/OrderSuccess*`, `client/src/pages/PaymentResult.jsx` |
| 3     | Frontend Admin + route bao ve                | `client/src/admin/**`, `client/src/components/ProtectedRoute.jsx`, `client/src/components/ProtectedAdminRoute.jsx`, `client/src/components/NotificationBanner*`                                                                   |
| 4     | Frontend state management + service call API | `client/src/redux/**`, `client/src/services/**`, `client/src/contexts/ThemeContext.jsx`, `client/src/App.jsx` (phan ket noi route/state)                                                                                          |
| 5     | Backend API + DB + business logic            | `server/src/routes/**`, `server/src/controllers/**`, `server/src/models/**`, `server/src/middleware/**`, `server/src/services/**`, `server/src/config/**`, `server/scripts/**`, `server/src/index.js`                             |

## Nhiem vu chi tiet tung nguoi

### 1) Nguoi 1 - Frontend UI khach hang

- Chiu trach nhiem layout, card, list, pagination, detail view cho san pham sach.
- Toi uu responsive cho trang Home, Book Detail, Cart, Wishlist, Checkout.
- Bao toan style system (mau, spacing, typo) cho nhom trang khach.

### 2) Nguoi 2 - Auth + profile + order flow cua user

- Quan ly luong dang ky/dang nhap/dang xuat.
- Quan ly profile va toan bo man hinh theo doi don hang cua user.
- Phoi hop voi Nguoi 4 (redux/services) va Nguoi 5 (backend auth/order).

### 3) Nguoi 3 - Admin panel

- Quan ly dashboard va cac trang quan tri (books, orders, users, analytics, promotions, inventory).
- Chuan hoa UX trong admin: table/filter/search/form.
- Dam bao route admin duoc protect dung role.

### 4) Nguoi 4 - Redux + API integration

- Quan ly state toan bo app tai `redux`.
- Quan ly lop goi API tai `services`.
- Dam bao contract data giua frontend va backend on dinh, handling loading/error thong nhat.
- Review cac thay doi cross-module de tranh gay side effect state.

### 5) Nguoi 5 - Backend

- Quan ly route/controller/model/middleware/services.
- Dam bao auth, validation, error handling va payment flow.
- Quan ly migration/seeding script va cau hinh ket noi DB.
- Toi uu hieu nang truy van va log/monitoring co ban.

## Quy tac phoi hop

1. Moi nguoi tao branch rieng: `feature/p1-ui-customer`, `feature/p2-auth-order`, ...
2. Khong sua file ownership cua nguoi khac neu chua thong nhat.
3. Neu buoc phai sua cheo module: tao issue nho + comment ro ly do trong PR.
4. PR nho, de review: uu tien < 400 dong thay doi/PR.
5. Truoc khi merge: build frontend + test API local.

## Ranh gioi chinh de tranh conflict

- `client/src/components/Header*` va `client/src/components/Footer*`: ownership cua Nguoi 1 (UI).
- `client/src/App.jsx`: Nguoi 4 la owner, cac nhom khac de xuat thong qua PR.
- `server/src/index.js`: Nguoi 5 la owner.
- Dinh nghia schema (`server/src/models/**`): Nguoi 5 quyet dinh cuoi cung.

## Checklist hang ngay (de ca team theo)

- [ ] Pull moi nhat tu `main` truoc khi code.
- [ ] Chay app va kiem tra man hinh lien quan.
- [ ] Tu review code truoc khi tao PR.
- [ ] Cap nhat task status trong nhom (Done/In Progress/Blocked).
