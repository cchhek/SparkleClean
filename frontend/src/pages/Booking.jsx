import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api } from '../utils/api';
import SquarePaymentForm from '../components/SquarePaymentForm';
import { Sparkles, ArrowRight, ArrowLeft, Home, Building, CheckCircle, CreditCard, Clock, Calendar, HelpCircle, ShieldCheck } from 'lucide-react';


const FALLBACK_SERVICES = [
  { id: 'regular-house-cleaning', name: 'Regular House Cleaning', price: 120.0 },
  { id: 'deep-cleaning', name: 'Deep Cleaning', price: 200.0 },
  { id: 'office-cleaning', name: 'Office Cleaning', price: 250.0 },
  { id: 'move-in-out-cleaning', name: 'Move-In / Move-Out Cleaning', price: 300.0 }
];

const FALLBACK_ADDONS = [
  { id: 'oven-cleaning', name: 'Oven Cleaning', price: 50.0, description: 'Deep cleaning inside the oven' },
  { id: 'fridge-cleaning', name: 'Fridge Cleaning', price: 40.0, description: 'Thorough cleaning inside the fridge' },
  { id: 'window-cleaning', name: 'Window Cleaning', price: 60.0, description: 'Interior window washing' }
];

const TIME_SLOTS = [
  '08:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '12:00 PM - 02:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM'
];

const HOBART_TIMEZONE = 'Australia/Hobart';

const getHobartDateString = () => {
  return new Date().toLocaleDateString('en-CA', { timeZone: HOBART_TIMEZONE });
};

const getHobartMinutes = () => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: HOBART_TIMEZONE,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  }).formatToParts(new Date());

  const hour = parseInt(parts.find(part => part.type === 'hour')?.value || '0', 10);
  const minute = parseInt(parts.find(part => part.type === 'minute')?.value || '0', 10);

  return hour * 60 + minute;
};

