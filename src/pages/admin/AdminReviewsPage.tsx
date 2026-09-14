import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Trash2, MessageSquare } from 'lucide-react';
import { Review } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error } = useToast();

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const data = await api.adminGetReviews();
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.adminUpdateReviewStatus(id, newStatus);
      success(`Review status changed to ${newStatus}`);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus as any } : r))
      );
    } catch (err: any) {
      error(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this customer review?')) return;
    try {
      await api.adminDeleteReview(id);
      success('Review deleted');
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      error(err.message || 'Failed to delete review');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white">Client Review Moderation</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Audit testimonials, approve client ratings, and manage catalog credibility.
          </p>
        </div>
      </div>

      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-neutral-400">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">No client reviews submitted.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-neutral-400 uppercase tracking-wider text-[10px] bg-neutral-900/60 border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Commentary</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{r.userName}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${s <= r.rating ? 'fill-amber-400' : 'text-neutral-700'}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-300 max-w-sm">
                      <p className="line-clamp-2 leading-relaxed">{r.comment}</p>
                    </td>
                    <td className="py-3 px-4 text-neutral-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : r.status === 'rejected'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {r.status !== 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'approved')}
                            className="p-1.5 text-emerald-400 hover:text-emerald-300"
                            title="Approve Review"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {r.status !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'rejected')}
                            className="p-1.5 text-amber-400 hover:text-amber-300"
                            title="Reject Review"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1.5 text-neutral-500 hover:text-rose-400"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
