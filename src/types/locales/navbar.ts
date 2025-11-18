
export interface Navbar {
  logo: string;
  logoTitle: string;
  navigation: Navigation[];
  actions: {
    signIn: string;
  };
  mobileMenu: MobileMenuLocale;
  userButton: UserButtonLocale;
  languageToggle: {
    label: string;
  };
  themeToggle: {
    label: string;
  };
  creditsDisplay: CreditsDisplayLocale;
  installApp?: InstallAppLocale;
}


export interface UserMenuItem {
  label: string;
  href?: string;
  type: 'contact' | 'billing' | 'account' | 'history' | 'logout';
}

export interface UserButtonLocale {
  menuItems: UserMenuItem[];
  aria: {
    userMenu: string;
    userImage: string;
    userName: string;
    userEmail: string;
  };
}

export interface Navigation {
  href: string;
  label: string;
}

export interface MobileMenuLocale {
  toggleMenu: string;
  actions: {
    signIn: string;
    signOut?: string;
    upgradePlan: string;
    contactUs: string;
  };
  settings: {
    theme: string;
    language: string;
  };
  navigation: Navigation[];
}

export interface CreditsDisplayLocale {
  label: string;
  tooltip: {
    title: string;
    costInfo: string;
    usageInfo: string;
    getMoreButton: string;
  };
}

export interface InstallAppLocale {
  tooltip: string;
  title: string;
  description: string;
  install: string;
  cancel: string;
  later: string;
  installed: string;
  button: string;
  manualInstall: {
    title: string;
    description: string;
    chrome: {
      title: string;
      steps: string[];
    };
    edge: {
      title: string;
      steps: string[];
    };
    safari: {
      title: string;
      steps: string[];
    };
    tip: string;
  };
}
