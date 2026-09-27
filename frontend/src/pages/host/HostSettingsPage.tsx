import React, { useEffect, useState } from 'react';
import { Save, ShieldCheck, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Host } from '../../types';

export const HostSettingsPage: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const [hostProfile, setHostProfile] = useState<Host | null>(null);

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [about, setAbout] = useState('');
  const [responseTime, setResponseTime] = useState('trong vòng 1 giờ');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    api.hostProfile().then(host => { setHostProfile(host); setName(host.name); setPhone(host.phone ?? ''); setAbout(host.about); setResponseTime(host.response_time); });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await Promise.all([updateProfile({ name, phone }), api.updateHost({ name, phone, about, responseTime })]);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary">
          Cài đặt tài khoản Chủ nhà
        </h1>
        <p className="text-xs sm:text-sm text-content-secondary mt-1">
          Quản lý thông tin hiển thị công khai trên hồ sơ host và thông tin liên lạc
        </p>
      </div>

      <div className="bg-white border border-border rounded-3xl p-6 sm:p-8 shadow-airbnb-card space-y-6">
        {/* Avatar & Superhost Badge */}
        <div className="flex items-center gap-4 pb-6 border-b border-border-hairline">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-border shadow-sm">
            {currentUser?.avatar_url ? <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" /> : <span className="w-full h-full grid place-items-center bg-rausch/10 text-rausch font-bold">{name.slice(0, 1)}</span>}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-content-primary">{name}</h3>
              {hostProfile?.is_superhost && <span className="flex items-center gap-1 text-[11px] font-bold text-rausch bg-rausch/10 px-2 py-0.5 rounded-full">
                <Award className="w-3 h-3" />
                Chủ nhà siêu cấp
              </span>}
            </div>
            <p className="text-xs text-content-secondary mt-0.5">
              Tỉ lệ phản hồi {hostProfile?.response_rate || '—'}
            </p>
          </div>
        </div>

        {isSaved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Đã lưu thành công cài đặt hồ sơ Chủ nhà!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-content-primary mb-1">
              Tên hiển thị của Host
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-content-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-content-primary mb-1">
              Số điện thoại liên hệ khẩn cấp
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-content-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-content-primary mb-1">
              Thời gian phản hồi thông thường
            </label>
            <select
              value={responseTime}
              onChange={(e) => setResponseTime(e.target.value)}
              className="w-full border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-content-primary"
            >
              <option value="trong vòng vài phút">Trong vòng vài phút</option>
              <option value="trong vòng 1 giờ">Trong vòng 1 giờ</option>
              <option value="trong vòng vài giờ">Trong vòng vài giờ</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-content-primary mb-1">
              Giới thiệu bản thân (Bio)
            </label>
            <textarea
              rows={4}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="w-full border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-content-primary leading-relaxed"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-rausch hover:bg-rausch-hover text-white text-xs font-bold flex items-center gap-2 transition shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
