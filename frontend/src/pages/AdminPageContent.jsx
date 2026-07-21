import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { PAGE_CONTENT_FIELDS, CONTENT_PAGES, DEFAULT_PAGE_CONTENT, mergePageContent } from '../utils/pageContent';
import { Loader2, Save } from 'lucide-react';

export default function AdminPageContent() {
  const [activePage, setActivePage] = useState('home');
  const [content, setContent] = useState({});
  const [formValues, setFormValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const getPageFormValues = (page, contentData) => {
    const pageFields = PAGE_CONTENT_FIELDS[page] || [];
    return pageFields.reduce((acc, field) => {
      acc[field.key] = contentData[field.key] ?? DEFAULT_PAGE_CONTENT[field.key] ?? '';
      return acc;
    }, {});
  };

  useEffect(() => {
    loadPageContent(activePage);
  }, [activePage]);

  const loadPageContent = async (page) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await api.getPageContent(page);
      const merged = mergePageContent(data || {});
      setContent(merged);
      setFormValues(getPageFormValues(page, merged));
    } catch (err) {
      console.error('Failed to load page content:', err);
      setErrorMessage('Unable to fetch page content.');
      setContent({});
      setFormValues({});
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const pageData = formValues;
      await api.savePageContent(activePage, pageData);
      setSuccessMessage('Page content saved successfully.');
      setContent((prev) => ({ ...prev, ...pageData }));
    } catch (err) {
      console.error('Failed to save page content:', err);
      setErrorMessage(err.message || 'Unable to save page content.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Page Content Editor</h2>
          <p className="text-slate-500 text-sm max-w-2xl">
            Edit the homepage, services, about, and contact page text without changing source code.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {CONTENT_PAGES.map(page => (
          <button
            key={page.value}
            type="button"
            onClick={() => setActivePage(page.value)}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-colors ${
              activePage === page.value ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {page.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {PAGE_CONTENT_FIELDS[activePage].map(field => (
                <div key={field.key} className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formValues[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className="w-full min-h-[120px] px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-200"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formValues[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-200"
                    />
                  )}
                </div>
              ))}
            </div>

            {errorMessage && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-rose-700 text-sm">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-700 text-sm">
                {successMessage}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center space-x-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 py-3 rounded-2xl transition-all disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>{saving ? 'Saving...' : 'Save Page Content'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
