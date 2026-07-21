import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { getContentValue, DEFAULT_PAGE_CONTENT } from '../utils/pageContent';
import { Clock, ShieldAlert, BadgeDollarSign, Calendar } from 'lucide-react';

const FALLBACK_SERVICES = [
  {
    id: 'regular-house-cleaning',
    name: 'Regular House Cleaning',
    description: 'Routine cleaning service for maintaining a clean and comfortable home. Includes dusting, vacuuming, mopping, and basic kitchen & bathroom sanitization.',
    price: 120.0,
    duration: 120,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'deep-cleaning',
    name: 'Deep Cleaning',
    description: 'A detailed cleaning service covering areas that require extra attention, such as baseboards, inside cabinets, and grout cleaning.',
    price: 200.0,
    duration: 240,
    image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'office-cleaning',
    name: 'Office Cleaning',
    description: 'Professional cleaning services for workplaces and commercial areas to ensure a healthy environment for your employees.',
    price: 250.0,
    duration: 180,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'move-in-out-cleaning',
    name: 'Move-In / Move-Out Cleaning',
    description: 'Comprehensive cleaning service for customers moving into or leaving a property. Restores the home to like-new condition.',
    price: 300.0,
    duration: 300,
    image: 'https://images.unsplash.com/photo-1603712449591-2f76db916b78?auto=format&fit=crop&q=80&w=600'
  }
];

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageContent, setPageContent] = useState(DEFAULT_PAGE_CONTENT);

  useEffect(() => {
    async function fetchServices() {
      try {
        const data = await api.getServices();
        if (data && data.length > 0) {
          setServices(data);
        } else {
          setServices(FALLBACK_SERVICES);
        }
      } catch (err) {
        console.warn('API error when fetching services, falling back to mock services:', err);
        setServices(FALLBACK_SERVICES);
      } finally {
        setLoading(false);
      }
    }

    fetchServices();

    async function fetchPageContent() {
      try {
        const data = await api.getPageContent('services');
        setPageContent({ ...DEFAULT_PAGE_CONTENT, ...data });
      } catch (err) {
        console.warn('Failed to load services page content:', err);
        setPageContent(DEFAULT_PAGE_CONTENT);
      }
    }

    fetchPageContent();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mt-0">{getContentValue(pageContent, 'services.header.title')}</h1>
        <p className="text-lg text-slate-500 leading-relaxed">
          {getContentValue(pageContent, 'services.header.subtitle')}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row h-full group"
            >
              {/* Service Image */}
              <div className="w-full md:w-2/5 h-64 md:h-auto overflow-hidden relative">
                <img
                  src={service.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600'}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                />
              </div>

              {/* Service Content */}
              <div className="p-8 flex flex-col justify-between flex-grow md:w-3/5 text-left space-y-6">
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-slate-900 group-hover:text-sky-600 transition-colors">{service.name}</h2>
                  <p className="text-sm text-slate-500 leading-relaxed">{service.description}</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  {/* Service Stats */}
                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
                    <div className="flex items-center space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                      <BadgeDollarSign className="h-4 w-4 text-sky-500" />
                      <span>Starts from ${service.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                      <Clock className="h-4 w-4 text-sky-500" />
                      <span>~{(service.duration / 60).toFixed(1)} hrs</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    <Link
                      to="/booking"
                      state={{ selectedServiceId: service.id }}
                      className="w-full inline-flex items-center justify-center space-x-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md shadow-sky-100 hover:shadow-sky-200"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Book Online Now</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trust Banner */}
      <section className="bg-slate-100 rounded-3xl p-8 md:p-12 border border-slate-200 text-left grid grid-cols-1 md:grid-cols-3 gap-8 items-center mt-12">
        <div className="md:col-span-2 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold text-xs">
            <ShieldAlert className="h-4 w-4" />
            <span>{getContentValue(pageContent, 'services.trust.title')}</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{getContentValue(pageContent, 'services.trust.title')}</h3>
          <p className="text-slate-500 text-sm max-w-xl leading-relaxed">
            {getContentValue(pageContent, 'services.trust.subtitle')}
          </p>
        </div>
        <div className="flex justify-start md:justify-end">
          <Link
            to="/contact"
            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-6 py-3.5 rounded-xl transition-all text-sm shadow-xs"
          >
            {getContentValue(pageContent, 'services.cta.button')}
          </Link>
        </div>
      </section>
    </div>
  );
}