const parseSlotStartMinutes = (slot) => {
  const match = slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;

  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();

  if (meridiem === 'PM' && hour !== 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;

  return hour * 60 + minute;
};

export default function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [addons, setAddons] = useState([]);
  const [unavailableSlots, setUnavailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [dateNotice, setDateNotice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('square'); // 'square' or 'stripe'
  const [createdBooking, setCreatedBooking] = useState(null);


  // Initialize selected service from redirect state if available
  const initialServiceId = location.state?.selectedServiceId || '';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid }
  } = useForm({
    mode: 'all',
    defaultValues: {
      serviceId: initialServiceId,
      propertyType: 'house',
      bedrooms: 1,
      bathrooms: 1,
      date: '',
      timeSlot: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerAddress: '',
      addonIds: []
    }
  });

  const selectedServiceId = watch('serviceId');
  const propertyType = watch('propertyType');
  const bedrooms = watch('bedrooms');
  const bathrooms = watch('bathrooms');
  const selectedAddonIds = watch('addonIds') || [];
  const selectedDate = watch('date');
  const selectedTimeSlot = watch('timeSlot');

  const isSlotPast = (slot) => {
    if (!selectedDate) return false;
    const hobartToday = getHobartDateString();
    if (selectedDate !== hobartToday) return false;
    return getHobartMinutes() > parseSlotStartMinutes(slot);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [servicesData, addonsData] = await Promise.all([
          api.getServices().catch(() => FALLBACK_SERVICES),
          api.getAddons().catch(() => FALLBACK_ADDONS)
        ]);
        setServices(servicesData.length ? servicesData : FALLBACK_SERVICES);
        setAddons(addonsData.length ? addonsData : FALLBACK_ADDONS);

        // Set default service if not set
        if (!selectedServiceId && servicesData.length) {
          setValue('serviceId', servicesData[0].id);
        }
      } catch (err) {
        console.error('Failed to load services/addons:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [setValue, selectedServiceId]);

  // Load unavailable slots when date changes
  useEffect(() => {
    if (selectedDate) {
      api.getUnavailableSlots(selectedDate)
        .then(slots => setUnavailableSlots(slots))
        .catch(err => console.error('Failed to get unavailable slots:', err));
    }
  }, [selectedDate]);

  useEffect(() => {
    if (!selectedDate) {
      setDateNotice('');
      return;
    }

    const hobartToday = getHobartDateString();
    if (selectedDate < hobartToday) {
      setValue('date', '');
      setValue('timeSlot', '');
      setDateNotice('This date is now in the past for Hobart. Please choose another date.');
      return;
    }

    if (selectedDate === hobartToday) {
      const availableSlots = TIME_SLOTS.filter(slot => !isSlotPast(slot) && !unavailableSlots.some(s => s.date === selectedDate && s.timeSlot === slot));
      if (availableSlots.length === 0) {
        setValue('date', '');
        setValue('timeSlot', '');
        setDateNotice('No Hobart time slots remain today. Please select another date.');
        return;
      }
    }

    setDateNotice('');
  }, [selectedDate, setValue, unavailableSlots]);

  // Helper to check if a slot is booked
  const isSlotBooked = (slot) => {
    return unavailableSlots.some(
      s => s.date === selectedDate && s.timeSlot === slot
    );
  };

  // Pricing Calculation Helper
  const calculateTotal = () => {
    const service = services.find(s => s.id === selectedServiceId);
    if (!service) return 0;

    let total = service.price;

    // Bed/Bath cost
    if (bedrooms > 1) total += (bedrooms - 1) * 15;
    if (bathrooms > 1) total += (bathrooms - 1) * 25;

    // Property configuration extra
    if (propertyType === 'house') total += 20;

    // Addons
    selectedAddonIds.forEach(id => {
      const addon = addons.find(a => a.id === id);
      if (addon) total += addon.price;
    });

    return total;
  };

  const currentService = services.find(s => s.id === selectedServiceId);

  const nextStep = async () => {
    setApiError(null);

    // Validation for Step 1 (Service Selection)
    if (step === 1 && !selectedServiceId) {
      setApiError('Please select a cleaning service before proceeding.');
      return;
    }

    // Validation for Step 3 (Date and Time Selection)
    if (step === 3) {
      if (!selectedDate) {
        setApiError('Please select a preferred cleaning date before proceeding.');
        return;
      }
      if (!selectedTimeSlot) {
        setApiError('Please select an available time slot before proceeding.');
        return;
      }
    }

    // Validation for Step 4 (Customer Information)
    if (step === 4) {
      const isStepValid = await trigger(['customerName', 'customerEmail', 'customerPhone', 'customerAddress']);
      if (!isStepValid) {
        setApiError('Please fill in all required customer information accurately before proceeding.');
        return;
      }
    }

    setStep(prev => Math.min(prev + 1, 6));
  };
  const prevStep = () => {
    setApiError(null);
    setStep(prev => Math.max(prev - 1, 1));
  };


  const onSubmit = async (data) => {
    setSubmitting(true);
    setApiError(null);

    try {
      // 1. Create booking on backend
      let booking = createdBooking;
      if (!booking) {
        booking = await api.createBooking(data);
        setCreatedBooking(booking);
      }

      if (paymentMethod === 'square') {
        // Redirect to Square Online Checkout hosted payment page
        const session = await api.createSquareCheckoutSession(booking.id);
        window.location.href = session.url;
      } else if (paymentMethod === 'stripe') {
        // Redirect to Stripe Checkout session
        const session = await api.createCheckoutSession(booking.id);
        window.location.href = session.url;
      }
    } catch (err) {
      console.error('Booking submission failed:', err);
      setApiError(err.message || 'Something went wrong during submission. Please try again.');
      setSubmitting(false);
    }
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Title */}
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-0">Book a Clean</h1>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Complete the steps below to customize your service, choose a date, and finalize payment securely.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Booking Form steps */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          
          {/* Step Indicator */}
          <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-5">
            <span className="text-xs font-bold text-sky-500 uppercase tracking-widest">Step {step} of 6</span>
            <div className="flex space-x-1.5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div
                  key={i}
                  className={`h-2 w-6 rounded-full transition-all duration-300 ${
                    i <= step ? 'bg-sky-500' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {apiError && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-700 text-sm font-medium rounded-xl border border-rose-100 text-left">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* ==========================================
                STEP 1: Select Cleaning Service
                ========================================== */}
            {step === 1 && (
              <div className="space-y-4 text-left">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Select Cleaning Service</h3>
                <div className="grid grid-cols-1 gap-4">
                  {services.map(service => (
                    <label
                      key={service.id}
                      className={`flex items-start p-5 border rounded-2xl cursor-pointer hover:border-sky-300 transition-all ${
                        selectedServiceId === service.id ? 'border-sky-500 bg-sky-50/55 shadow-xs' : 'border-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        value={service.id}
                        {...register('serviceId', { required: true })}
                        className="mt-1 h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300"
                      />
                      <div className="ml-4 flex-grow">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900">{service.name}</span>
                          <span className="font-extrabold text-sky-600">Starting ${service.price.toFixed(2)}</span>
                        </div>
                        <p className="text-slate-500 text-xs mt-1 leading-relaxed">{service.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ==========================================
                STEP 2: Property Information
                ========================================== */}
            {step === 2 && (
              <div className="space-y-6 text-left">
                <h3 className="text-xl font-bold text-slate-900">Property Information</h3>

                {/* Property Type */}
                <div className="space-y-3">
                  <span className="block text-sm font-semibold text-slate-700">Property Type</span>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setValue('propertyType', 'house')}
                      className={`flex items-center justify-center space-x-3 p-4 border rounded-2xl cursor-pointer hover:bg-slate-50 transition-all font-semibold ${
                        propertyType === 'house' ? 'border-sky-500 bg-sky-50/70 text-sky-700' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <Home className="h-5 w-5" />
                      <span>House</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('propertyType', 'apartment')}
                      className={`flex items-center justify-center space-x-3 p-4 border rounded-2xl cursor-pointer hover:bg-slate-50 transition-all font-semibold ${
                        propertyType === 'apartment' ? 'border-sky-500 bg-sky-50/70 text-sky-700' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <Building className="h-5 w-5" />
                      <span>Apartment</span>
                    </button>
                  </div>
                </div>

                {/* Bed / Bath count */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="bedrooms" className="block text-sm font-semibold text-slate-700">Number of Bedrooms</label>
                    <select
                      id="bedrooms"
                      {...register('bedrooms', { required: true, valueAsNumber: true })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-200 focus:border-sky-500 focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6].map(n => (
                        <option key={n} value={n}>{n} Bedroom{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="bathrooms" className="block text-sm font-semibold text-slate-700">Number of Bathrooms</label>
                    <select
                      id="bathrooms"
                      {...register('bathrooms', { required: true, valueAsNumber: true })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-200 focus:border-sky-500 focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5].map(n => (
                        <option key={n} value={n}>{n} Bathroom{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ==========================================
                STEP 3: Select Date and Time
                ========================================== */}
            {step === 3 && (
              <div className="space-y-6 text-left">
                <h3 className="text-xl font-bold text-slate-900">Select Date and Time</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Date Input */}
                  <div className="space-y-2">
                    <label htmlFor="date" className="block text-sm font-semibold text-slate-700">Preferred Date</label>
                    <input
                      id="date"
                      type="date"
                      min={getHobartDateString()} // Block past dates in Hobart
                      {...register('date', { required: 'Please select a date' })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-200 focus:border-sky-500 focus:outline-none"
                    />
                    {errors.date && <p className="text-rose-500 text-xs mt-1">{errors.date.message}</p>}
                    {dateNotice && <p className="text-rose-500 text-xs mt-1">{dateNotice}</p>}
                  </div>

                  {/* Time slot picker */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Available Time Slot</label>
                    <div className="space-y-2">
                      {TIME_SLOTS.map(slot => {
                        const booked = selectedDate ? isSlotBooked(slot) : false;
                        const past = selectedDate ? isSlotPast(slot) : false;
                        const unavailable = booked || past;

                        return (
                          <label
                            key={slot}
                            className={`flex items-center p-3.5 border rounded-xl cursor-pointer hover:bg-slate-50 transition-all ${
                              selectedTimeSlot === slot
                                ? 'border-sky-500 bg-sky-50/70 shadow-xs font-bold'
                                : unavailable
                                ? 'border-slate-100 bg-slate-50/80 opacity-55 cursor-not-allowed'
                                : 'border-slate-200'
                            }`}
                          >
                            <input
                              type="radio"
                              value={slot}
                              disabled={unavailable}
                              {...register('timeSlot', { required: 'Please select a time slot' })}
                              className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300"
                            />
                            <span className={`ml-3 text-sm ${unavailable ? 'line-through text-slate-400 font-medium' : 'text-slate-800 font-semibold'}`}>
                              {slot} {booked && '(Unavailable)'}{!booked && past && '(Past time)'}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {errors.timeSlot && <p className="text-rose-500 text-xs mt-1">{errors.timeSlot.message}</p>}
                  </div>


                </div>
              </div>
            )}

            {/* ==========================================
                STEP 4: Customer Details
                ========================================== */}
            {step === 4 && (
              <div className="space-y-4 text-left">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Customer Information</h3>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="customerName" className="block text-sm font-semibold text-slate-700">Full Name</label>
                    <input
                      id="customerName"
                      type="text"
                      placeholder="John Doe"
                      {...register('customerName', { required: 'Full name is required' })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-200 focus:border-sky-500 focus:outline-none"
                    />
                    {errors.customerName && <p className="text-rose-500 text-xs">{errors.customerName.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="customerEmail" className="block text-sm font-semibold text-slate-700">Email Address</label>
                      <input
                        id="customerEmail"
                        type="email"
                        placeholder="john@example.com"
                        {...register('customerEmail', {
                          required: 'Email address is required',
                          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' }
                        })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-200 focus:border-sky-500 focus:outline-none"
                      />
                      {errors.customerEmail && <p className="text-rose-500 text-xs">{errors.customerEmail.message}</p>}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="customerPhone" className="block text-sm font-semibold text-slate-700">Phone Number</label>
                      <input
                        id="customerPhone"
                        type="tel"
                        placeholder="+61 400 000 000"
                        {...register('customerPhone', { required: 'Phone number is required' })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-200 focus:border-sky-500 focus:outline-none"
                      />
                      {errors.customerPhone && <p className="text-rose-500 text-xs">{errors.customerPhone.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="customerAddress" className="block text-sm font-semibold text-slate-700">Cleaning Address</label>
                    <input
                      id="customerAddress"
                      type="text"
                      placeholder="123 Sparkle Way, Sydney NSW 2000"
                      {...register('customerAddress', { required: 'Cleaning address is required' })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-200 focus:border-sky-500 focus:outline-none"
                    />
                    {errors.customerAddress && <p className="text-rose-500 text-xs">{errors.customerAddress.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* ==========================================
                STEP 5: Additional Services (Addons)
                ========================================== */}
            {step === 5 && (
              <div className="space-y-4 text-left">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Select Additional Services</h3>
                <p className="text-slate-500 text-xs">Boost your clean with optional service add-ons below.</p>

                <div className="space-y-3">
                  {addons.map(addon => (
                    <label
                      key={addon.id}
                      className={`flex items-start p-4 border rounded-2xl cursor-pointer hover:border-sky-300 transition-all ${
                        selectedAddonIds.includes(addon.id) ? 'border-sky-500 bg-sky-50/45 shadow-xs' : 'border-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={addon.id}
                        {...register('addonIds')}
                        className="mt-1 h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded"
                      />
                      <div className="ml-4 flex-grow">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900">{addon.name}</span>
                          <span className="font-bold text-slate-700">+${addon.price.toFixed(2)}</span>
                        </div>
                        {addon.description && <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{addon.description}</p>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ==========================================
                STEP 6: Booking Summary & Payment
                ========================================== */}
            {step === 6 && (
              <div className="space-y-6 text-left">
                <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">Booking Summary & Payment</h3>

                <div className="space-y-4 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Cleaning Service:</span>
                    <span className="font-bold text-slate-900">{currentService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Property details:</span>
                    <span className="font-semibold text-slate-900">{propertyType.toUpperCase()} ({bedrooms} Bed, {bathrooms} Bath)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Preferred Date & Slot:</span>
                    <span className="font-bold text-sky-600">{selectedDate} at {selectedTimeSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Address:</span>
                    <span className="font-semibold text-slate-900">{watch('customerAddress')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer name:</span>
                    <span className="font-semibold text-slate-900">{watch('customerName')}</span>
                  </div>

                  {selectedAddonIds.length > 0 && (
                    <div className="pt-3 border-t border-slate-100">
                      <span className="font-semibold text-slate-700 block mb-1.5">Addons Selected:</span>
                      <ul className="list-disc pl-5 space-y-1 text-slate-500 text-xs">
                        {selectedAddonIds.map(id => {
                          const addon = addons.find(a => a.id === id);
                          return addon ? <li key={id}>{addon.name} (+${addon.price.toFixed(2)})</li> : null;
                        })}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Payment Gateway Display (Exclusive Square Payment) */}
                <div className="rounded-3xl border border-sky-200 bg-sky-50/70 p-5 space-y-2 text-left shadow-xs">
                  <div className="flex items-center space-x-2.5 text-slate-900 font-bold text-base">
                    <CreditCard className="h-5 w-5 text-sky-600" />
                    <span>Square Online Checkout</span>
                    <span className="ml-auto text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center space-x-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Official Square</span>
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Upon clicking submit, you will be securely redirected to Square's official hosted checkout page to complete your card payment with 256-bit SSL encryption.
                  </p>
                </div>
              </div>
            )}

            {/* ==========================================
                Navigation Controls
                ========================================== */}
            <div className="flex justify-between pt-8 border-t border-slate-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setCreatedBooking(null);
                    prevStep();
                  }}
                  className="flex items-center space-x-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-6 py-3 rounded-xl transition-all cursor-pointer text-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {step < 6 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center space-x-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-sky-100 hover:shadow-sky-200 cursor-pointer text-sm"
                >
                  <span>Next Step</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-md shadow-sky-100 hover:shadow-sky-200 cursor-pointer disabled:opacity-60 text-sm"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>{submitting ? 'Redirecting to Square Checkout...' : 'Proceed to Square Online Checkout'}</span>
                </button>
              )}
            </div>



          </form>
        </div>

        {/* Price display side-panel */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 text-left border border-slate-800 shadow-md">
          <div className="flex items-center space-x-2 text-sky-400 font-semibold text-sm">
            <Sparkles className="h-5 w-5" />
            <span>Booking Calculator</span>
          </div>

          <div className="space-y-4 text-slate-300 text-sm">
            {currentService && (
              <div className="flex justify-between">
                <span>Base ({currentService.name})</span>
                <span className="font-semibold text-white">${currentService.price.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span>Property Type ({propertyType})</span>
              <span className="font-semibold text-white">${propertyType === 'house' ? '20.00' : '0.00'}</span>
            </div>

            {bedrooms > 1 && (
              <div className="flex justify-between">
                <span>Bedrooms ({bedrooms})</span>
                <span className="font-semibold text-white">+${((bedrooms - 1) * 15).toFixed(2)}</span>
              </div>
            )}

            {bathrooms > 1 && (
              <div className="flex justify-between">
                <span>Bathrooms ({bathrooms})</span>
                <span className="font-semibold text-white">+${((bathrooms - 1) * 25).toFixed(2)}</span>
              </div>
            )}

            {selectedAddonIds.length > 0 && (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-slate-400 block text-xs">Addons Included:</span>
                {selectedAddonIds.map(id => {
                  const addon = addons.find(a => a.id === id);
                  return addon ? (
                    <div key={id} className="flex justify-between text-xs">
                      <span>{addon.name}</span>
                      <span>+${addon.price.toFixed(2)}</span>
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 pt-6 flex justify-between items-end">
            <div>
              <span className="text-slate-400 block text-xs uppercase tracking-wider">Total Price</span>
              <span className="text-2xl font-bold text-sky-400">AUD ${calculateTotal().toFixed(2)}</span>
            </div>
            <span className="text-slate-500 text-xs">Inc GST</span>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-800 text-slate-400 text-xs leading-relaxed flex items-start space-x-2">
            <HelpCircle className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
            <span>Need help or want to speak with us? Call +61 2 9876 5432 to book via telephone.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
