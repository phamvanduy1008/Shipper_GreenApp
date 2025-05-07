# 🚚 SHIPPER-APP

Đây là một ứng dụng di động dành cho shipper được xây dựng với **Expo** và **TypeScript**, hỗ trợ quản lý đơn hàng, tài khoản, và xác thực người dùng. Dự án tổ chức theo mô hình nguồn (`app`) với các thành phần như đăng nhập (`auth`), trang chính (`page`), và các tài nguyên khác.

---

## 🚀 Bắt đầu

### 1. Cài đặt dependencies

Cài đặt các thư viện **Node.js**:

```bash
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env` (nếu cần thiết) để thiết lập các biến môi trường, ví dụ:

```env
EXPO_API_URL=http://localhost:3000/api
EXPO_PUBLIC_API_KEY=your_api_key
```

Cấu hình thêm trong `app.json` nếu cần.

### 3. Chạy dự án

#### Bước 1: Khởi động ứng dụng

Khởi động ứng dụng với **Expo**:

```bash
npx expo start
```

Sau khi chạy, bạn có thể:
- Quét mã QR bằng ứng dụng **Expo Go** trên iOS/Android.
- Nhấn `a` để chạy trên **Android Emulator**.
- Nhấn `i` để chạy trên **iOS Simulator** (chỉ trên macOS).
- Nhấn `w` để chạy trên trình duyệt web.

#### Bước 2: Kiểm tra ứng dụng

Mở ứng dụng và kiểm tra các trang như `Home`, `account`, và `order`. Đảm bảo đăng nhập hoạt động qua `auth/login`.

#### Bước 3: Xây dựng cho sản xuất

Tạo bản build:

```bash
npx expo export -p web
```

Hoặc build cho di động (theo hướng dẫn Expo).

---

## 🗂 Cấu trúc thư mục

```plaintext
SHIPPER-APP/
├── .expo/                  # Cấu hình Expo
├── .vscode/                # Cấu hình VSCode
├── app/                    # Nguồn mã chính
│   ├── auth/               # Quản lý xác thực
│   │   ├── Layout.tsx      # Bố cục xác thực
│   │   └── login.tsx       # Trang đăng nhập
│   ├── constants/          # Hằng số
│   ├── page/               # Trang ứng dụng
│   │   ├── account/        # Quản lý tài khoản
│   │   ├── order/          # Quản lý đơn hàng
│   │   ├── Home.tsx        # Trang chính
│   │   ├── Layout.tsx      # Bố cục trang
│   │   └── index.tsx       # Điểm nhập trang
├── assets/                 # Tài nguyên (hình ảnh, font)
├── node_modules/           # Thư viện Node.js
├── .gitignore              # File bỏ qua Git
├── app.json                # Cấu hình Expo
├── eslint.config.js        # Cấu hình ESLint
├── expo-env.d.ts           # Định nghĩa TypeScript cho Expo
├── package-lock.json       # Khóa phiên bản dependencies
├── package.json            # Dependencies và scripts
├── README.md               # File này
└── tsconfig.json           # Cấu hình TypeScript
```

---

## 🧱 Công nghệ sử dụng

- **Expo**: Framework phát triển ứng dụng di động.
- **TypeScript**: Đảm bảo mã nguồn an toàn.
- **React**: Framework UI.
- **JavaScript/TypeScript**: Logic ứng dụng.

---

## 📝 Ghi chú

- Đảm bảo đã cài **Node.js** và **Expo CLI**.
- Cài đặt **Expo Go** trên thiết bị để thử nghiệm.
- Chỉnh sửa các trang trong `app/page` để tùy chỉnh.

---

## ✍️ Tác giả

- Nhóm: Green
- Email: [phamvanduy.dev@gmail.com](mailto:phamvanduy.dev@gmail.com)
- GitHub: [GreenTreeApp](https://github.com/GreenTreeApp)

Cảm ơn bạn đã sử dụng dự án! 🌟