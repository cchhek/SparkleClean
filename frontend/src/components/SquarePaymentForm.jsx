import { useEffect, useRef, useState } from 'react';
import { api } from '../utils/api';
import { CreditCard, Lock, ShieldCheck, AlertCircle } from 'lucide-react';

const SQUARE_SCRIPT_URLS = {
  sandbox: 'https://sandbox.web.squarecdn.com/v1/square.js',
  production: 'https://web.squarecdn.com/v1/square.js'
};

async function loadSquareJs(environment) {
  const source = environment === 'production' ? SQUARE_SCRIPT_URLS.production : SQUARE_SCRIPT_URLS.sandbox;
  const existingScript = document.querySelector(`script[src="${source}"]`);

  if (existingScript) {
    if (window.Square) return;
    await new Promise((resolve, reject) => {
      existingScript.addEventListener('load', resolve, { once: true });
      existingScript.addEventListener('error', () => reject(new Error(`Failed to load Square JS from ${source}`)), { once: true });
    });
    return;
  }

  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = source;
    script.type = 'text/javascript';
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load Square JS from ${source}`));
    document.head.appendChild(script);
  });
}

export default function SquarePaymentForm({ bookingId, amount, onSuccess, onError }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const cardRef = useRef(null);
  const paymentsRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function initSquare() {
      try {
        const sqConfig = await api.getSquareConfig();
        if (!isMounted) return;
        setConfig(sqConfig);

        // If running in mock mode, skip SDK initialization
        if (sqConfig.isMock) {
          setLoading(false);
          return;
        }

        await loadSquareJs(sqConfig.environment);

        if (!window.Square) {
          throw new Error('Square Web Payments SDK did not load properly.');
        }

        // Ensure container element is available in DOM
        let targetEl = containerRef.current || document.getElementById('square-card-container');
        if (!targetEl) {
          await new Promise(r => setTimeout(r, 100));
          targetEl = containerRef.current || document.getElementById('square-card-container');
        }

        if (!targetEl) {
          throw new Error('Square card container element was not found.');
        }

        const payments = window.Square.payments(sqConfig.applicationId, sqConfig.locationId);
        paymentsRef.current = payments;

        const card = await payments.card();
        await card.attach(targetEl);
        cardRef.current = card;
      } catch (err) {
        console.error('Failed to load Square payment:', err);
        setErrorMessage(err.message || 'Unable to initialize Square payment. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }

    }

    initSquare();

    return () => {
      isMounted = false;
      if (cardRef.current) {
        try {
          cardRef.current.destroy();
        } catch (e) {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrorMessage('');

    try {
      let sourceId = 'mock_card_nonce_ok';

      if (!config?.isMock) {
        if (!cardRef.current) {
          throw new Error('Payment method is required. Please enter your credit card details below.');
        }

        const result = await cardRef.current.tokenize();
        if (result.status === 'OK') {
          sourceId = result.token;
        } else {
          const firstError = result.errors?.[0]?.message || 'Payment method required. Please fill in all credit card fields.';
          throw new Error(`Payment method required: ${firstError}`);
        }
      }


      const response = await api.processSquarePayment(bookingId, sourceId);
      if (response.success) {
        onSuccess(response);
      } else {
        throw new Error(response.message || 'Square payment processing failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      const msg = err.message || 'Payment failed. Please check your card details and try again.';
      setErrorMessage(msg);
      if (onError) onError(msg);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500 mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500">Initializing secure Square payment...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5 text-left">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Pay with Square</h4>
            <p className="text-xs text-slate-500">Fast, 256-bit encrypted card processing</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 text-emerald-600 text-xs font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Secure</span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-medium flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {config?.isMock && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs leading-relaxed">
          <span className="font-bold">Simulated Square Payment Mode:</span> Live Square keys are not configured in backend `.env`. Clicking "Pay with Square" will simulate a successful transaction for testing.
        </div>
      )}

      <form onSubmit={handlePayment} className="space-y-4">
        {/* Container for Square Web Payments SDK Card Element */}
        <div ref={containerRef} id="square-card-container" className="min-h-[100px] border border-slate-200 rounded-xl p-3 bg-slate-50/50">
          {config?.isMock && (
            <div className="py-4 text-center space-y-1">
              <p className="text-xs font-bold text-slate-700">Test Credit Card Container</p>
              <p className="text-[11px] text-slate-500">Ready to simulate payment for AUD ${amount.toFixed(2)}</p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={processing}
          className="w-full py-3.5 px-6 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md shadow-sky-100 hover:shadow-sky-200 transition-all cursor-pointer disabled:opacity-60 text-sm flex items-center justify-center space-x-2"
        >
          <Lock className="h-4 w-4" />
          <span>{processing ? 'Processing Square Payment...' : `Pay AUD $${amount.toFixed(2)} via Square`}</span>
        </button>
      </form>
    </div>
  );
}
