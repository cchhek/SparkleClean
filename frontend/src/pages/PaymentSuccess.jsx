import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { CheckCircle2, XCircle, Loader2, Sparkles, MapPin, Calendar, CreditCard, ChevronRight } from 'lucide-react';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [booking, setBooking] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const sessionId = searchParams.get('session_id');
  const bookingId = searchParams.get('booking_id');
  const isMockSession = sessionId?.startsWith('mock_session_');

  useEffect(() => {
    if (!sessionId || !bookingId) {
      setStatus('error');
      setErrorMsg('Missing checkout session credentials.');
      return;
    }

    async function verifyPayment() {
      try {
        const response = await api.verifyCheckoutSession(sessionId, bookingId);
        if (response.success) {
          setBooking(response.booking);
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMsg(response.message || 'Payment verification failed.');
        }
      } catch (err) {
        console.error('Payment verification API error:', err);
        setStatus('error');
        setErrorMsg(err.message || 'Failed to verify payment with the server.');
      }
    }

    verifyPayment();
  }, [sessionId, bookingId]);

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-left">
      
      {/* ----------------------------------------------------
          VERIFYING STATE
          ---------------------------------------------------- */}
      {status === 'verifying' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xs">
          <Loader2 className="h-16 w-16 text-sky-500 animate-spin mx-auto" />
          <h2 className="text-2xl font-bold text-slate-900 mt-4">Verifying Your Payment</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
            Please wait while we confirm your secure payment and finalize your cleaning appointment.
          </p>
        </div>
      )}

      {/* ----------------------------------------------------
          SUCCESS STATE
          ---------------------------------------------------- */}
      {status === 'success' && booking && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-xs">
            <div className="inline-flex p-3 bg-emerald-50 rounded-full text-emerald-500">
              <CheckCircle2 className="h-14 w-14" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-slate-900">Booking Confirmed!</h2>
              <p className="text-slate-500 text-sm">Thank you! Your cleaning appointment is officially scheduled.</p>
            </div>
            
            <div className="inline-block bg-slate-100 px-5 py-2.5 rounded-xl font-mono text-slate-800 border border-slate-200">
              Booking Ref: <span className="font-bold text-slate-950 font-sans">#{booking.bookingRef}</span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
              A detailed confirmation receipt with date, time, and service checklists has been sent to <span className="font-semibold text-slate-600">{booking.customerEmail}</span>.
            </p>

            {isMockSession && (
              <div className="mt-4 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-amber-700 text-sm">
                Note: This deployment is using mock checkout mode, so payment is simulated. In production, you would be redirected to a secure payment page to complete your payment.
              </div>
            )}
          </div>

          {/* Booking Info Box */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Appointment Summary</h3>
              <button
                onClick={() => window.print()}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 border border-sky-200 hover:border-sky-300 px-3 py-1.5 rounded-lg transition-all"
              >
                Print Receipt
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex items-start space-x-3">
                <Sparkles className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">{booking.service?.name}</span>
                  <span className="text-slate-500 text-xs">{booking.propertyType.toUpperCase()} ({booking.bedrooms} Bed, {booking.bathrooms} Bath)</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-950 block">
                    {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <span className="text-slate-500 text-xs font-semibold text-sky-600">{booking.timeSlot}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Cleaning Location</span>
                  <span className="text-slate-500 text-xs">{booking.customerAddress}</span>
                </div>
              </div>

              {booking.customerName && (
                <div className="pt-3 border-t border-slate-100 flex justify-between text-xs">
                  <span className="text-slate-500">Customer Name:</span>
                  <span className="font-bold text-slate-900">{booking.customerName}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
              <div className="flex items-center space-x-1 text-slate-500">
                <CreditCard className="h-4 w-4 text-emerald-500" />
                <span>Paid via Card</span>
              </div>
              <span className="font-extrabold text-lg text-slate-900">AUD ${booking.totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              to="/"
              className="inline-flex items-center space-x-1.5 text-sky-600 hover:text-sky-700 font-bold transition-all text-sm"
            >
              <span>Return to Home</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}


      {/* ----------------------------------------------------
          ERROR STATE
          ---------------------------------------------------- */}
      {status === 'error' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xs">
          <div className="inline-flex p-3 bg-rose-50 rounded-full text-rose-500">
            <XCircle className="h-14 w-14" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 mt-4">Payment Verification Failed</h2>
            <p className="text-rose-600 font-medium text-sm">{errorMsg}</p>
          </div>
          <p className="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto">
            We couldn't confirm your transaction. If money was deducted from your account, please contact our support team immediately at <a href="mailto:support@sparkleclean.com" className="text-sky-600 hover:underline">support@sparkleclean.com</a>.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/booking"
              className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md text-sm"
            >
              Try Booking Again
            </Link>
            <Link
              to="/"
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3 rounded-xl transition-all text-sm"
            >
              Back to Home
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
