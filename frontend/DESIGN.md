---
name: Belong Anywhere
colors:
  surface: '#fbf9f9'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e3e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#5c3f41'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#906f70'
  outline-variant: '#e5bdbe'
  surface-tint: '#be0038'
  primary: '#ba0036'
  on-primary: '#ffffff'
  primary-container: '#e21e4a'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb2b6'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#006a45'
  on-tertiary: '#ffffff'
  tertiary-container: '#008558'
  on-tertiary-container: '#f6fff6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdada'
  primary-fixed-dim: '#ffb2b6'
  on-primary-fixed: '#40000d'
  on-primary-fixed-variant: '#920029'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#80f9bd'
  tertiary-fixed-dim: '#62dca3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005234'
  background: '#fbf9f9'
  on-background: '#1b1c1c'
  surface-variant: '#e3e2e2'
  rausch-hover: '#E00B41'
  rausch-active: '#D70466'
  surface-canvas: '#FFFFFF'
  surface-subtle: '#F7F7F7'
  border-hairline: '#EBEBEB'
  border-default: '#DDDDDD'
  border-strong: '#222222'
  border-subtle: '#F0F0F0'
  text-primary: '#222222'
  text-secondary: '#717171'
  text-tertiary: '#B0B0B0'
  backdrop-overlay: rgba(0, 0, 0, 0.6)
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 19px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2.5rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

# Design System Specification: Airbnb (DLS - Design Language System)

## 1. Brand & Design Philosophy
- **Identity**: Belong Anywhere — Human, accessible, lightweight, typography-driven, and photography-first.
- **Visual Personality**: Iconic Airbnb DLS characteristics:
  - Extreme cleanliness: pure white surfaces (`#FFFFFF`), subtle hairline borders (`#DDDDDD` / `#EBEBEB`), zero heavy drop shadows.
  - Distinctive Airbnb typography: Circular / Plus Jakarta Sans with crisp tracking, bold titles, and readable secondary text.
  - Iconic Rausch pink/red branding (`#FF385C`) strictly reserved for active states, search submit button, primary actions, and brand marks.
  - Pill geometry (`rounded-full`) for high-interaction tactile controls (search bar, filter tags, buttons, badges).

---

## 2. Color Palette & Semantics

### Primary & Accent Colors
- **Brand Primary (Rausch)**: `#FF385C`
- **Brand Primary Gradient (Signature Airbnb CTA)**: `radial-gradient(circle at center, #FF385C 0%, #E61E4D 27.5%, #E31C5F 40%, #D70466 57.5%, #BD1E59 75%, #BD1E59 100%)`
- **Primary Hover**: `#E00B41`
- **Active / Pressed**: `#D70466`

### Neutral & Surface Hierarchy
- **Surface Canvas (Base)**: `#FFFFFF`
- **Surface Subtle / Section Background**: `#F7F7F7`
- **Surface Modal / Elevated Container**: `#FFFFFF`
- **Modal Backdrop**: `rgba(0, 0, 0, 0.6)`
- **Border Default (Hairline)**: `#DDDDDD` / `#EBEBEB` (1px solid crisp separation)
- **Border Strong / Interactive Focus**: `#222222`
- **Border Subtle (Dividers)**: `#F0F0F0`

### Typography Colors
- **Text Primary (Titles, Prices, Active items)**: `#222222` (Airbnb standard high-contrast charcoal black)
- **Text Secondary (Subtitles, Amenities, Location details)**: `#717171` (Signature neutral gray)
- **Text Tertiary / Placeholder**: `#B0B0B0`
- **Text Link / Underline**: `#222222` with `text-decoration: underline; font-weight: 600`

### Semantic & Map Badges
- **Guest Favorite Badge ("Được khách yêu thích")**:
  - Background: `#FFFFFF` with hairline border `rgba(0,0,0,0.08)` or soft laurel wreath icon pill
  - Text: `#222222`, weight: 600
- **Map Price Marker (Unselected)**:
  - Background: `#FFFFFF`, text: `#222222`, border: `1px solid rgba(0,0,0,0.08)`, shadow: `0 2px 4px rgba(0,0,0,0.18)`
  - Shape: `rounded-full`, font-size: `14px`, weight: `700`, padding: `6px 10px`
- **Map Price Marker (Selected / Active)**:
  - Background: `#222222`, text: `#FFFFFF`, shadow: `0 4px 12px rgba(0,0,0,0.24)`

---

## 3. Typography Scale & Hierarchy

- **Font Family**: Circular Std, Plus Jakarta Sans, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Letter Spacing**: `-0.02em` for large headers; standard `normal` for body.

### Scale:
- **Hero / Page Title (Listing Title)**: `26px` (Desktop: `26px - 32px`) | Line-height: `30px` | Weight: `600`
- **Section Heading (H2)**: `22px` | Line-height: `26px` | Weight: `600`
- **Card Title / Neighborhood**: `15px` | Line-height: `19px` | Weight: `600`
- **Card Subtitle & Distance**: `15px` | Line-height: `19px` | Weight: `400` | Color: `#717171`
- **Price Display**: `15px - 16px` | Weight: `600` for amount, `400` for "cho 2 đêm" / "đêm"
- **Filter Chip & Tab Labels**: `14px` | Line-height: `18px` | Weight: `500` / `600`
- **Small Badges & Microcopy**: `12px` | Line-height: `16px` | Weight: `600`

---

## 4. Shadows & Elevation (The Airbnb Soft Depth Standard)

