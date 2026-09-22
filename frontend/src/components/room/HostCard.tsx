import React from 'react';
import { Award, Clock, MessageSquare } from 'lucide-react';
import { Host } from '../../types';

interface HostCardProps {
  host: Host;
}

export const HostCard: React.FC<HostCardProps> = ({ host }) => {
  return (
    <div className="bg-surface-subtle border border-border rounded-2xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-hairline">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
            {host.avatar_url ? <img src={host.avatar_url} alt={host.name} className="w-full h-full object-cover" /> : <span className="w-full h-full grid place-items-center bg-rausch/10 text-rausch font-bold">{host.name.slice(0, 1)}</span>}
            {host.is_superhost && (
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-rausch rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm">
                <Award className="w-3 h-3" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-content-primary">
              Chủ nhà: {host.name}
            </h3>
            <p className="text-xs text-content-secondary">
              Đã tham gia {host.joined_date} {host.is_superhost && '· Chủ nhà siêu cấp'}
            </p>
          </div>
        </div>

        {host.is_superhost && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-border rounded-xl text-xs font-semibold text-content-primary self-start sm:self-auto shadow-sm">
            <Award className="w-4 h-4 text-rausch" />
            <span>Superhost kinh nghiệm</span>
          </div>
        )}
      </div>

      {/* Host Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-border-hairline text-sm">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-sky-600 shrink-0" />
          <div>
            <div className="font-semibold text-content-primary">Tỉ lệ phản hồi: {host.response_rate || '—'}</div>
            <div className="text-xs text-content-secondary">{host.response_time ? `Phản hồi ${host.response_time}` : 'Chưa có dữ liệu thời gian phản hồi'}</div>
          </div>
        </div>
        <div className="flex items-center gap-3"><MessageSquare className="w-5 h-5 text-amber-600 shrink-0" /><div><div className="font-semibold text-content-primary">Liên hệ chủ nhà</div><div className="text-xs text-content-secondary">Trao đổi qua thông tin trong booking</div></div></div>
      </div>

      {/* Host Bio */}
      <div className="pt-5 space-y-4">
        {host.about && <p className="text-sm text-content-secondary leading-relaxed">{host.about}</p>}
        <div className="text-xs text-content-tertiary">
          Lưu ý an toàn: Nhằm bảo vệ thanh toán và quyền lợi của bạn, chỉ chuyển khoản qua hệ thống RoomFinder.
        </div>
      </div>
    </div>
  );
};
