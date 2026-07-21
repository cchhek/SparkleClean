export const DEFAULT_PAGE_CONTENT = {
  'home.hero.title': 'Making your home clean, comfortable, and stress-free.',
  'home.hero.subtitle': 'Book professional, reliable, and vetted cleaning specialists online in under 60 seconds. Sit back and relax while we make your home shine.',
  'home.hero.primaryButton': 'Book a Cleaning',
  'home.hero.secondaryButton': 'Explore Services',
  'home.services.title': 'Popular Cleaning Services',
  'home.services.subtitle': 'Choose from our range of services tailored to meet all home and business cleaning needs.',
  'home.why.title': 'Why Choose SparkleClean?',
  'home.why.subtitle': 'We hold ourselves to the highest standards, ensuring premium results and unmatched reliability.',
  'home.cta.title': 'We Serve the Entire Metropolitan Area',
  'home.cta.subtitle': 'Wondering if we operate in your neighborhood? Our professional teams serve Sydney Metro, North Shore, Inner West, and Eastern Suburbs.',
  'home.cta.button': 'Book Your Cleaning Now',

  'services.header.title': 'Our Cleaning Services',
  'services.header.subtitle': 'Explore our range of professional cleaning packages. Choose the service that fits your schedule and requirements, and customize it with optional add-ons.',
  'services.trust.title': 'Custom cleaning requirements?',
  'services.trust.subtitle': 'If you have a large property, specific commercial schedule, or specialized requests that do not fit standard categories, reach out to us directly for a custom tailored cleaning solution.',
  'services.cta.button': 'Get in Touch',

  'about.hero.title': 'Our Story',
  'about.hero.subtitle': 'Founded with a simple mission: to bring premium, stress-free, and professional cleaning services to homes and businesses across the metropolitan region.',
  'about.content.title': 'How SparkleClean Began',
  'about.content.p1': 'It started in 2018 when our founder struggled to find a reliable, high-quality home cleaning service online. Booking required phone calls, vague quotes, and inconsistent results.',
  'about.content.p2': 'We decided to fix that. We designed a web booking system that calculates quotes instantly based on bedrooms/bathrooms, accepts safe card payments, and dispatches highly trained cleaning professionals who arrive on time and get the job done right.',
  'about.content.p3': 'Today, SparkleClean has completed over 15,000 bookings and maintains a 4.9-star client rating. We continue to invest in eco-friendly supplies and advanced training for our amazing staff.',
  'about.cta.title': 'Experience the SparkleClean Difference',
  'about.cta.subtitle': 'Book online today. Choose your cleaning checklist, select an available time, and leave the hard work to our professionals.',
  'about.cta.button': 'Book Now',

  'contact.header.title': 'Contact Our Team',
  'contact.header.subtitle': 'Have a question about our booking flow, pricing, or checklists? Get in touch with us. We generally reply to all email requests within 2 hours.',
  'contact.phone': '+61 2 9876 5432',
  'contact.email': 'info@sparkleclean.com',
  'contact.address': '123 Sparkle Way, Sydney NSW 2000',
  'contact.hours.weekdays': 'Monday - Friday: 8 AM - 6 PM',
  'contact.hours.weekend': 'Sat - Sun: 9 AM - 4 PM',
  'contact.form.title': 'Send Us a Message',
  'contact.form.subtitle': 'Send a message and a client support specialist will get back to you shortly.',
  'contact.form.submit': 'Send Message'
};

export const PAGE_CONTENT_FIELDS = {
  home: [
    { key: 'home.hero.title', label: 'Hero Title', type: 'textarea' },
    { key: 'home.hero.subtitle', label: 'Hero Subtitle', type: 'textarea' },
    { key: 'home.hero.primaryButton', label: 'Hero Primary Button', type: 'text' },
    { key: 'home.hero.secondaryButton', label: 'Hero Secondary Button', type: 'text' },
    { key: 'home.services.title', label: 'Services Section Title', type: 'text' },
    { key: 'home.services.subtitle', label: 'Services Section Subtitle', type: 'textarea' },
    { key: 'home.why.title', label: 'Why Choose Section Title', type: 'text' },
    { key: 'home.why.subtitle', label: 'Why Choose Section Subtitle', type: 'textarea' },
    { key: 'home.cta.title', label: 'CTA Section Title', type: 'text' },
    { key: 'home.cta.subtitle', label: 'CTA Section Subtitle', type: 'textarea' },
    { key: 'home.cta.button', label: 'CTA Button Label', type: 'text' }
  ],
  services: [
    { key: 'services.header.title', label: 'Services Header Title', type: 'text' },
    { key: 'services.header.subtitle', label: 'Services Header Subtitle', type: 'textarea' },
    { key: 'services.trust.title', label: 'Custom Trust Title', type: 'text' },
    { key: 'services.trust.subtitle', label: 'Custom Trust Subtitle', type: 'textarea' },
    { key: 'services.cta.button', label: 'Trust Banner Button', type: 'text' }
  ],
  about: [
    { key: 'about.hero.title', label: 'About Hero Title', type: 'text' },
    { key: 'about.hero.subtitle', label: 'About Hero Subtitle', type: 'textarea' },
    { key: 'about.content.title', label: 'About Content Section Title', type: 'text' },
    { key: 'about.content.p1', label: 'About Paragraph 1', type: 'textarea' },
    { key: 'about.content.p2', label: 'About Paragraph 2', type: 'textarea' },
    { key: 'about.content.p3', label: 'About Paragraph 3', type: 'textarea' },
    { key: 'about.cta.title', label: 'CTA Title', type: 'text' },
    { key: 'about.cta.subtitle', label: 'CTA Subtitle', type: 'textarea' },
    { key: 'about.cta.button', label: 'CTA Button Label', type: 'text' }
  ],
  contact: [
    { key: 'contact.header.title', label: 'Contact Header Title', type: 'text' },
    { key: 'contact.header.subtitle', label: 'Contact Header Subtitle', type: 'textarea' },
    { key: 'contact.phone', label: 'Contact Phone', type: 'text' },
    { key: 'contact.email', label: 'Contact Email', type: 'text' },
    { key: 'contact.address', label: 'Contact Address', type: 'text' },
    { key: 'contact.hours.weekdays', label: 'Weekday Hours', type: 'text' },
    { key: 'contact.hours.weekend', label: 'Weekend Hours', type: 'text' },
    { key: 'contact.form.title', label: 'Contact Form Title', type: 'text' },
    { key: 'contact.form.subtitle', label: 'Contact Form Subtitle', type: 'textarea' },
    { key: 'contact.form.submit', label: 'Submit Button Label', type: 'text' }
  ]
};

export const getContentValue = (content, key) => {
  return content?.[key] ?? DEFAULT_PAGE_CONTENT[key] ?? '';
};

export const mergePageContent = (content) => ({
  ...DEFAULT_PAGE_CONTENT,
  ...content
});

export const CONTENT_PAGES = [
  { value: 'home', label: 'Home' },
  { value: 'services', label: 'Services' },
  { value: 'about', label: 'About' },
  { value: 'contact', label: 'Contact' }
];
