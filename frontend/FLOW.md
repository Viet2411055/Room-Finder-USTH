# RoomFinder — User Flow

> Airbnb-like room booking web application for a university project.
> This document defines product flows before wireframing or implementation.

## 1. Roles

RoomFinder has three logical roles:

- **Guest** — visitor who is not authenticated.
- **User / Traveler** — authenticated user who searches, saves and books rooms.
- **Host** — authenticated user with hosting capabilities. A user may be both Traveler and Host.
- **Admin** — optional system administrator. Keep this out of the MVP unless required by the course.

---

## 2. Global Navigation

### Guest

```text
Landing
├─ Search
├─ Explore city/category
├─ Open room
├─ Login
└─ Register
```

### Authenticated Traveler

```text
Global Header
├─ Search
├─ Wishlist
├─ Trips
├─ Profile
├─ Switch to hosting
└─ Logout
```

### Host

```text
Host Navigation
├─ Dashboard
├─ Listings
├─ Reservations
├─ Calendar
├─ Reviews
├─ Host settings
├─ Switch to traveling
└─ Logout
```

---

## 3. Main Discovery Flow

```text
[Landing]
    |
    | choose destination / dates / guests
    v
[Search Results / City]
    |
    +--> change search criteria ------+
    |                                 |
    +--> apply filters ---------------+
    |
    | select a room
    v
[Room Detail]
    |
    +--> view gallery
    +--> view amenities
    +--> view reviews
    +--> view location
    +--> view host
    +--> save to wishlist
    |
    | reserve
    v
[Booking Flow]
```

Search does **not** require authentication.

---

## 4. Landing Flow

```text
[Landing]
 |
 +--> Search bar
 |     ├─ Destination
 |     ├─ Check-in / Check-out
 |     └─ Guests
 |
 +--> Popular city section
 |     └─ Room card --> Room Detail
 |
 +--> Destination/category
 |     └─ City Results
 |
 +--> Room card
       └─ Room Detail
```

### Landing states

- Default
- Destination picker open
- Date picker open
- Guest picker open
- Search validation error
- Loading/skeleton
- Empty recommendation section

---

## 5. Search / City Results Flow

```text
[Search Results]
 |
 +--> Edit destination/dates/guests
 |
 +--> Filter
 |     ├─ Price range
 |     ├─ Property/room type
 |     ├─ Bedrooms / beds
 |     ├─ Amenities
 |     └─ Rating
 |
 +--> Sort
 |
 +--> Map marker <--> Listing card
 |
 +--> Pagination / load more
 |
 └--> Room card --> [Room Detail]
```

### Results states

- Results found
- No results
- Loading
- Filter panel/modal open
- Map/list interaction
- Search error

---

## 6. Room Detail Flow

```text
[Room Detail]
 |
 +--> Gallery
 +--> Description
 +--> Amenities
 +--> Availability calendar
 +--> Reviews
 +--> Location
 +--> Host profile
 +--> Similar rooms
 |
 +--> Wishlist
 |     ├─ authenticated --> saved/removed
 |     └─ guest --> Login --> return to Room Detail
 |
 └--> Reserve
       |
       ├─ dates/guests missing --> select required data
       |
       ├─ guest --> Login/Register
       |            |
       |            └--> return to same room + booking context
       |
       └─ authenticated --> [Booking Checkout]
```

The selected room, dates and guest count must survive authentication.

---

## 7. Authentication Flow

### Register

```text
[Register]
 |
 +--> enter name/email/password
 |
 +--> validation
 |     ├─ invalid --> show field errors
 |     └─ valid
 |
 v
[Account Created]
 |
 +--> normal entry --> Landing
 |
 └--> interrupted booking --> resume Booking Checkout
```

### Login

```text
[Login]
 |
 +--> Email/password
 +--> Google login (optional)
 |
 +--> invalid credentials --> error
 |
 └--> success
       ├─ normal entry --> previous/default page
       └─ interrupted action --> resume that action
```

### Forgot password

```text
[Login]
  |
  v
[Forgot Password]
  |
  v
[Email Sent]
  |
  v
[Reset Password]
  |
  v
[Reset Success]
  |
  v
[Login]
```

---

## 8. Booking Flow

```text
[Room Detail]
      |
      | Reserve
      v
[Booking Checkout]
      |
      +--> Review room
      +--> Review dates
      +--> Review guests
      +--> Price breakdown
      +--> Cancellation policy
      +--> Payment method (mock/demo is sufficient for MVP)
      |
      | Confirm booking
      v
[Processing]
      |
      +--> failure --> Booking Error --> retry
      |
      └--> success
              v
       [Booking Success]
              |
              +--> View Trip
              └--> Back Home
```

### Booking rules

