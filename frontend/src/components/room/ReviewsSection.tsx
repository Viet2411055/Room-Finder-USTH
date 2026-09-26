import React from 'react';
import { Star, MessageCircle, ShieldCheck } from 'lucide-react';
import { Review } from '../../types';

interface ReviewsSectionProps {
  reviews: Review[];
  rating: number;
  reviewCount: number;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews, rating, reviewCount }) => {
  const displayReviews = reviews || [];

  return (
    <div className="space-y-8">
      {/* 1. Overall Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-border-hairline">
        <div className="flex items-center gap-3">
          <Star className="w-8 h-8 fill-current text-amber-500" />
          <span className="text-3xl font-extrabold text-content-primary">
            {rating.toFixed(2)}
          </span>
          <span className="text-content-secondary text-lg">·</span>
          <span className="text-lg font-bold text-content-primary">
            {reviewCount} đánh giá từ du khách
          </span>
        </div>
      </div>

      {/* 3. Review list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {displayReviews.map((rev) => (
          <div key={rev.id} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-subtle shrink-0 border border-border">
                {rev.reviewer_avatar ? <img src={rev.reviewer_avatar} alt={rev.reviewer_name} className="w-full h-full object-cover" /> : <span className="w-full h-full grid place-items-center text-xs font-bold text-content-secondary">{rev.reviewer_name.slice(0, 1)}</span>}
              </div>
              <div>
                <h4 className="font-bold text-sm text-content-primary">{rev.reviewer_name}</h4>
                <div className="flex items-center gap-2 text-xs text-content-secondary">
                  <div className="flex items-center text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <span>·</span>
                  <span>{rev.date}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-content-primary leading-relaxed">
              {rev.comment}
            </p>

            {/* Host reply if present */}
            {rev.host_reply && (
              <div className="ml-4 pl-4 border-l-2 border-border-hairline py-1 text-xs text-content-secondary space-y-1">
                <span className="font-bold text-content-primary">Phản hồi từ chủ nhà:</span>
                <p className="italic">"{rev.host_reply}"</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
