export interface Pricing {
  hero: {
    subtitle: string;
    title: string;
    description: string;
  };
  billing: {
    title: string;
    monthly: string;
    annual: string;
    save: string;
  };
  personal: {
    title: string;
    description: string;
    badge: string;
    popular: string;
  };
  basic: {
    title: string;
    price: {
      amount: string;
      period: string;
    };
    annualPrice?: {
      amount: string;
      period: string;
    };
    trial: string;
    currency: string;
    mode: "payment" | "recurring";
    features: Array<string>;
    annualFeatures?: Array<string>;
    product: Product;
    annualProduct?: Product;
    cta: string;
  };
  premium: {
    title: string;
    price: {
      amount: string;
      period: string;
    };
    annualPrice?: {
      amount: string;
      period: string;
    };
    trial: string;
    currency: string;
    mode: "payment" | "recurring";
    features: Array<string>;
    annualFeatures?: Array<string>;
    product: Product;
    annualProduct?: Product;
    cta: string;
  };
  professional: {
    title: string;
    price: {
      amount: string;
      period: string;
    };
    annualPrice?: {
      amount: string;
      period: string;
    };
    trial: string;
    currency: string;
    mode: "payment" | "recurring";
    features: Array<string>;
    annualFeatures?: Array<string>;
    product: Product;
    annualProduct?: Product;
    cta: string;
  };
  elite: {
    title: string;
    price: {
      amount: string;
      period: string;
    };
    trial: string;
    currency: string;
    mode: "payment" | "recurring";
    features: Array<string>;
    product: Product;
    cta: string;
  };
  oneTimeBasic: {
    title: string;
    price: {
      amount: string;
      period: string;
    };
    currency: string;
    mode: "payment" | "recurring";
    features: Array<string>;
    product: Product;
    cta: string;
  };
  oneTimeProfessional: {
    title: string;
    price: {
      amount: string;
      period: string;
    };
    currency: string;
    mode: "payment" | "recurring";
    features: Array<string>;
    product: Product;
    cta: string;
  };
  oneTimeElite: {
    title: string;
    price: {
      amount: string;
      period: string;
    };
    currency: string;
    mode: "payment" | "recurring";
    features: Array<string>;
    product: Product;
    cta: string;
  };
  business: {
    title: string;
    price: {
      amount: string;
      period: string;
    };
    annualPrice?: {
      amount: string;
      period: string;
    };
    trial: string;
    currency: string;
    mode: "payment" | "recurring";
    features: Array<string>;
    product: Product;
    annualProduct?: Product;
    cta: string;
  };
  freeTrial: {
    title: string;
    description: string;
    badge: string;
    price: {
      amount: string;
      period: string;
    };
    trial: string;
    currency: string;
    mode: "trial";
    features: Array<string>;
    placeholderFeatures: {
      templateUsage: string;
      customDisneyAi: string;
      historyView: string;
    };
    placeholderDescriptions: {
      templateUsage: string;
      customDisneyAi: string;
      historyView: string;
    };
    placeholderPrice: string;
    placeholderPeriod: string;
    statusTexts: {
      checkingTrial: string;
      trialUsed: string;
    };
    product: Product;
    cta: string;
    afterTrial: string;
  };
  plan?: {
    title: string;
    price: {
      amount: string;
      period: string;
    };
    currency: string;
    mode: "payment" | "recurring";
    features: Array<string>;
    product: Product;
    cta: string;
  };
  quarter?: {
    title: string;
    price: {
      amount: string;
      period: string;
    };
    currency: string;
    mode: "payment" | "recurring";
    features: Array<string>;
    product: Product;
    cta: string;
  };
  annual?: {
    title: string;
    price: {
      amount: string;
      period: string;
    };
    currency: string;
    mode: "payment" | "recurring";
    features: Array<string>;
    product: Product;
    cta: string;
  };
  oneTime?: {
    title: string;
    price: {
      amount: string;
      period: string;
    };
    features?: Array<string>;
    product: Product;
    cta: string;
  };
  paymentTips: string;
  trust: {
    text: string;
    allPlansInclude: string;
    features: {
      secureTranslation: string;
      cloudSync: string;
      mobileAccess: string;
      prioritySupport: string;
    };
  };
  planDescriptions: {
    basic: string;
    professional: string;
    elite: string;
    oneTimeBasic: string;
    oneTimeProfessional: string;
    oneTimeElite: string;
    business: string;
    freeTrial?: string;
    monthly?: string;
    quarterly?: string;
    annual?: string;
  };
  meta: {
    keywords: string;
    title: string;
    description: string;
    alt: string;
  };
  // 🆕 支付相关类型
  payment?: {
    loading: {
      title: string;
      userId: string;
      email: string;
      loadingText: string;
    };
    updating: {
      title: string;
    };
  };
  // 🆕 试用相关类型
  trial: {
    startFreeTrial: string;
    alreadyUsed: string;
    alreadyUsedTitle: string;
    alreadyUsedMessage: string;
    alreadyUsedButton: string;
    cannotReapply: string;
    checkFailed: string;
    checkFailedDesc: string;
  };
  // 🆕 订阅状态相关类型
  subscription: {
    subscribeNow: string;
    duplicateTitle: string;
    duplicateActiveMessage: string;
    duplicateCanceledMessage: string;
    duplicateButton: string;
    checkFailed: string;
    checkFailedDesc: string;
    expiryTime: string;
    subscriptionTypes: {
      trial: string;
      monthly: string;
      quarterly: string;
      annual: string;
      unknown: string;
    };
  };
}

export interface Product {
  code: string;
  desc: string;
  name: string;
  quantity: string;
  sku: string;
  type: string;
  unit_price: string;
  url?: string;
  priceId?: string;
}