- A room cannot be booked for unavailable dates.
- Check-out must be after check-in.
- Guest count cannot exceed room capacity.
- Price is recalculated when dates/guests change.
- Booking creation must prevent duplicate submissions.
- MVP may use mock payment; never store raw card data.

---

## 9. Traveler Account Flow

```text
[User Menu]
 |
 +--> Profile
 +--> Wishlist
 +--> Trips
 +--> Reviews
 └--> Switch to hosting
```

### Wishlist

```text
[Wishlist]
 |
 +--> saved room --> Room Detail
 └--> remove room --> update list
```

### Trips

```text
[My Trips]
 |
 +--> Upcoming
 +--> Completed
 +--> Cancelled
 |
 └--> Trip
       v
   [Trip Detail]
       |
       +--> room information
       +--> booking information
       +--> host information
       +--> cancellation (when allowed)
       |
       └--> completed stay --> Write Review
```

### Review

```text
[Completed Trip]
      |
      v
[Write Review]
      |
      +--> rating
      +--> comment
      |
      v
[Review Submitted]
      |
      └--> Trip Detail / My Reviews
```

Only a user with a completed booking can review that booking/property in the MVP.

---

## 10. Profile Flow

```text
[Profile]
 |
 +--> View profile
 +--> Edit personal information
 +--> Change password
 +--> Traveler history
 └--> Become/Switch to Host
```

---

# HOST FLOWS

## 11. Enter Host Mode

```text
[Traveler UI]
     |
     | Switch to hosting
     v
[Host Dashboard]
```

If the account has never hosted:

```text
[Switch to hosting]
      |
      v
[Host onboarding]
      |
      v
[Create first listing]
```

A separate Host account is not required. One account can own listings and also book other listings.

---

## 12. Host Dashboard Flow

```text
[Host Dashboard]
 |
 +--> Summary
 |     ├─ Active listings
 |     ├─ Upcoming reservations
 |     ├─ Revenue summary
 |     └─ Rating summary
 |
 +--> Upcoming reservations --> Reservation Detail
 |
 +--> Listings --> Listing Management
 |
 +--> Calendar --> Availability
 |
 └--> Reviews --> Host Reviews
```

---

## 13. Create Listing Flow

```text
[Host Dashboard / Listings]
          |
          | Add listing
          v
[1. Basic Information]
          |
          v
[2. Location]
          |
          v
[3. Amenities]
          |
          v
[4. Photos]
          |
          v
[5. Pricing]
          |
          v
[6. Availability / House Rules]
          |
          v
[7. Preview]
          |
          +--> Save Draft
          |
          └--> Publish
                 |
                 v
          [Listing Published]
                 |
                 +--> View public room
                 └--> Manage listing
```

### Listing lifecycle

```text
DRAFT
  |
  | publish
  v
ACTIVE
  |
  +--> edit --> ACTIVE
  |
  +--> deactivate --> INACTIVE
  |                   |
  |                   └--> reactivate --> ACTIVE
  |
  └--> delete/archive
```

Do not allow destructive deletion when it would invalidate active/upcoming reservations; archive/deactivate instead.

---

## 14. Host Listing Management

```text
[Listings]
 |
 +--> Active
 +--> Draft
 +--> Inactive
 |
 └--> Select listing
       |
       +--> View public page
       +--> Edit
       +--> Pricing
       +--> Availability
       +--> Activate / Deactivate
       └--> Archive/Delete where allowed
```

Edit sections:

```text
[Edit Listing]
├─ Basic information
├─ Description
├─ Photos
├─ Amenities
├─ Location
├─ Pricing
├─ Availability
└─ House rules
```

---

## 15. Host Reservation Flow

```text
[Reservations]
 |
 +--> Upcoming
 +--> Completed
 +--> Cancelled
 |
 └--> Reservation
        v
   [Reservation Detail]
        |
        +--> Guest
        +--> Property
        +--> Dates
        +--> Price
        +--> Status
        └--> Contact/message action (optional)
```

For the MVP, bookings can be **instant-booked** after successful checkout. This avoids adding a host approval state unless the assignment specifically requires request-to-book.

Recommended status model:

```text
CONFIRMED
   |
   +--> guest/host cancellation --> CANCELLED
   |
   └--> stay ends --> COMPLETED
```

---

## 16. Host Calendar Flow

```text
[Calendar]
 |
 +--> choose listing
 |
 +--> month navigation
 |
 +--> booked dates (read-only booking state)
 |
 +--> select available dates
       |
       +--> Available / Blocked
       +--> nightly price override (optional)
       |
       └--> Save
```

The public room availability must reflect bookings and host-blocked dates.

---

## 17. Host Reviews Flow

