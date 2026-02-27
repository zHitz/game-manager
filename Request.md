Tuyệt — mình sẽ review trang **Emulator Instances** này theo chuẩn **UX audit production dashboard** (không phải feedback cảm tính).
Mình chia làm 3 phần:

> ① Audit UI/UX hiện tại
> ② Đề xuất cải thiện layout + interaction
> ③ Roadmap chức năng nên có (theo maturity level)

---

# ① UX Audit — vấn đề thật sự của page

## ❗ Vấn đề lớn nhất: hierarchy chưa đúng tầng control

Trang này là:

> **lowest level control panel (infrastructure layer)**

Nhưng UI hiện tại lại hiển thị giống:

> status dashboard

Trong khi user vào page này mục tiêu là:

* start nhiều instance
* stop hàng loạt
* debug instance
* xem runtime info

👉 tức là **action-centric page**, không phải overview page.

---

## ❗ CTA hierarchy sai

Hiện tại mỗi row:

```
[ info ]                     [ Start/Stop ]
```

👉 nút hành động bị đẩy ra xa → tăng thời gian thao tác.

Nguyên tắc dashboard control:

> Action phải nằm gần label nó điều khiển.

---

## ❗ Missing state visibility

Bạn chỉ hiển thị:

* running
* stopped

Nhưng thực tế emulator có nhiều state:

```
booting
adb connecting
crashed
offline
timeout
busy
```

=> UX thiếu diagnostic power.

---

## ❗ Missing batch operation

User có nhiều instance nhưng:

❌ không select multiple
❌ không start all selected
❌ không filter

=> page chưa tối ưu cho automation workflow.

---

## ❗ Missing telemetry signals

Bạn show:

* resolution
* DPI

Nhưng thiếu thứ quan trọng hơn:

* CPU usage
* RAM usage
* uptime
* FPS (nếu chạy game)

---

---

# ② Redesign đề xuất (không đổi style — chỉ đổi UX logic)

---

## Layout structure chuẩn nên là:

```
HEADER
 ├ summary stats
 ├ filters
 ├ bulk actions
 └ refresh + auto refresh toggle

LIST
 ├ checkbox
 ├ instance info
 ├ runtime metrics
 ├ state badge
 └ quick actions
```

---

## Row layout tối ưu hơn

Hiện tại:

```
#1 BotInstance1 RUNNING ............... Stop
```

Nên thành:

```
☑ #1 BotInstance1
   PID 1234 | 960x540 | DPI 250 | RAM 420MB | CPU 18%
   [RUNNING]

[ Start ] [ Restart ] [ Stop ] [ Shell ] [ Logs ]
```

👉 1 row = mini control panel

---

## Màu trạng thái nên chuẩn hóa

| State   | Color  |
| ------- | ------ |
| Running | Green  |
| Stopped | Gray   |
| Booting | Blue   |
| Error   | Red    |
| Busy    | Yellow |

---

## Add hover quick actions (pro UX trick)

Hover row → hiện floating buttons:

```
Start | Stop | Restart | Open | Logs
```

→ UI sạch nhưng vẫn nhanh.

---

## Add quick filter bar

Nên có:

```
[ All ] [ Running ] [ Stopped ] [ Error ]
```

---

## Add auto refresh toggle

Dashboard realtime cần:

```
Auto refresh ⏱ 2s ON/OFF
```

---

---

# ③ Roadmap chức năng nên có cho page này

(Mình chia theo maturity level để bạn build dần)

---

## 🟢 Level 1 — must have (nên làm ngay)

* multi select checkbox
* bulk start/stop
* restart button
* confirm modal khi stop nhiều instance
* search instance name

---

## 🟡 Level 2 — power user features

* filter by state
* sort by CPU/RAM
* live metrics
* open emulator window button
* copy ADB serial

---

## 🔵 Level 3 — advanced automation control

* schedule start/stop
* auto restart if crash
* watchdog rule
* profile config per instance
* group instances

---

## 🟣 Level 4 — production orchestration panel

* health score
* anomaly detection
* resource prediction
* auto scale instances
* queue tasks to instance pool

---

---

# ⭐ UX Pattern gợi ý (rất đáng làm)

Nếu bạn chỉ làm 1 thứ để nâng cấp UX mạnh nhất:

> 👉 **Instance Grouping**

Cho phép:

```
Group A → Farm bots
Group B → Test accounts
Group C → Farming night
```

Sau đó user có thể:

```
Start group A
Stop group B
```

→ automation workflow tăng tốc cực mạnh.

---

---

# 🎯 Prompt chuẩn để AI redesign page này

(copy gửi AI luôn nếu muốn nó refactor UI đúng UX)

```
Redesign Emulator Instances page UX without changing visual theme.

Goals:
- Optimize for action-centric control panel usage
- Reduce interaction time
- Improve state visibility
- Enable batch operations

Requirements:

1. Each emulator row must include:
   checkbox
   name + id
   runtime metrics
   state badge
   quick action buttons

2. Add toolbar above list:
   search bar
   filter tabs
   bulk action buttons

3. Add states:
running
stopped
booting
error
busy

4. Add hover quick actions

5. Do not change color palette or layout style.
Only improve layout structure and usability.

Output only modified HTML structure.
```

---

---

# 🏆 Đánh giá UI hiện tại

(đánh giá thật lòng kiểu senior product review)

| Category             | Score |
| -------------------- | ----- |
| Visual design        | 8/10  |
| Layout clarity       | 7/10  |
| Control efficiency   | 4/10  |
| Power usability      | 3/10  |
| Automation readiness | 2/10  |

👉 UI đẹp nhưng chưa phải tool chuyên nghiệp.

---

---

✅ **Nếu bạn muốn mình thiết kế luôn wireframe layout chuẩn production cho page này (ready cho dev implement)**
chỉ cần nói:

> vẽ wireframe

Mình sẽ dựng layout chuẩn dashboard enterprise cho bạn luôn.
