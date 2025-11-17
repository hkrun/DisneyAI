export interface Home {
  hero: {
    title: {
      imageConversion: string;
      videoConversion: string;
    };
    subtitle: {
      imageConversion: string;
      videoConversion: string;
    };
  };
  converter: {
    imageMode: {
      label: string;
      description: string;
    };
    videoMode: {
      label: string;
      description: string;
    };
  };
  features: {
    title: string;
    subtitle: string;
    items: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
    videoNotSupported: string;
  };
  templates: {
    title: string;
    subtitle: string;
    viewAll: string;
    filters: {
      all: string;
      classic: string;
      pixar: string;
      modern: string;
    };
    items: Array<{
      title: string;
      tag: string;
      description: string;
      status: string;
    }>;
  };
  community: {
    title: string;
    subtitle: string;
    stats: {
      users: string;
      creations: string;
      satisfaction: string;
    };
  };
  pricing: {
    title: string;
    subtitle: string;
    cta: string;
    learnMore: string;
  };
  activity: {
    badge: string;
    title: string;
    description: string;
    rules: string[];
    cta: string;
  };
  testimonials: {
    title: string;
    subtitle: string;
    items: Array<{
      content: string;
      author: string;
      role: string;
    }>;
  };
  faq: {
    title: string;
    subtitle: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  meta?: {
    title?: string;
    description?: string;
    alt?: string;
    keywords?: string;
  };
}