```text
[Host Reviews]
 |
 +--> rating summary
 +--> filter reviews
 |
 └--> Review
       |
       └--> Reply (optional)
```

Hosts cannot edit or delete traveler reviews.

---

## 18. Host Settings Flow

```text
[Host Settings]
 |
 +--> Public host profile
 +--> Contact information
 +--> Account settings
 └--> Switch to traveling
```

---

# OPTIONAL ADMIN FLOW

Admin is **not the same role as Host**. Implement only if required.

```text
[Admin Login]
     |
     v
[Admin Dashboard]
 |
 +--> Users
 |     ├─ View
 |     └─ Enable/Disable
 |
 +--> Listings
 |     ├─ View
 |     └─ Moderate/Disable
 |
 +--> Bookings
 |     └─ View
 |
 +--> Reviews/Reports
 |     └─ Moderate
 |
 └--> System overview
```

---

## 19. Critical End-to-End Flows

### Flow A — Search and book

```text
Landing
  --> Search Results
  --> Room Detail
  --> Login (if required)
  --> Booking Checkout
  --> Booking Success
  --> Trip Detail
```

### Flow B — Completed stay and review

```text
My Trips
  --> Completed Trip
  --> Write Review
  --> Review Submitted
  --> Room Detail displays review
```

### Flow C — Host publishes a room

```text
Switch to Hosting
  --> Host Dashboard
  --> Listings
  --> Create Listing
  --> Preview
  --> Publish
  --> Public Room Detail
  --> Search Results
```

### Flow D — Booking reaches Host

```text
Traveler books room
  --> Booking CONFIRMED
  --> Host Dashboard updates
  --> Host Reservations
  --> Reservation Detail
  --> Host Calendar dates become unavailable
```

### Flow E — Cancellation

```text
Trip Detail
  --> Cancel Booking
  --> Confirm Cancellation
  --> Booking CANCELLED
  --> My Trips / Cancelled
  --> Host Reservations / Cancelled
  --> dates become available again
```

---

## 20. Route Map

```text
PUBLIC
/
 /rooms
 /rooms/:roomId
 /hosts/:hostId

AUTH
/login
/register
/forgot-password
/reset-password

TRAVELER
/wishlist
/trips
/trips/:bookingId
/trips/:bookingId/review
/profile
/profile/edit

BOOKING
/booking/:roomId
/booking/success/:bookingId

HOST
/host
/host/listings
/host/listings/new
/host/listings/:listingId
/host/listings/:listingId/edit
/host/reservations
/host/reservations/:bookingId
/host/calendar
/host/reviews
/host/settings

OPTIONAL ADMIN
/admin
/admin/users
/admin/listings
/admin/bookings
/admin/reports
```

---

## 21. Required Shared UI States

These are not separate routes but must be covered by the wireframes/design system:

- Loading / skeleton
- Empty state
- Error state
- Form validation
- Confirmation modal
- Delete/archive confirmation
- Login-required modal/redirect
- Toast/success feedback
- 404 Not Found
- Unauthorized / Forbidden
- Mobile navigation state
- Search/date/guest popovers
- Filter modal
- Photo gallery modal
- Amenities modal

---

## 22. MVP Boundary

### Must have

```text
Discovery
Search
Filter
Room Detail
Authentication
Wishlist
Booking
Trips
Reviews

Host Dashboard
Listing CRUD
Listing photos
Pricing
Availability
Reservations
Host reviews
Profile
```

### Nice to have

```text
Interactive map
Google/OAuth login
Messaging
Dynamic nightly pricing
Host replies to reviews
Notifications
Multiple wishlists
Payment gateway
Admin moderation
```

### Out of scope unless specifically required

```text
Real money transfer/payout
Identity verification
Tax handling
Complex refund engine
Airbnb-style experiences/services
Recommendation ML
Real-time chat
Multi-currency settlement
```

---

## 23. Core Domain Relationship

```text
USER
 ├──< WISHLIST >── ROOM
 ├──< BOOKING  >── ROOM
 ├──< REVIEW   >── ROOM
 │
 └── can become HOST
          |
          └── owns >── ROOM
                         |
                         ├──< BOOKING
                         ├──< REVIEW
                         └──< AVAILABILITY
```

This relationship should remain consistent across the database, API, UI and wireframes.

---

## 24. Recommended Wireframing Order

```text
1. Global Header / Search components
2. Landing
3. Search Results
4. Room Detail
5. Login / Register
6. Booking Checkout + Success
7. Trips + Trip Detail
8. Wishlist / Profile
9. Host shell + Dashboard
10. Host Listings
11. Create/Edit Listing
12. Reservations
13. Calendar
14. Reviews / Settings
15. Empty / loading / error / responsive states
```

The wireframes should be derived from this flow rather than designing screens independently.
