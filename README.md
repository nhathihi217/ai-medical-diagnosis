# ai-medical-diagnosis

Frontend React + Vite cho ứng dụng chẩn đoán hình ảnh.

## Kết nối backend PBL6

Frontend dùng cookie đăng nhập và các API hiện có trong [`hourin9/pbl6`](https://github.com/hourin9/pbl6):

- `POST /api/Auth/login`, `POST /api/Auth/logout`
- `GET /api/Queue/Pending`, `/api/Queue/ProcDone`, `/api/Queue/Confirmed`, `/api/Queue/Denied`
- `GET /api/Case/{id}`
- `GET /api/Patient`
- `POST /api/Case/{id}/approve`, `POST /api/Case/{id}/deny`

Chạy backend trước, sau đó cấu hình `.env` tại thư mục frontend/repo:

```dotenv
VITE_API_PROXY_TARGET=http://localhost:5134
VITE_API_BASE_URL=
```

`VITE_API_PROXY_TARGET` phải trỏ đúng địa chỉ HTTP/HTTPS mà ASP.NET backend đang lắng nghe. Chạy frontend bằng `npm run dev`; script đã dùng `vite.api.config.ts` để proxy `/api`. Khi deploy frontend khác origin với API, cần cấu hình URL API và backend CORS/cookie phù hợp (cookie đăng nhập cần cho phép credentials và origin cụ thể).

## Chức năng frontend đã nối

- Đăng nhập và đăng xuất cookie.
- Hàng đợi Ca đang xử lý, lịch sử qua các route Queue hiện có.
- Xem chi tiết Ca bằng ID số nhập thủ công.
- Danh sách và lọc bệnh nhân (CCCD không hiển thị).
- Gửi yêu cầu ghi chú/xác nhận đến API hiện có.

## Giới hạn backend cần xử lý để dùng đầy đủ

1. `CaseDto` không trả `Id` hoặc danh sách ảnh. Vì vậy hàng đợi không thể mở đúng chi tiết bằng click; frontend có ô nhập ID Ca làm giải pháp tạm.
2. Backend đang đặt trạng thái `Done` khi approve, trong khi queue `ProcDone` cũng lấy trạng thái `Done`; thao tác approve vì vậy không chuyển Ca khỏi hàng chờ. Action deny hiện chưa lưu thay đổi vào database. Frontend không giả định thao tác đã được lưu thành công về mặt trạng thái.
3. API đăng nhập chỉ trả `200` và cookie, không trả profile/role. Frontend hiện dùng portal người dùng chọn ở màn đăng nhập để hiển thị; backend cần cung cấp thông tin phiên đăng nhập và kiểm tra quyền admin phía server.
4. API tạo Ca backend nhận `CaseCreateDto` có `IFormFile` nhưng action khai báo `[FromBody]`. Cần backend đổi sang `[FromForm]` và cung cấp cách xác định Patient/Reviewer/Uploader trước khi nối form tạo Ca.
5. API Patient trả entity có thuộc tính điều hướng; nếu backend bật serialize tham chiếu vòng, endpoint có thể trả lỗi 500. Nên trả DTO gọn, không chứa CCCD nếu không cần.
6. Cấu hình CORS backend hiện dùng `AllowAnyOrigin`; cách này không tương thích với cookie credential cross-origin. Ưu tiên proxy cùng origin hoặc cấu hình origin cụ thể cùng `AllowCredentials()`.

**Lưu ý an toàn:** `backend/Program.cs` hiện gọi `DbUtils.NukeRestart(db)` khi khởi động. Hãy kiểm tra tác động của lệnh này trước khi kết nối backend với cơ sở dữ liệu có dữ liệu cần giữ.

Trang quản trị, thống kê/cấu hình, tạo Ca, RAG và các chức năng không có API tương ứng vẫn chưa dùng dữ liệu thật.
