# 🛒 TaiLocShop - E-commerce Platform

**TaiLocShop** là một nền tảng thương mại điện tử Full-stack hiện đại, chuyên biệt cho việc giao dịch vật phẩm Game (In-game assets), được xây dựng với kiến trúc Scalable, bảo mật cao và tối ưu trải nghiệm người dùng.

> **Project Link:** [shop.minhminh24x.me](https://shop.minhminh24x.me)  
> **Author:** Lê Minh Lộc (MinhMinh24x)

---

## 🚀 Tính Năng Nổi Bật (Key Features)

### 1. Hệ thống người dùng & Phân quyền (Auth & RBAC)
*   **Xác thực đa lớp:** Đăng ký/Đăng nhập bảo mật với JWT (Access/Refresh Token).
*   **Email OTP:** Xác thực tài khoản qua Email (Nodemailer).
*   **Role-based Access Control:** Phân quyền chi tiết cho `ADMIN`, `MANAGER`, `STAFF`, `SUPPLIER`, `CUSTOMER`.
*   **VIP System:** Tự động thăng hạng VIP dựa trên tổng chi tiêu tích lũy, hưởng ưu đãi giảm giá riêng biệt.

### 2. Quản lý Sản phẩm & Kho hàng (Inventory & Products)
*   **Danh mục đa cấp:** Hỗ trợ cấu trúc danh mục Tree-structure (Cha-Con) không giới hạn.
*   **Đa đơn vị tính:** Quản lý quy đổi linh hoạt giữa `Piece`, `Stack`, `Shulker Box`.
*   **Real-time Inventory:** Tự động trừ kho khi có đơn hàng thành công, soft-reserve khi khách đặt.
*   **Supplier Portal:** Cổng thông tin dành riêng cho Nhà cung cấp gửi phiếu nhập hàng, theo dõi trạng thái duyệt giá.

### 3. Quy trình Đơn hàng & Thanh toán (Orders & Payments)
*   **Đa tiền tệ:** Hỗ trợ thanh toán song song bằng `Coin` (Ingame) và `USD` (Donate).
*   **Delivery Slots:** Khách hàng chủ động chọn khung giờ nhận hàng Ingame.
*   **Order Tracking:** Theo dõi trạng thái đơn hàng realtime (`Pending` -> `Preparing` -> `Ready` -> `Completed`).
*   **Lịch sử giao dịch:** Ghi log chi tiết mọi biến động tài sản.

### 4. Tương tác & Tiện ích (UX/UI)
*   **Voucher:** Hệ thống mã giảm giá (Theo % hoặc số tiền fix).
*   **Wishlist:** Lưu sản phẩm yêu thích.
*   **Review System:** Đánh giá sản phẩm và chất lượng phục vụ của Staff.
*   **Responsive Design:** Giao diện tối ưu cho Desktop, Tablet và Mobile.

---

## 🛠️ Tech Stack (Công Nghệ Sử Dụng)

### Frontend (Client-side)
*   **Framework:** ReactJS (v18)
*   **State Management:** Zustand (Nhẹ, nhanh, scalable).
*   **Styling:** Tailwind CSS (Utility-first), Framer Motion (Complex Animations).
*   **Routing:** React Router DOM v6.
*   **Networking:** Axios (Interceptors để handle Token refresh).
*   **Real-time:** Socket.io-client.

### Backend (Server-side)
*   **Runtime:** Node.js, Express.js.
*   **Database:** PostgreSQL (Relational DB).
*   **ORM:** Prisma (Type-safe database access).
*   **Validations:** Zod (Schema validation).
*   **Security:** Helmet, CORS, Bcryptjs, Express-slow-down (DDOS protection).
*   **Logging:** Morgan.

---

## 📂 Project Structure

```
tailocshop/
├── backend/                # Server Application
│   ├── prisma/             # Database Schema & Migrations
│   ├── server/
│   │   ├── controllers/    # Request Handling Logic
│   │   ├── middleware/     # Auth, Validation, Error Handling
│   │   ├── routes/         # API Endpoint Definitions
│   │   ├── services/       # Business Logic Layer
│   │   ├── utils/          # Helper functions
│   │   └── index.js        # Entry point
│   ├── .env.example        # Environment Variables Template
│   └── package.json
│
├── frontend/               # Client Application
│   ├── public/
│   ├── src/
│   │   ├── assets/         # Images, Icons
│   │   ├── components/     # Reusable UI Components
│   │   ├── pages/          # Route Pages
│   │   ├── store/          # Zustand State Store
│   │   └── utils/          # Helper functions
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation & Setup (Hướng dẫn Cài đặt)

### Yêu cầu hệ thống (Prerequisites)
*   **Node.js:** v16 trở lên.
*   **PostgreSQL:** Đã cài đặt và tạo Database trống.
*   **Git:** Để clone code.

### Bước 1: Clone dự án
```bash
git clone https://github.com/minhminh24x/tailocshop.git
cd tailocshop
```

### Bước 2: Cài đặt Backend
```bash
cd backend
npm install

# Tạo file .env từ template
cp .env.example .env
# (Bạn cần điền thông tin Database URL, JWT Secret,... vào file .env)

# Khởi tạo Database
npx prisma migrate dev --name init
npx prisma db seed # (Nếu có seed data)

# Chạy Server (Dev mode)
npm run dev
```

### Bước 3: Cài đặt Frontend
```bash
# Mở terminal mới
cd frontend
npm install

# Chạy Client
npm start
```
*Truy cập Website tại: `http://localhost:3000`*

---

## 🔑 Environment Variables (.env)

Vui lòng tạo file `.env` trong thư mục `backend/` với các biến sau:

```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/tailocshop_db"

JWT_SECRET="your_super_secret_key"
JWT_EXPIRE="30d"

EMAIL_SERVICE="gmail"
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_app_password"

CLIENT_URL="http://localhost:3000"
```

---

## 🤝 Contributing (Đóng góp)
Dự án luôn hoan nghênh mọi sự đóng góp. Vui lòng tạo **Pull Request** hoặc mở **Issue** để báo lỗi/đề xuất tính năng.

1. Fork dự án
2. Tạo nhánh tính năng (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên nhánh (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

---

## 📜 License
Dự án được phân phối dưới giấy phép **MIT License**. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

**© 2024 TaiLocShop. Developed by MinhMinh24x.**