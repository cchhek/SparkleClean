import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Star, MessageSquarePlus, CheckCircle2, User, Sparkles, Send } from 'lucide-react';

export default function CustomerReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [serviceName, setServiceName] = useState('Regular House Cleaning');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      setLoading(true);
      const data = await api.getReviews();
      setReviews(data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      setErrorMsg('Please enter your name and review comment.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await api.submitReview({ name, serviceName, rating, comment });
      
      if (res.review) {
        setReviews(prev => [res.review, ...prev]);
      }
      setSuccessMsg('Thank you! Your feedback has been published.');
      setName('');
      setComment('');
      setRating(5);
      setShowForm(false);
      
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Failed to submit review:', err);
      setErrorMsg(err.message || 'Failed to submit your feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-slate-50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 text-left">
            <div className="inline-flex items-center space-x-2 bg-sky-100 text-sky-700 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Customer Feedback</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              What Our Clients Say
            </h2>
            <p className="text-slate-600 text-base max-w-2xl">
              Real reviews and feedback from verified customers across Australia.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-md shadow-sky-100 hover:shadow-sky-200 transition-all cursor-pointer text-sm shrink-0 self-start md:self-auto"
          >
            <MessageSquarePlus className="h-5 w-5" />
            <span>{showForm ? 'Close Review Form' : 'Write a Review'}</span>
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold flex items-center space-x-3 shadow-xs">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Write Feedback Form Modal / Drawer */}
        {showForm && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-lg text-left space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Leave Your Feedback</h3>
                <p className="text-xs text-slate-500">Share your experience with our cleaning services</p>
              </div>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-200 focus:border-sky-500 focus:outline-none text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Cleaning Service</label>
                  <select
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-200 focus:border-sky-500 focus:outline-none text-sm bg-white"
                  >
                    <option value="Regular House Cleaning">Regular House Cleaning</option>
                    <option value="Deep Cleaning">Deep Cleaning</option>
                    <option value="Office Cleaning">Office Cleaning</option>
                    <option value="Move-In / Move-Out Cleaning">Move-In / Move-Out Cleaning</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Your Review & Experience</label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you liked about our service..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-200 focus:border-sky-500 focus:outline-none text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-100 hover:shadow-sky-200 transition-all cursor-pointer flex items-center space-x-2 disabled:opacity-60"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{submitting ? 'Publishing...' : 'Publish Review'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-white rounded-3xl p-6 border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <p className="text-slate-700 text-sm leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                      {rev.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">{rev.name}</span>
                      <span className="text-[11px] text-slate-500">{rev.serviceName}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Verified</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
