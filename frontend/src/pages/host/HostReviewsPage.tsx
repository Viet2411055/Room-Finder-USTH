import React, { useEffect, useState, useMemo } from 'react';
import { Star, MessageSquare, Reply, Check } from 'lucide-react';
import { api } from '../../services/api';
import { Review } from '../../types';

export const HostReviewsPage: React.FC = () => {
  const [allReviewsWithListing, setAllReviewsWithListing] = useState<{ review: Review; listingName: string; listingId: string }[]>([]);
  const loadReviews = () => api.hostReviews().then(rows => setAllReviewsWithListing(rows.map((row: any) => ({ review: row, listingName: row.listing.name, listingId: row.listing.id }))));
  useEffect(() => { void loadReviews(); }, []);

  const [starFilter, setStarFilter] = useState<number | 'ALL'>('ALL');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [successReplyId, setSuccessReplyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (starFilter === 'ALL') return allReviewsWithListing;
    return allReviewsWithListing.filter((item) => item.review.rating === starFilter);
  }, [allReviewsWithListing, starFilter]);

  const handleSendReply = async (_listingId: string, reviewId: string) => {
    const text = replyTextMap[reviewId];
    if (!text || !text.trim()) return;

    await api.replyReview(reviewId, text.trim());
    await loadReviews();
    setActiveReplyId(null);
    setSuccessReplyId(reviewId);
    setTimeout(() => setSuccessReplyId(null), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary">
          Đánh giá từ khách hàng ({allReviewsWithListing.length})
        </h1>
        <p className="text-xs sm:text-sm text-content-secondary mt-1">
          Lắng nghe phản hồi từ du khách và gửi lời cảm ơn hoặc giải đáp thắc mắc
        </p>
      </div>

      {/* Star filter chips */}
      <div className="flex gap-2 border-b border-border-hairline pb-4">
        {['ALL', 5, 4, 3].map((val) => (
          <button
            key={String(val)}
            onClick={() => setStarFilter(val as any)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${
              starFilter === val
                ? 'bg-content-primary text-white border-content-primary'
                : 'border-border bg-white text-content-secondary hover:border-content-primary hover:text-content-primary'
            }`}
          >
            {val === 'ALL' ? 'Tất cả đánh giá' : `${val} sao ★`}
          </button>
        ))}
      </div>

      {/* Review cards */}
      <div className="space-y-4">
        {filtered.map(({ review, listingName, listingId }) => (
          <div
            key={review.id}
            className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border-hairline">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden border border-border shrink-0">
                  {review.reviewer_avatar ? <img src={review.reviewer_avatar} alt={review.reviewer_name} className="w-full h-full object-cover" /> : <span className="w-full h-full grid place-items-center text-xs font-bold text-content-secondary">{review.reviewer_name.slice(0, 1)}</span>}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-content-primary">{review.reviewer_name}</h4>
                  <div className="flex items-center gap-2 text-xs text-content-secondary">
                    <div className="flex text-amber-500">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                    <span>·</span>
                    <span>{review.date}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs font-semibold text-content-secondary bg-surface-subtle px-3 py-1 rounded-full truncate max-w-xs">
                {listingName}
              </div>
            </div>

            <p className="text-sm text-content-primary leading-relaxed">{review.comment}</p>

            {/* Host Reply */}
            {review.host_reply ? (
              <div className="p-3 bg-surface-subtle rounded-xl text-xs text-content-secondary space-y-1">
                <span className="font-bold text-content-primary">Phản hồi của bạn:</span>
                <p className="italic">"{review.host_reply}"</p>
              </div>
            ) : activeReplyId === review.id ? (
              <div className="space-y-3 pt-2">
                <textarea
                  rows={3}
                  placeholder="Nhập câu trả lời chân thành của bạn gửi đến khách hàng..."
                  value={replyTextMap[review.id] || ''}
                  onChange={(e) =>
                    setReplyTextMap({ ...replyTextMap, [review.id]: e.target.value })
                  }
                  className="w-full border border-border rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-content-primary"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveReplyId(null)}
                    className="px-3.5 py-1.5 border border-border rounded-lg text-xs font-semibold hover:bg-surface-subtle"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendReply(listingId, review.id)}
                    className="px-4 py-1.5 bg-rausch hover:bg-rausch-hover text-white rounded-lg text-xs font-bold transition shadow-sm"
                  >
                    Gửi phản hồi
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setActiveReplyId(review.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-rausch hover:underline"
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span>Trả lời đánh giá</span>
                </button>
              </div>
            )}

            {successReplyId === review.id && (
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Đã đăng phản hồi thành công!</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
