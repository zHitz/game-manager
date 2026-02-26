# COD Game Automation Manager - Update Log

## Version 1.0.1 (Current)
*Bug Fixes and Stability Improvements*

- **API & Error Handling (`frontend/js/api.js`)**
  - Khắc phục lỗi báo "Network Error" chung chung. Bây giờ module fetch sẽ kiểm tra `!res.ok` và hiển thị trực tiếp thông điệp trả về từ backend thay vì im lặng nuốt lỗi.

- **UI & Memory Management (`frontend/js/pages/task-runner.js`)**
  - **Memory Leak Fix**: Khắc phục lỗi rò rỉ bộ đếm giờ (setInterval leak) khi chạy Macro thông qua việc tái sử dụng biến `_runningMacros` (kiểu Map) để quản lý bộ đếm dựa trên `filename`. Gọi thẻ `clearInterval` đúng lúc khi macro hoàn tất hoặc bị lỗi.
  - **WebSocket Integration**: Hoàn thiện Activity Feed để hiển thị dữ liệu real-time của Macro. Bổ sung các event handler `macro_started`, `macro_progress`, `macro_completed`, và `macro_failed` vào UI update loop từ WebSocket.

- **Networking & Server Optimization (`backend/core/macro_replay.py`)**
  - **WebSocket Throttling**: Tối ưu hóa backend bằng cách hạn chế tần suất bắn tín hiệu `macro_progress` qua WebSocket. Hiện tại, nó chỉ gửi dữ liệu progress tối đa 1 lần mỗi giây (throttle 1.0s), ngăn chặn dứt điểm hiện tượng spam tín hiệu khi macro chạy dày đặc làm treo trình duyệt.
