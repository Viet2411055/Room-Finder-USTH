import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateProfile } = useAuth();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ name, phone });
    setIsSaved(true);
    setTimeout(() => {
      navigate('/profile');
    }, 400);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <button
        onClick={() => navigate('/profile')}
        className="flex items-center gap-2 text-xs font-bold text-content-secondary hover:text-content-primary transition mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Quay lại hồ sơ cá nhân</span>
      </button>

      <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-airbnb-card">
        <h1 className="text-2xl font-extrabold text-content-primary mb-1">Chỉnh sửa thông tin hồ sơ</h1>
        <p className="text-xs text-content-secondary mb-6">Cập nhật thông tin liên hệ và họ tên hiển thị</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1">Họ và tên</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-content-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1">Địa chỉ email</label>
            <input
              type="email"
              value={currentUser?.email || ''}
              className="w-full border border-border rounded-xl p-3 text-sm bg-surface-subtle text-content-secondary"
              disabled
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1">Số điện thoại</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-content-primary"
              required
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-rausch hover:bg-rausch-hover text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>{isSaved ? 'Đã lưu thay đổi!' : 'Lưu thay đổi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
