import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import { WishlistProvider } from './context/WishlistContext';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

const load = <T extends Record<string, React.ComponentType<any>>>(factory: () => Promise<T>, name: keyof T) =>
  lazy(async () => ({ default: (await factory())[name] }));
const HostLayout = load(() => import('./components/layout/HostLayout'), 'HostLayout');
const LandingPage = load(() => import('./pages/LandingPage'), 'LandingPage');
const RoomsPage = load(() => import('./pages/RoomsPage'), 'RoomsPage');
const RoomDetailPage = load(() => import('./pages/RoomDetailPage'), 'RoomDetailPage');
const BookingCheckoutPage = load(() => import('./pages/BookingCheckoutPage'), 'BookingCheckoutPage');
const BookingSuccessPage = load(() => import('./pages/BookingSuccessPage'), 'BookingSuccessPage');
const WishlistPage = load(() => import('./pages/WishlistPage'), 'WishlistPage');
const TripsPage = load(() => import('./pages/TripsPage'), 'TripsPage');
const TripDetailPage = load(() => import('./pages/TripDetailPage'), 'TripDetailPage');
const WriteReviewPage = load(() => import('./pages/WriteReviewPage'), 'WriteReviewPage');
const ProfilePage = load(() => import('./pages/ProfilePage'), 'ProfilePage');
const EditProfilePage = load(() => import('./pages/EditProfilePage'), 'EditProfilePage');
const AuthPages = load(() => import('./pages/AuthPages'), 'AuthPages');
const HostDashboardPage = load(() => import('./pages/host/HostDashboardPage'), 'HostDashboardPage');
const HostListingsPage = load(() => import('./pages/host/HostListingsPage'), 'HostListingsPage');
const CreateListingPage = load(() => import('./pages/host/CreateListingPage'), 'CreateListingPage');
const EditListingPage = load(() => import('./pages/host/EditListingPage'), 'EditListingPage');
const HostReservationsPage = load(() => import('./pages/host/HostReservationsPage'), 'HostReservationsPage');
const HostReservationDetailPage = load(() => import('./pages/host/HostReservationDetailPage'), 'HostReservationDetailPage');
const HostCalendarPage = load(() => import('./pages/host/HostCalendarPage'), 'HostCalendarPage');
const HostReviewsPage = load(() => import('./pages/host/HostReviewsPage'), 'HostReviewsPage');
const HostSettingsPage = load(() => import('./pages/host/HostSettingsPage'), 'HostSettingsPage');

// Standard App Shell Layout with Navbar and Footer
const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-surface-canvas text-content-primary">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// 404 Not Found Page (Frame 25)
const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      <h1 className="text-6xl font-black text-rausch mb-3">404</h1>
      <h2 className="text-2xl font-bold text-content-primary mb-2">Không tìm thấy trang</h2>
      <p className="text-xs text-content-secondary mb-6">
        Trang bạn đang truy cập có thể đã được gỡ bỏ hoặc tạm thời không khả dụng.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-content-primary text-white rounded-full text-xs font-bold hover:bg-black transition shadow-sm"
      >
        Quay về Trang chủ
      </Link>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <WishlistProvider>
        <SearchProvider>
          <BrowserRouter>
            <Suspense fallback={<div className="py-24 text-center text-sm text-content-secondary">Đang tải…</div>}>
            <Routes>
            {/* Traveler & Public Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/rooms/:roomId" element={<RoomDetailPage />} />
              <Route path="/booking/:roomId" element={<BookingCheckoutPage />} />
              <Route path="/booking/success/:bookingId" element={<BookingSuccessPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/trips" element={<TripsPage />} />
              <Route path="/trips/:bookingId" element={<TripDetailPage />} />
              <Route path="/trips/:bookingId/review" element={<WriteReviewPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/edit" element={<EditProfilePage />} />
              <Route path="/login" element={<AuthPages />} />
              <Route path="/register" element={<AuthPages />} />
              <Route path="/verify-email" element={<AuthPages />} />
              <Route path="/forgot-password" element={<AuthPages />} />
              <Route path="/reset-password" element={<AuthPages />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Host Portal Routes */}
            <Route path="/host" element={<HostLayout />}>
              <Route index element={<HostDashboardPage />} />
              <Route path="listings" element={<HostListingsPage />} />
              <Route path="listings/new" element={<CreateListingPage />} />
              <Route path="listings/:listingId/edit" element={<EditListingPage />} />
              <Route path="reservations" element={<HostReservationsPage />} />
              <Route path="reservations/:bookingId" element={<HostReservationDetailPage />} />
              <Route path="calendar" element={<HostCalendarPage />} />
              <Route path="reviews" element={<HostReviewsPage />} />
              <Route path="settings" element={<HostSettingsPage />} />
            </Route>
            </Routes>
            </Suspense>
          </BrowserRouter>
        </SearchProvider>
      </WishlistProvider>
    </AuthProvider>
  );
};

export default App;
