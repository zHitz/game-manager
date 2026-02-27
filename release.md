# 🚀 Release Notes - Version 1.0.4
*Emulator Workspace Organization, Menus & UX Polish*

Đây là bản cập nhật lớn (Major Update) lột xác hoàn toàn giao diện quản lý Emulator Instances. Biến trang trạng thái đơn giản trở thành một **Control Panel / Workspace** hành động cao cấp dành cho môi trường sản xuất.

---

## ✨ Features & Enhancements

### 1. 🗂️ Chrome-Style Tabs Workspace
Cấu trúc lại toàn bộ không gian làm việc theo dạng Tab đa cửa sổ mượt mà giống hệt trình duyệt Chrome.
- **Tab Management System:** Ngành nhóm các máy ảo (Ví dụ: Farming, Scanners) vào các không gian làm việc độc lập.
- **Dynamic Badge Count:** Pill badge tự động đếm và cập nhật số lượng máy ảo bên trong mỗi Tab.
- **Inline Tab Editing:** Dễ dàng tạo tab mới bằng phím `+`. Nhấp đúp (Double-click) vào bất kỳ nhãn Tab nào để đổi tên trực tiếp ngay tại đó.
- Cung cấp nút `✕` để đóng Tab (Tự động hoàn trả các máy ảo bên trong về lại Tab gốc "All Instances").

### 2. 🖱️ Advanced Context Menus (···)
Dẹp bỏ các dãy nút bấm tĩnh chiếm diện tích để lấy lại Không gian làm việc.
- **Card Context Menu Redesign:** Bổ sung nút More (···) khi hover qua từng Card màn hình để gọi **Dropdown Menu** hiện đại bóng đổ mượt mà.
- **Right-Click Context Menu:** Hỗ trợ nhấp chuột phải trên toàn bộ dải Card thiết bị để mở nhanh Menu ngữ cảnh.
- Cung cấp hàng loạt thao tác nâng cao trong Menu:
  - Sao chép nhanh (Copy Name, Copy ADB Serial, Copy Index) vào Clipboard cực kỳ tiện dụng với hiệu ứng Tick `✓`.
  - Thay đổi vị trí: Gán máy ảo sang Tab khác bằng chức năng **Move To Tab** ngay bên mặt Card.
  - Phím tắt Start/Stop Instance & Rename Instance tích hợp thẳng vào Context Menu.

### 3. ⚡ Core Interactions & Telemetry
Chuyển đổi hoàn toàn phương thức tương tác người dùng.
- **Action-centric Control Panel:** Thanh Toolbar mới với công cụ Filter theo nút trạng thái (`All`, `Running`, `Stopped`) và Thanh Tìm kiếm.
- **Auto-Refresh Ring:** Không còn khoảng chờ mù lòa. Bổ sung Toggle bật tắt API Polling kèm Vòng lặp đếm ngược đồ hoạ (SVG Ring) cực kì trực quan (5 giây chu kỳ).
- **Pro UX Hover Actions:** Giấu nút Quick Actions và xuất hiện mờ (Fade In) chỉ khi người dùng rê chuột đúng vào hàng thiết bị đang tương tác. 
- **Bulk Safety:** Bổ sung công cụ Checkbox hàng loạt và gắn Dialog Confirm cho các tuỳ chọn "Stop All", "Stop Selected" chống click nhầm làm đứng quy trình tự động.
- **Inline Rename:** Cung cấp sửa tên Card bằng Double-Click, không cần hộp thoại phiền nhiễu.
- Hiển thị đầy đủ **Telemetry** thời gian thực trải ngang theo từng thiết bị: `PID | Resolution | DPI | CPU | RAM`.

### 4. 🎨 Visual & Engine Upgrades
- Tinh chỉnh CSS ưu tiên hàng đầu (`!important`) chống vỡ chữ tại trang Search.
- **Staggered Animations:** Giao diện load danh sách không còn bị chớp nháy đột ngột mà được tải trượt lên tuần tự mượt mà (`fadeInSlideUp` animation delay dynamic).
- **Graceful Error Handling:** Tăng cường tính ổn định của vòng lặp Render List bằng cách phong toả nó trong Block `try...catch` để báo lỗi đỏ ra màn hình thay vì màn trắng khi backend API trả về lỗi dữ liệu.
- Phân bổ hệ màu Code quy chuẩn Status Badges (Emeral cho Running, Muted cho Stopped).

---
