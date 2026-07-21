import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Clock, ThumbsUp, DollarSign, ChevronDown, Phone, Mail, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { getContentValue, DEFAULT_PAGE_CONTENT } from '../utils/pageContent';

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);
  const [pageContent, setPageContent] = useState(DEFAULT_PAGE_CONTENT);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  useEffect(() => {
    async function fetchContent() {
      try {
        const data = await api.getPageContent('home');
        setPageContent({ ...DEFAULT_PAGE_CONTENT, home: { ...DEFAULT_PAGE_CONTENT.home, ...data } });
      } catch (err) {
        console.warn('Failed to load home page content:', err);
        setPageContent(DEFAULT_PAGE_CONTENT);
      }
    }

    fetchContent();
  }, []);

  const servicesPreview = [
    {
      name: 'Regular House Cleaning',
      price: '$120',
      desc: 'Routine upkeep including dusting, mopping, vacuuming, and cleaning kitchens/bathrooms.',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=400'
    },
    {
      name: 'Deep Cleaning',
      price: '$200',
      desc: 'Detailed scrub of baseboards, behind appliances, inside ovens, and overall sanitization.',
      image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=400'
    },
    {
      name: 'Office Cleaning',
      price: '$250',
      desc: 'Ensure a clean, safe, and professional environment for your employees and clients.',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400'
    }
  ];

  const benefits = [
    { icon: <ShieldCheck className="h-8 w-8 text-sky-500" />, title: 'Vetted Professionals', desc: 'All cleaners are fully background checked, insured, and highly trained.' },
    { icon: <Clock className="h-8 w-8 text-sky-500" />, title: 'Save Valuable Time', desc: 'Reclaim your weekends. Leave the dust and grime to us.' },
    { icon: <ThumbsUp className="h-8 w-8 text-sky-500" />, title: '100% Satisfaction', desc: "Not happy with the results? We'll re-clean for free, no questions asked." },
    { icon: <DollarSign className="h-8 w-8 text-sky-500" />, title: 'Affordable Rates', desc: 'Competitive upfront pricing. No hidden fees or surprise charges.' }
  ];

  const testimonials = [
    { name: 'Sarah Jenkins', role: 'Homeowner', quote: 'SparkleClean is absolutely fantastic. They did a deep clean of my apartment and it looked brand new. Super reliable and professional!' },
    { name: 'Marcus Brody', role: 'Business Owner', quote: 'We use their office cleaning service weekly. Extremely dependable, and our workspaces are always clean. A+ recommendation.' },
    { name: 'Emily Watson', role: 'Tenant', quote: 'Booked their end of lease clean. The team was fast, thorough, and I got my full bond back without any issues.' }
  ];

  const faqs = [
    { q: 'How much does professional cleaning cost?', a: 'Pricing depends on the service type, property size (bedrooms/bathrooms), and any extra add-ons. Our regular home cleaning starts at $120. You can get an instant, custom quote on our Booking page.' },
    { q: 'Do I need to provide cleaning supplies or equipment?', a: 'No, our professional cleaning team brings everything required, including vacuum cleaners, mops, microfibers, and premium cleaning products. If you prefer green/organic products, let us know!' },
    { q: 'How long does a typical cleaning session take?', a: 'Standard house cleaning typically takes between 2 to 3 hours. Deep cleanings and move-out cleanings can take 4 to 6 hours depending on the property size.' },
    { q: 'Can I reschedule or cancel my booking?', a: 'Yes. You can reschedule or cancel your cleaning appointment up to 24 hours before your scheduled slot. Please email or call us to make adjustments.' }
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-blue-50 py-20 px-4 sm:px-6 lg:px-8 border-b border-sky-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-sky-100/70 text-sky-700 font-semibold text-xs uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              <span>Premium Cleaning Services</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mt-0">
              {getContentValue(pageContent, 'home.hero.title')}
            </h1>
            <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
              {getContentValue(pageContent, 'home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/booking"
                className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-sky-100 hover:shadow-sky-200 transition-all text-center"
              >
                {getContentValue(pageContent, 'home.hero.primaryButton')}
              </Link>
              <Link
                to="/services"
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-8 py-4 rounded-xl transition-all text-center"
              >
                {getContentValue(pageContent, 'home.hero.secondaryButton')}
              </Link>
            </div>
          </div>
          <div className="relative lg:block flex justify-center">
            <div className="absolute -inset-1 bg-gradient-to-r from-sky-400 to-blue-500 rounded-2xl blur-lg opacity-25"></div>
            <img
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600"
              alt="Professional Cleaning Service"
              className="relative rounded-2xl shadow-xl w-full max-w-md object-cover aspect-[4/3] border border-white"
            />
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{getContentValue(pageContent, 'home.services.title')}</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            {getContentValue(pageContent, 'home.services.subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {servicesPreview.map((service, index) => (
            <div
              key={index}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col h-full"
            >
              <div className="h-48 overflow-hidden relative">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-3 right-3 bg-sky-500 text-white font-bold px-3 py-1 rounded-full text-sm">
                  Starting {service.price}
                </div>
              </div>
              <div className="p-6 space-y-4 flex flex-col flex-grow text-left">
                <h3 className="text-xl font-bold text-slate-900">{service.name}</h3>
                <p className="text-sm text-slate-500 flex-grow leading-relaxed">{service.desc}</p>
                <div className="pt-4">
                  <Link
                    to="/booking"
                    className="block text-center bg-sky-50 hover:bg-sky-100 text-sky-600 font-semibold py-2.5 rounded-lg transition-colors text-sm"
                  >
                    Get a Quote
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Why Choose SparkleClean?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              We hold ourselves to the highest standards, ensuring premium results and unmatched reliability.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 text-left space-y-4 shadow-xs">
                <div className="p-3 bg-sky-50 inline-block rounded-xl">
                  {benefit.icon}
                </div>
                <h3 className="font-bold text-lg text-slate-950">{benefit.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">What Our Customers Say</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Read real feedback from happy clients who have experienced our professional touch.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <div key={index} className="bg-white border border-slate-200 rounded-2xl p-6 text-left shadow-xs flex flex-col justify-between">
              <p className="text-slate-600 italic text-sm leading-relaxed">"{t.quote}"</p>
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                  <span className="text-xs text-slate-400">{t.role}</span>
                </div>
                <span className="text-amber-400 font-bold text-sm">★★★★★</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Service Areas */}
      <section className="bg-gradient-to-br from-sky-600 to-blue-700 py-16 text-white rounded-3xl max-w-7xl mx-auto px-6 sm:px-12 shadow-xl shadow-sky-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">{getContentValue(pageContent, 'home.cta.title')}</h2>
            <p className="text-sky-100 text-base leading-relaxed">
              {getContentValue(pageContent, 'home.cta.subtitle')}
            </p>
            <div className="grid grid-cols-2 gap-4 text-sky-100 font-semibold text-sm">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-sky-200"></span>
                <span>Sydney Central</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-sky-200"></span>
                <span>North Shore</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-sky-200"></span>
                <span>Inner West</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-sky-200"></span>
                <span>Eastern Suburbs</span>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/15 text-left space-y-4">
            <h3 className="text-xl font-bold">Ready to make your home sparkle?</h3>
            <p className="text-sky-100 text-sm">Get an instant quote and book online in a few clicks. Safe checkout with card payments.</p>
            <div className="pt-2">
              <Link
                to="/booking"
                className="inline-block bg-white hover:bg-sky-50 text-sky-600 font-bold px-6 py-3.5 rounded-xl transition-all shadow-md text-center text-sm"
              >
                Book Your Cleaning Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
          <p className="text-slate-500 text-sm">Have queries about our process? Find answers below.</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className="border border-slate-200 rounded-xl bg-white overflow-hidden transition-all duration-200">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center p-5 text-left font-bold text-slate-800 hover:text-sky-600 transition-colors focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-sky-500' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-slate-500 text-sm border-t border-slate-50 leading-relaxed text-left">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3 text-center">
            <div className="p-3 bg-sky-50 rounded-full text-sky-600">
              <Phone className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900">Call Us</h3>
            <p className="text-slate-500 text-sm">Friendly advice and instant offline booking.</p>
            <p className="font-semibold text-sky-600">+61 2 9876 5432</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3 text-center">
            <div className="p-3 bg-sky-50 rounded-full text-sky-600">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900">Email Us</h3>
            <p className="text-slate-500 text-sm">We respond to email queries within 2 hours.</p>
            <a href="mailto:info@sparkleclean.com" className="font-semibold text-sky-600 hover:underline">info@sparkleclean.com</a>
          </div>
          <div className="flex flex-col items-center p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3 text-center">
            <div className="p-3 bg-sky-50 rounded-full text-sky-600">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900">Visit Us</h3>
            <p className="text-slate-500 text-sm">Headquarters office (by appointment only).</p>
            <p className="font-semibold text-slate-700">123 Sparkle Way, Sydney NSW 2000</p>
          </div>
        </div>
      </section>
    </div>
  );
}
