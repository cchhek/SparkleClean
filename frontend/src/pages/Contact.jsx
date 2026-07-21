import { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../utils/api';
import { getContentValue, DEFAULT_PAGE_CONTENT } from '../utils/pageContent';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [pageContent, setPageContent] = useState(DEFAULT_PAGE_CONTENT);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  useEffect(() => {
    async function fetchContent() {
      try {
        const data = await api.getPageContent('contact');
        setPageContent({ ...DEFAULT_PAGE_CONTENT, ...data });
      } catch (err) {
        console.warn('Failed to load contact page content:', err);
        setPageContent(DEFAULT_PAGE_CONTENT);
      }
    }

    fetchContent();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate contact form submission
    setTimeout(() => {
      setSubmitted(true);
      setSubmitting(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mt-0">{getContentValue(pageContent, 'contact.header.title')}</h1>
        <p className="text-lg text-slate-500 leading-relaxed">
          {getContentValue(pageContent, 'contact.header.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Contact Info cards */}
        <div className="space-y-6 text-left">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3">Get in Touch</h3>
            <div className="space-y-3.5 text-sm text-slate-600">
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Phone</span>
                  <span>{getContentValue(pageContent, 'contact.phone')}</span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Email</span>
                  <a href={`mailto:${getContentValue(pageContent, 'contact.email')}`} className="text-sky-600 hover:underline">{getContentValue(pageContent, 'contact.email')}</a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Address</span>
                  <span>{getContentValue(pageContent, 'contact.address')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3">Operating Hours</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <div className="flex justify-between w-48">
                    <span className="font-semibold text-slate-900">Monday - Friday:</span>
                    <span>{getContentValue(pageContent, 'contact.hours.weekdays')}</span>
                  </div>
                  <div className="flex justify-between w-48 mt-1">
                    <span className="font-semibold text-slate-900">Sat - Sun:</span>
                    <span>{getContentValue(pageContent, 'contact.hours.weekend')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 shadow-xs text-left">
          <h3 className="text-xl font-bold text-slate-900 mb-6">{getContentValue(pageContent, 'contact.form.title')}</h3>

          {submitted ? (
            <div className="p-6 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 flex items-start space-x-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-950 text-sm">Message Sent Successfully!</h4>
                <p className="text-emerald-700 text-xs mt-1">Thank you for reaching out. A client support specialist will get back to you shortly.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-200 focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-200 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="phone" className="block text-sm font-semibold text-slate-700">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+61 400 000 000"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-200 focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="subject" className="block text-sm font-semibold text-slate-700">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Booking Inquiry"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-200 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="message" className="block text-sm font-semibold text-slate-700">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Detail your requirements here..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-200 focus:border-sky-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center space-x-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-sky-100 hover:shadow-sky-200 cursor-pointer disabled:opacity-60 text-sm"
                >
                  <Send className="h-4 w-4" />
                  <span>{submitting ? 'Sending...' : getContentValue(pageContent, 'contact.form.submit')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Map Section */}
      <section className="bg-slate-200 rounded-3xl h-80 overflow-hidden relative border border-slate-300">
        {/* Simulated Map Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] flex items-center justify-center bg-slate-100">
          <div className="bg-white px-6 py-4 rounded-2xl shadow-lg border border-slate-200 text-center space-y-2 max-w-sm">
            <MapPin className="h-8 w-8 text-sky-500 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">Sydney Headquarters</h4>
            <p className="text-slate-500 text-xs">123 Sparkle Way, Sydney NSW 2000</p>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block pt-2">Map view simulated</span>
          </div>
        </div>
      </section>
    </div>
  );
}
