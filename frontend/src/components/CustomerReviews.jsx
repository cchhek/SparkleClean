import { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { Star, MessageSquarePlus, CheckCircle2, Sparkles, Send, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function CustomerReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [serviceName, setServiceName] = useState('Regular House Cleaning');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

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

  // Auto-play carousel every 6 seconds if not modal open
  useEffect(() => {
    if (reviews.length <= 3 || showModal) return;
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [reviews.length, currentIndex, showModal]);

  const cardsPerPage = 3;
  const maxIndex = Math.max(0, Math.ceil(reviews.length / cardsPerPage) - 1);

  const handleNext = () => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  };

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
        setCurrentIndex(0);
      }
      setSuccessMsg('Thank you! Your feedback has been published.');
      setName('');
      setComment('');
      setRating(5);
      setShowModal(false);

      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Failed to submit review:', err);
      setErrorMsg(err.message || 'Failed to submit your feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Visible reviews for current page
  const visibleReviews = reviews.slice(
    currentIndex * cardsPerPage,
    currentIndex * cardsPerPage + cardsPerPage
  );

  return (
    <section className="py-16 bg-slate-50 border-y border-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 text-left">
            <div className="inline-flex items-center space-x-2 bg-sky-100 text-sky-700 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Verified Customer Feedback</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              What Our Clients Say
            </h2>
            <p className="text-slate-600 text-base max-w-2xl">
              Real reviews and feedback from verified customers across Australia.
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start md:self-auto">
            {/* Carousel Navigation Arrows */}
            {reviews.length > cardsPerPage && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrev}
                  className="p-2.5 bg-white border border-slate-200 hover:border-sky-300 rounded-xl text-slate-700 hover:text-sky-600 shadow-xs transition-all cursor-pointer"
                  title="Previous Reviews"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2.5 bg-white border border-slate-200 hover:border-sky-300 rounded-xl text-slate-700 hover:text-sky-600 shadow-xs transition-all cursor-pointer"
                  title="Next Reviews"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}

            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white font-bold px-5 py-2.5 sm:px-6 sm:py-3.5 rounded-2xl shadow-md shadow-sky-100 hover:shadow-sky-200 transition-all cursor-pointer text-xs sm:text-sm"
            >
              <MessageSquarePlus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Write a Review</span>
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold flex items-center space-x-3 shadow-xs">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Compact Carousel Review Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-52 bg-white rounded-3xl p-6 border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500 text-sm">
            No customer feedback published yet. Be the first to leave a review!
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {visibleReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-56 group"
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

                    <p className="text-slate-700 text-sm leading-relaxed italic line-clamp-3">
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

            {/* Pagination Indicators / Dots */}
            {maxIndex > 0 && (
              <div className="flex justify-center items-center space-x-2 pt-2">
                {[...Array(maxIndex + 1)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                      currentIndex === idx ? 'w-8 bg-sky-600' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pop-up Modal for Writing Feedback */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-left space-y-6 animate-fadeIn relative my-8">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">Leave Your Feedback</h3>
              <p className="text-xs text-slate-500">Share your experience with our cleaning team</p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Rating</label>
                <div className="flex items-center space-x-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

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

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Your Feedback</label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you enjoyed about our cleaning service..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-200 focus:border-sky-500 focus:outline-none text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
        </div>
      )}
    </section>
  );
}
