import { Sparkles, ShieldCheck, Heart, Award, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { getContentValue, DEFAULT_PAGE_CONTENT } from '../utils/pageContent';

export default function About() {
  const values = [
    { icon: <ShieldCheck className="h-6 w-6 text-sky-500" />, title: 'Uncompromising Trust', desc: 'Every cleaner is thoroughly vetted, reference checked, and fully insured.' },
    { icon: <Heart className="h-6 w-6 text-sky-500" />, title: 'Customer First', desc: 'We tailor our packages to meet unique needs and exceed expectations.' },
    { icon: <Award className="h-6 w-6 text-sky-500" />, title: 'Attention to Detail', desc: 'We don\'t just wipe surfaces. We clean deep, leaving no corner untouched.' },
    { icon: <Users className="h-6 w-6 text-sky-500" />, title: 'Happy Cleaners, Happy Homes', desc: 'We pay above-award wages, fostering a proud and dedicated workforce.' }
  ];

  const [pageContent, setPageContent] = useState(DEFAULT_PAGE_CONTENT);

  useEffect(() => {
    async function fetchContent() {
      try {
        const data = await api.getPageContent('about');
        setPageContent({ ...DEFAULT_PAGE_CONTENT, ...data });
      } catch (err) {
        console.warn('Failed to load about page content:', err);
        setPageContent(DEFAULT_PAGE_CONTENT);
      }
    }

    fetchContent();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-50 to-sky-50 py-16 px-4 border-b border-slate-200">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mt-0">{getContentValue(pageContent, 'about.hero.title')}</h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            {getContentValue(pageContent, 'about.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-left">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-slate-900">{getContentValue(pageContent, 'about.content.title')}</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            {getContentValue(pageContent, 'about.content.p1')}
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            {getContentValue(pageContent, 'about.content.p2')}
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            {getContentValue(pageContent, 'about.content.p3')}
          </p>
        </div>
        <div className="relative">
          <div className="absolute -inset-1 bg-sky-300 rounded-2xl blur opacity-20"></div>
          <img
            src="https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=600"
            alt="Cleaning Team"
            className="relative rounded-2xl shadow-lg w-full object-cover aspect-[4/3] border border-white"
          />
        </div>
      </section>

      {/* Mission & Values */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Our Core Values</h2>
            <p className="text-slate-500 text-sm mt-2">The guidelines behind our premium results.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
            {values.map((v, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
                <div className="p-2 bg-sky-50 inline-block rounded-lg">
                  {v.icon}
                </div>
                <h3 className="font-bold text-slate-900">{v.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="inline-flex p-3 bg-sky-100/70 rounded-full text-sky-600">
          <Sparkles className="h-8 w-8 text-sky-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900">Experience the SparkleClean Difference</h2>
        <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
          Book online today. Choose your cleaning checklist, select an available time, and leave the hard work to our professionals.
        </p>
        <div className="pt-2">
          <Link
            to="/booking"
            className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-sky-100 hover:shadow-sky-200 transition-all text-center inline-block"
          >
            {getContentValue(pageContent, 'about.cta.button')}
          </Link>
        </div>
      </section>
    </div>
  );
}
