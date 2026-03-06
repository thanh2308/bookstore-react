# Web Bán Sách (Bookstore E-commerce)

Ứng dụng thương mại điện tử bán sách trực tuyến với  đầy đủ tính năng quản lý sách, đơn hàng, và người dùng.

## 🚀 Tech Stack

- **Frontend**: React 18 + Vite + Redux Toolkit
- **Backend**: Node.js + Express + MongoDB
- **Auth**: JWT (JSON Web Tokens)
- **Upload**: Multer
- **Email**: Nodemailer

## 📦 Features

### Customer Features
- 🔐 Đăng ký / Đăng nhập
- 📚 Duyệt sách với filter & search
- 🛒 Giỏ hàng
- ❤️ Wishlist
- 📦 Đặt hàng và theo dõi
- ⭐ Reviews & Ratings
- 👤 Quản lý profile

### Admin Features
- 📖 Quản lý sách (CRUD)
- 📦 Quản lý đơn hàng
- 👥 Quản lý người dùng
- 🎁 Quản lý khuyến mãi
- 📊 Dashboard analytics
- 📦 Quản lý kho

## 🛠️ Installation

### Prerequisites
- Node.js >= 16
- MongoDB >= 5.0
- npm hoặc yarn

### Quick Start (Recommended)

**Windows:**
```bash
# Double-click hoặc chạy:
start-dev.bat
```

**macOS/Linux:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

Script sẽ tự động:
- ✅ Kiểm tra và khởi động MongoDB
- ✅ Install dependencies (nếu cần)
- ✅ Tạo .env files
- ✅ Khởi động cả backend và frontend

### Manual Setup

#### Backend Setup

```bash
# Navigate to server
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Create uploads folder
mkdir -p uploads/books

# Start server
npm run dev
```

### Frontend Setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit VITE_API_URL

# Start dev server
npm run dev
```

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bookstore
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📖 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/profile` - Update profile (Protected)

### Books
- `GET /api/books` - Get all books (with filters)
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Create book (Admin)
- `PUT /api/books/:id` - Update book (Admin)
- `DELETE /api/books/:id` - Delete book (Admin)
- `POST /api/books/:id/reviews` - Add review (Protected)

### Orders
- `POST /api/orders` - Create order (Protected)
- `GET /api/orders/myorders` - Get my orders (Protected)
- `GET /api/orders/:id` - Get order by ID (Protected)
- `PUT /api/orders/:id/cancel` - Cancel order (Protected)
- `GET /api/orders` - Get all orders (Admin)
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)
- `POST /api/users/address` - Add address (Protected)
- `GET /api/users/wishlist` - Get wishlist (Protected)
- `POST /api/users/wishlist/:bookId` - Toggle wishlist (Protected)

### Promotions
- `GET /api/promotions` - Get promotions
- `POST /api/promotions/validate` - Validate promo code (Protected)
- `POST /api/promotions` - Create promotion (Admin)
- `PUT /api/promotions/:id` - Update promotion (Admin)
- `DELETE /api/promotions/:id` - Delete promotion (Admin)

## 🧪 Testing

### Test Admin Account
Email: `admin@example.com`  
Password: `your_password`

(Any email containing "admin" will be assigned admin role)

### Sample API Calls

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@test.com","password":"123456"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"123456"}'

# Get Books
curl http://localhost:5000/api/books?category=Tiểu%20thuyết&page=1
```

## 📁 Project Structure

```
d:\Web_Ban_Sach/
├── server/                # Backend
│   ├── src/
│   │   ├── config/       # Database config
│   │   ├── models/       # Mongoose models
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Custom middleware
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── index.js      # Server entry
│   └── package.json
├── src/                  # Frontend
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── redux/           # Redux store
│   ├── admin/           # Admin pages
│   └── data/            # Mock data
├── package.json
└── vite.config.js
```

## 🚦 Deployment

### Backend (Heroku example)
```bash
cd server
heroku create bookstore-api
heroku addons:create mongolab
heroku config:set JWT_SECRET=your_secret
git push heroku main
```

### Frontend (Vercel example)
```bash
vercel --prod
# Set VITE_API_URL to your backend URL
```

## 📝 License

MIT

## 👨‍💻 Author

Created for Web Development Project

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

**Happy Coding! 📚✨**