Airbnb uses very soft, multi-layered diffuse shadows without harsh outlines:
- **Search Capsule (Floating Default)**: `0 1px 2px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05)`
- **Search Capsule (Hover / Expanded)**: `0 2px 4px rgba(0, 0, 0, 0.12), 0 6px 20px rgba(0, 0, 0, 0.09)`
- **Modal Dialog Box**: `0 8px 28px rgba(0, 0, 0, 0.28)`
- **Sticky Booking Widget**: `0 6px 16px rgba(0, 0, 0, 0.12)`
- **Floating Pill Buttons ("Hiển thị bản đồ", "Hiển thị tất cả ảnh")**: `0 2px 8px rgba(0, 0, 0, 0.15)`

---

## 5. Border Radii & Layout Dimensions

### Radii:
- **Full Pill (`9999px` / `rounded-full`)**:
  - Global Big Search Bar & compact sticky search pill
  - Category filter icons & chips ("Bộ lọc", "Wi-fi", "Bể bơi")
  - Map price markers & "Hiển thị bản đồ" button
  - User profile / navigation menu trigger pill
  - Next/Prev photo slider circles
- **Large Container (`rounded-2xl` / `16px`)**:
  - Auth modal dialog box
  - Listing card media containers
  - 5-photo bento grid outer corners
  - Booking sticky card widget
- **Inputs & Nested Boxes (`rounded-xl` / `8px - 12px`)**:
  - Datepicker combined bounding box
  - Auth modal phone/email input border

---

## 6. Signature Airbnb UI Components & Exact Interactions

### 1. Global Navigation Bar & Dual-State Search
- **Brand Emblem**: Airbnb Bélo icon in `#FF385C` with wordmark on left.
- **Top Center Navigation Tabs**: "Nơi lưu trú", "Trải nghiệm", "Dịch vụ" with active bottom border indicator or bold weight.
- **The Iconic Segmented Search Pill**:
  - In expanded state: Divided into 3 interactive pills:
    1. "Địa điểm" (`Tất cả` / `Tìm kiếm điểm đến`)
    2. "Thời gian" (`Thêm ngày` / `cuối tuần bất kỳ`)
    3. "Khách" (`Thêm khách`)
  - Vertical 1px hairlines separating each segment.
  - High-contrast circular action button (`bg-[#FF385C] rounded-full p-3.5 text-white`) with search glass icon.
- **Right Header Utility**: "Cho thuê chỗ ở qua Airbnb", Globe language selector (`p-2.5 rounded-full hover:bg-neutral-100`), and User Menu capsule pill (hamburger icon + circle avatar, `border border-neutral-300 rounded-full px-3 py-1.5`).

### 2. Category Carousel Bar
- Horizontal scrolling track of SVG icons with concise captions ("Biệt thự", "Hướng biển", "Hồ bơi tuyệt vời", "Cabin").
- Active tab has high-contrast `#222222` icon + text and bold bottom stroke (`border-b-2 border-black pb-2.5`).
- Right-anchored "Bộ lọc" (Filters) pill button with sliders icon.

### 3. Property Grid Card (`1:1` or `4:3` Media Ratio)
- Rounded photo gallery (`rounded-xl` / `rounded-2xl`) with heart wishlist button (`top-3 right-3 text-white fill-black/40 hover:scale-110`).
- Left badge: "Được khách yêu thích" pill (`bg-white/95 text-neutral-900 font-semibold text-xs px-2.5 py-1 rounded-full shadow-sm`).
- Carousel pagination dots overlaid at bottom center.
- Card details stack:
  - Row 1: Location/Title (Bold `#222222`) + Star rating (`★ 4.9 (20)`) aligned right.
  - Row 2: Host details or distance description (`text-neutral-500 text-sm`).
  - Row 3: Available date range (`text-neutral-500 text-sm`).
  - Row 4: Total price (`font-semibold text-neutral-900 936.000 ₫` + regular `text-neutral-600 cho 2 đêm`).

### 4. Split Search & Interactive Map Layout
- 50/50 or 60/40 desktop split view:
  - Left pane: Filter bar + listings count (`Hơn 1.000 nhà ở tại Đà Nẵng`) + 2-column listing card grid with smooth scrolling.
  - Right pane: Full viewport height map with custom vector styling, Google Maps attribution, and floating white price capsules (`806.000 ₫`, `936.000 ₫`).

### 5. Listing Detail Bento Photo Grid
- Classic 5-photo mosaic layout:
  - 1 large hero photo taking 50% width on left (rounded left corners `rounded-l-2xl`).
  - 4 smaller photos arranged in a 2x2 grid on right (top-right and bottom-right rounded `rounded-tr-2xl`, `rounded-br-2xl`).
  - Bottom-right corner overlay button: "Hiển thị tất cả ảnh" with 9-dot grid icon (`bg-white text-neutral-900 border border-black font-semibold text-sm rounded-lg px-4 py-2`).

### 6. Auth Modal ("Đăng nhập hoặc đăng ký")
- Clean popup card (`rounded-2xl shadow-2xl max-w-lg mx-auto bg-white overflow-hidden`).
- Header with dismiss `×` button on left/right and centered Bélo emblem.
- Title: "Chào mừng bạn đến với Airbnb" / "Đăng nhập hoặc đăng ký".
- Input group: Tel/email field with floating label styling and focused `border-black ring-1 ring-black`.
- Primary Button: Signature `#FF385C` solid fill with "Tiếp tục" in white bold font.
- Social Auth: Pill-bordered Google and Apple buttons with authentic brand icons.
