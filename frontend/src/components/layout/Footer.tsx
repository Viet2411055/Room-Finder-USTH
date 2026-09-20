import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Heart, X, ShieldCheck, FileText, HelpCircle, PhoneCall, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | 'help' | null>(null);

  return (
    <>
      <footer className="w-full bg-surface-subtle border-t border-border-hairline mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Main Footer Links - 3 Columns (Removed Host Column) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8 text-sm">
            {/* Column 1: Hỗ trợ & Trợ giúp */}
            <div>
              <h4 className="font-bold text-content-primary mb-3.5 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-rausch" />
                Hỗ trợ & Trợ giúp
              </h4>
              <ul className="space-y-2.5 text-content-secondary">
                <li>
                  <button
                    type="button"
                    onClick={() => setLegalModal('help')}
                    className="hover:underline hover:text-content-primary transition text-left"
                  >
                    Trung tâm trợ giúp & Câu hỏi thường gặp
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setLegalModal('help')}
                    className="hover:underline hover:text-content-primary transition text-left"
                  >
                    Chính sách hủy phòng & Hoàn tiền
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setLegalModal('help')}
                    className="hover:underline hover:text-content-primary transition text-left"
                  >
                    Tiêu chuẩn an toàn & Hỗ trợ khẩn cấp 24/7
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setLegalModal('help')}
                    className="hover:underline hover:text-content-primary transition text-left"
                  >
                    Bảo vệ khách hàng RoomCover
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Điểm đến tại Việt Nam */}
            <div>
              <h4 className="font-bold text-content-primary mb-3.5">Điểm đến tại Việt Nam</h4>
              <ul className="space-y-2.5 text-content-secondary">
                <li><Link to="/rooms?dest=Hà Nội" className="hover:underline hover:text-content-primary transition">Homestay & Căn hộ tại Hà Nội</Link></li>
                <li><Link to="/rooms?dest=Đà Nẵng" className="hover:underline hover:text-content-primary transition">Biệt thự biển tại Đà Nẵng</Link></li>
                <li><Link to="/rooms?dest=Hồ Chí Minh" className="hover:underline hover:text-content-primary transition">Studio & Loft tại TP. Hồ Chí Minh</Link></li>
                <li><Link to="/rooms" className="hover:underline hover:text-content-primary transition">Khám phá tất cả 470+ phòng lưu trú</Link></li>
              </ul>
            </div>

            {/* Column 3: Về RoomFinder (Removed Careers & Investors) */}
            <div>
              <h4 className="font-bold text-content-primary mb-3.5">Về RoomFinder</h4>
              <ul className="space-y-2.5 text-content-secondary">
                <li>
                  <button
                    type="button"
                    onClick={() => setLegalModal('terms')}
                    className="hover:underline hover:text-content-primary transition text-left"
                  >
                    Giới thiệu nền tảng RoomFinder
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setLegalModal('terms')}
                    className="hover:underline hover:text-content-primary transition text-left"
                  >
                    Tiêu chuẩn chất lượng phòng & Đánh giá thật
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setLegalModal('privacy')}
                    className="hover:underline hover:text-content-primary transition text-left"
                  >
                    Cam kết minh bạch giá cả & Không phí ẩn
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setLegalModal('help')}
                    className="hover:underline hover:text-content-primary transition text-left"
                  >
                    Nền tảng tìm và đặt nơi lưu trú tại Việt Nam
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright, Privacy, Terms, Language & Currency */}
          <div className="pt-6 border-t border-border-hairline flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-content-secondary">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1.5">
              <span>© 2026 RoomFinder, Inc.</span>
              <span>·</span>
              <button
                type="button"
                onClick={() => setLegalModal('privacy')}
                className="hover:underline hover:text-content-primary transition cursor-pointer"
              >
                Quyền riêng tư
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setLegalModal('terms')}
                className="hover:underline hover:text-content-primary transition cursor-pointer"
              >
                Điều khoản dịch vụ
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setLegalModal('help')}
                className="hover:underline hover:text-content-primary transition cursor-pointer"
              >
                Sơ đồ trang web
              </button>
              <span>·</span>
              <span className="flex items-center gap-1 text-content-primary font-medium">
                Made with <Heart className="w-3.5 h-3.5 text-rausch fill-rausch" /> for university graduation project
              </span>
            </div>

            <div className="flex items-center gap-4 font-semibold text-content-primary shrink-0">
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-content-secondary" />
                <span>Tiếng Việt (VN)</span>
              </span>
              <span>₫ VND</span>
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          LEGAL & HELP MODAL DIALOG
          ========================================================================= */}
      {legalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-hairline shrink-0 bg-surface-subtle/50">
              <div className="flex items-center gap-2">
                {legalModal === 'privacy' && <ShieldCheck className="w-5 h-5 text-emerald-600" />}
                {legalModal === 'terms' && <FileText className="w-5 h-5 text-blue-600" />}
                {legalModal === 'help' && <HelpCircle className="w-5 h-5 text-rausch" />}
                <h3 className="text-base font-bold text-content-primary">
                  {legalModal === 'privacy' && 'Chính sách Quyền riêng tư & Bảo mật dữ liệu'}
                  {legalModal === 'terms' && 'Điều khoản sử dụng & Quy chế dịch vụ RoomFinder'}
                  {legalModal === 'help' && 'Trung tâm Hỗ trợ & Chính sách Đặt phòng'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-subtle text-content-secondary hover:text-content-primary transition"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-content-secondary leading-relaxed">
              {legalModal === 'privacy' && (
                <>
                  <div>
                    <h4 className="font-bold text-content-primary mb-1 text-sm sm:text-base">1. Cam kết bảo mật thông tin cá nhân</h4>
                    <p>
                      RoomFinder cam kết bảo vệ dữ liệu riêng tư của du khách và chủ phòng. Mọi thông tin tài khoản, số điện thoại, email và lịch sử đặt phòng đều được mã hóa theo tiêu chuẩn an toàn hiện đại.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-content-primary mb-1 text-sm sm:text-base">2. Thu thập và sử dụng dữ liệu</h4>
                    <p>
                      Dữ liệu cá nhân chỉ được sử dụng cho mục đích: xử lý thanh toán đặt phòng, kết nối giữa du khách và chủ phòng (Host), xác thực bảo mật tài khoản và nâng cao trải nghiệm gợi ý nơi lưu trú phù hợp.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-content-primary mb-1 text-sm sm:text-base">3. Quyền hạn của người dùng</h4>
                    <p>
                      Bạn có toàn quyền yêu cầu xem, chỉnh sửa hoặc xóa thông tin tài khoản của mình bất kỳ lúc nào tại mục Cài đặt tài khoản hoặc liên hệ ban hỗ trợ kỹ thuật RoomFinder.
                    </p>
                  </div>
                </>
              )}

              {legalModal === 'terms' && (
                <>
                  <div>
                    <h4 className="font-bold text-content-primary mb-1 text-sm sm:text-base">1. Quy chế đặt phòng và nhận phòng</h4>
                    <p>
                      Khi hoàn tất thủ tục đặt phòng trên RoomFinder, bạn đồng ý tuân thủ nội quy riêng của từng căn hộ/homestay được công bố bởi chủ phòng (Host), bao gồm giờ Check-in (thường sau 14:00) và Check-out (thường trước 12:00).
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-content-primary mb-1 text-sm sm:text-base">2. Minh bạch giá cả</h4>
                    <p>
                      Mọi mức giá phòng hiển thị trên RoomFinder là giá phòng thực tế theo từng đêm, đã bao gồm chi phí dịch vụ cơ bản và không có chi phí ẩn phát sinh ngoài thỏa thuận.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-content-primary mb-1 text-sm sm:text-base">3. Trách nhiệm của các bên</h4>
                    <p>
                      Chủ phòng chịu trách nhiệm về tính xác thực của hình ảnh, tiện nghi và vị trí phòng. Du khách có trách nhiệm giữ gìn cơ sở vật chất và tuân thủ các quy định trật tự an ninh tại địa phương lưu trú.
                    </p>
                  </div>
                </>
              )}

              {legalModal === 'help' && (
                <>
                  <div className="bg-surface-subtle p-3.5 rounded-xl border border-border-hairline space-y-2">
                    <div className="flex items-center gap-2 font-bold text-content-primary text-xs sm:text-sm">
                      <PhoneCall className="w-4 h-4 text-emerald-600" />
                      Tổng đài hỗ trợ khẩn cấp (Hotline 24/7): 1900 8888 (Miễn phí)
                    </div>
                    <p className="text-xs text-content-secondary">
                      Email hỗ trợ khách hàng: support@roomfinder.vn · Phản hồi trong vòng 15 phút.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-content-primary mb-1 text-sm sm:text-base">Chính sách hủy phòng & Hoàn tiền</h4>
                    <ul className="space-y-1.5 list-disc pl-4 text-xs sm:text-sm">
                      <li>Hủy miễn phí trong vòng 48 giờ sau khi đặt phòng nếu còn ít nhất 14 ngày trước ngày nhận phòng.</li>
                      <li>Hủy trước 7 ngày nhận phòng: Hoàn lại 50% tổng số tiền đã thanh toán (trừ phí dịch vụ).</li>
                      <li>Trường hợp khẩn cấp bất khả kháng: RoomCover bảo vệ 100% chi phí cho du khách.</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-content-primary mb-1 text-sm sm:text-base">Quy trình xử lý khiếu nại</h4>
                    <p>
                      Nếu phòng nhận thực tế khác biệt đáng kể so với ảnh chụp hoặc mô tả, du khách vui lòng thông báo cho RoomFinder trong vòng 24 giờ sau khi nhận phòng để được đổi phòng tương đương hoặc hoàn tiền 100%.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-border-hairline shrink-0 bg-surface-subtle flex justify-end">
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="px-5 py-2 bg-content-primary text-white rounded-xl text-xs font-bold hover:bg-black transition shadow-sm"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
