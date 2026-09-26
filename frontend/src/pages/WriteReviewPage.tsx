import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, Send } from 'lucide-react';
import { api, ApiError } from '../services/api';
import type { Booking } from '../types';

export const WriteReviewPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  useEffect(() => { if (bookingId) api.trip(bookingId).then(setBooking).catch(() => setBooking(null)); }, [bookingId]);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center">
        <h2 className="text-xl font-bold mb-4">Không tìm thấy thông tin chuyến đi để đánh giá</h2>
        <button
          onClick={() => navigate('/trips')}
          className="text-sm font-semibold text-rausch underline"
        >
          Quay lại danh sách chuyến đi
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMessage('Vui lòng nhập nhận xét của bạn về trải nghiệm kỳ nghỉ');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.createReview(booking.id, rating, comment.trim());
      setIsSubmitting(false);
      navigate(`/trips/${booking.id}`);
    } catch (value) {
      setIsSubmitting(false);
      setErrorMessage(value instanceof ApiError ? value.message : 'Không thể gửi đánh giá');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold text-content-secondary hover:text-content-primary transition mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Quay lại chi tiết chuyến đi</span>
      </button>

      <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-airbnb-card">
        {/* Room Header */}
        <div className="flex gap-4 pb-6 border-b border-border-hairline mb-6">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-subtle shrink-0">
            <img
              src={booking.cover_image}
              alt={booking.listing_name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-[11px] font-bold text-content-secondary uppercase">
              Đánh giá kỳ nghỉ
            </span>
            <h1 className="text-lg font-bold text-content-primary line-clamp-1 mt-0.5">
              {booking.listing_name}
            </h1>
            <p className="text-xs text-content-secondary mt-0.5">
              Lưu trú từ {booking.check_in} đến {booking.check_out} ({booking.nights} đêm)
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating Picker */}
          <div>
            <label className="block text-sm font-bold text-content-primary mb-2">
              Bạn đánh giá chất lượng phòng thế nào?
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-content-primary hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-border fill-transparent'
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-bold text-content-primary ml-2">
                {rating === 5 ? 'Tuyệt vời (5/5)' : `${rating}/5 sao`}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-bold text-content-primary mb-2">
              Chia sẻ cảm nhận chi tiết của bạn
            </label>
            <textarea
              rows={5}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setErrorMessage('');
              }}
              placeholder="Căn phòng có sạch sẽ không? Tiện nghi thế nào? Vị trí có thuận tiện cho chuyến đi của bạn không? Bạn có gợi ý gì cho chủ nhà không?"
              className="w-full border border-border rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-content-primary leading-relaxed"
              required
            />
            {errorMessage && (
              <p className="text-xs text-red-600 font-semibold mt-1.5">{errorMessage}</p>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 rounded-full bg-rausch hover:bg-rausch-hover text-white font-bold text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang gửi đánh giá...' : 'Đăng đánh giá'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
