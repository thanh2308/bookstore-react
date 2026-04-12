# BÁO CÁO TRIỂN KHAI FRONTEND LÊN VERCEL (VITE + REACT)

## 1. Mục tiêu

Triển khai frontend của dự án Bookstore (React + Vite) lên Vercel để có URL online truy cập công khai.

Mô hình triển khai:

```text
Code -> GitHub -> Vercel -> Website online
```

## 2. Phân tích dự án

- Frontend sử dụng Vite, chạy local mặc định tại cổng 5173.
- Frontend nằm trong thư mục `client`.
- Dự án dùng React Router (`BrowserRouter`) nên cần cấu hình rewrite trên Vercel để tránh lỗi 404 khi F5 ở route con.
- Backend Node.js/Express chạy riêng, frontend gọi API thông qua biến môi trường `VITE_API_URL`.

## 3. Chuẩn bị

1. Tài khoản GitHub
2. Tài khoản Vercel (đăng nhập bằng GitHub)
3. Đã cài Node.js và npm
4. Đã build test local thành công

## 4. Thực hiện

### Bước 1: Kiểm tra build local

```bash
cd client
npm install
npm run build
```

Kết quả mong đợi: tạo thư mục `dist` và không báo lỗi build.

### Bước 2: Đẩy source code lên GitHub

Repository hiện tại:

- `https://github.com/thanh2308/bookstore-react`

Nếu chưa có repository, thực hiện:

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

### Bước 3: Deploy bằng Vercel UI

1. Vào https://vercel.com
2. Chọn **New Project**
3. Import repository GitHub
4. Đặt **Root Directory** = `client`
5. Xác nhận cấu hình:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

6. Thêm environment variables:

- `VITE_API_URL=https://your-backend-domain.com/api`
- `VITE_PAYMENT_RETURN_URL=https://your-project.vercel.app/payment-result`
- `VITE_VNPAY_MERCHANT_ID=your_merchant_id`

7. Bấm **Deploy**

### Bước 4: Deploy bằng Vercel CLI (cách code)

```bash
npm i -g vercel
vercel login
cd client
vercel
```

Cấu hình khi được hỏi:

- Link to existing project? -> `N` (nếu tạo mới)
- Framework -> `Vite`
- Output directory -> `dist`

Deploy bản production:

```bash
vercel --prod
```

## 5. Cấu hình đã áp dụng trong project

### 5.1 Cấu hình Vercel cho SPA (React Router)

File: `client/vercel.json`

- Rewrite mọi request về `/index.html` để route frontend hoạt động đúng với `BrowserRouter`.
- Thêm cache header cho tài nguyên tĩnh trong `/assets` để tăng hiệu năng tải trang.

### 5.2 Mẫu biến môi trường production cho frontend

File: `client/.env.production.example`

- Cung cấp sẵn mẫu cấu hình biến môi trường khi deploy thực tế.

### 5.3 Sửa script chạy local fullstack

File: `start-dev.bat`

- Đã sửa đường dẫn từ thư mục `server` sang `client` đúng cách (`cd ..\client`).

File: `start-dev.sh`

- Đã sửa đường dẫn tương ứng trên macOS/Linux (`cd ../client`).

File: `client/package.json`

- Đã sửa script `dev:server` thành `npm --prefix ../server run dev` để chạy backend đúng thư mục.

### 5.4 Mở rộng CORS cho môi trường deploy

File: `server/src/index.js`

- Đã hỗ trợ nhiều frontend origin thông qua `FRONTEND_URLS` (danh sách ngăn cách bởi dấu phẩy).
- Giữ tương thích với `FRONTEND_URL` nếu chưa cấu hình `FRONTEND_URLS`.

File: `server/.env.example`

- Đã thêm file mẫu biến môi trường backend để chạy nhanh trên máy mới.

## 6. Kiểm thử sau deploy

1. Truy cập trang chủ URL Vercel
2. Thử mở route bất kỳ trực tiếp trên thanh địa chỉ, ví dụ:

- `/book/1`
- `/admin`
- `/payment-result`

3. Kiểm tra giao tiếp API:

- Mở DevTools -> Network
- Xác nhận request gửi đến domain backend online

4. Kiểm tra responsive desktop/mobile

## 7. Lỗi thường gặp và cách xử lý

### Lỗi trắng trang sau deploy

- Nguyên nhân: build lỗi hoặc chọn sai root folder
- Cách xử lý: đặt Root Directory = `client`, chạy lại `npm run build` trước khi deploy

### Lỗi 404 khi F5 route con

- Nguyên nhân: chưa có rewrite cho SPA
- Cách xử lý: dùng file `client/vercel.json`

### Lỗi gọi API

- Nguyên nhân: backend chưa deploy hoặc sai `VITE_API_URL`
- Cách xử lý: cập nhật đúng environment variables trên Vercel rồi redeploy

### Lỗi CORS khi frontend online gọi backend

- Nguyên nhân: backend chưa whitelist domain Vercel
- Cách xử lý: cấu hình `FRONTEND_URLS` trong backend, ví dụ:

```env
FRONTEND_URLS=http://localhost:5173,https://your-project.vercel.app
```

## 8. Danh sách screenshot nên chụp để nộp bài

1. Cửa sổ Vercel New Project (chọn repo)
2. Cửa sổ cấu hình project (Root Directory = `client`)
3. Cửa sổ Environment Variables
4. Màn hình Deploy success
5. URL website online trên `.vercel.app`
6. Route con truy cập trực tiếp (ví dụ `/admin`) không bị 404
7. DevTools Network hiển thị request API tới backend online

## 9. Kết quả

Frontend dự án Bookstore đã được cấu hình đầy đủ để triển khai lên Vercel theo đúng stack Vite + React, có hướng dẫn kiểm thử, danh sách lỗi thường gặp và phương án xử lý, sẵn sàng dùng để nộp bài.
