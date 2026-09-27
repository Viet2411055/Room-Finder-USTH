import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit3, Eye, MoreHorizontal, CheckCircle2, PauseCircle, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { Listing } from '../../types';

export const HostListingsPage: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const reload = () => api.hostListings().then(setListings);
  useEffect(() => { void reload(); }, []);

  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const filteredListings = useMemo(() => {
    if (activeTab === 'ACTIVE') {
      return listings.filter((l) => (l.status || 'ACTIVE') === 'ACTIVE');
    }
    if (activeTab === 'INACTIVE') {
      return listings.filter((l) => l.status === 'INACTIVE');
    }
    return listings;
  }, [listings, activeTab]);

  const handleToggleStatus = async (id: string, currentStatus: string = 'ACTIVE') => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await api.updateListingStatus(id, newStatus);
    await reload();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn lưu trữ phòng này?')) {
      await api.archiveListing(id);
      await reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary">
            Phòng cho thuê của bạn
          </h1>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Quản lý danh sách nơi lưu trú, cập nhật hình ảnh, giá cả và nội dung giới thiệu
          </p>
        </div>

        <Link
          to="/host/listings/new"
          className="px-5 py-2.5 rounded-xl bg-rausch hover:bg-rausch-hover text-white text-xs font-bold flex items-center gap-2 transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Đăng phòng mới</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border-hairline">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === 'ALL'
              ? 'border-content-primary text-content-primary'
              : 'border-transparent text-content-secondary hover:text-content-primary'
          }`}
        >
          Tất cả ({listings.length})
        </button>
        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === 'ACTIVE'
              ? 'border-content-primary text-content-primary'
              : 'border-transparent text-content-secondary hover:text-content-primary'
          }`}
        >
          Đang hoạt động ({listings.filter((l) => (l.status || 'ACTIVE') === 'ACTIVE').length})
        </button>
        <button
          onClick={() => setActiveTab('INACTIVE')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === 'INACTIVE'
              ? 'border-content-primary text-content-primary'
              : 'border-transparent text-content-secondary hover:text-content-primary'
          }`}
        >
          Tạm ngưng ({listings.filter((l) => l.status === 'INACTIVE').length})
        </button>
      </div>

      {/* Listings Table / Cards */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        {filteredListings.length === 0 ? (
          <div className="p-12 text-center text-xs text-content-secondary">
            Chưa có phòng nào trong danh mục này. Hãy nhấn "Đăng phòng mới" để bắt đầu!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-surface-subtle border-b border-border-hairline text-content-secondary font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Phòng lưu trú</th>
                  <th className="py-3 px-4">Loại phòng</th>
                  <th className="py-3 px-4">Vị trí</th>
                  <th className="py-3 px-4">Giá mỗi đêm</th>
                  <th className="py-3 px-4">Đánh giá</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-hairline">
                {filteredListings.map((listing) => {
                  const status = listing.status || 'ACTIVE';
                  return (
                    <tr key={listing.id} className="hover:bg-surface-subtle/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-subtle shrink-0">
                            <img
                              src={listing.cover_image || listing.images?.[0]}
                              alt={listing.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-bold text-content-primary line-clamp-1">
                              {listing.name}
                            </span>
                            <span className="text-[11px] text-content-secondary">
                              {listing.specs.bedrooms} PN · {listing.specs.beds} Giường · {listing.specs.guests} Khách
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-content-secondary">{listing.room_type}</td>

                      <td className="py-3.5 px-4 text-content-secondary">
                        {listing.district}, {listing.city}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-content-primary">
                        {listing.price_per_night.toLocaleString('vi-VN')} ₫
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-content-primary">
                          {listing.rating.toFixed(2)} ★ ({listing.review_count})
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(listing.id, status)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                            status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          }`}
                        >
                          {status === 'ACTIVE' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Hoạt động</span>
                            </>
                          ) : (
                            <>
                              <PauseCircle className="w-3 h-3" />
                              <span>Tạm ngưng</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/rooms/${listing.id}`}
                            className="p-1.5 rounded-lg hover:bg-surface-subtle text-content-secondary hover:text-content-primary transition"
                            title="Xem trang công khai"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <Link
                            to={`/host/listings/${listing.id}/edit`}
                            className="p-1.5 rounded-lg hover:bg-surface-subtle text-content-secondary hover:text-rausch transition"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(listing.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-content-secondary hover:text-red-600 transition"
                            title="Xóa phòng"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
