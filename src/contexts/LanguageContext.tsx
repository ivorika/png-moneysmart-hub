import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'tpi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Header
    'header.title': 'PNG PriceWatch',
    'header.subtitle': 'Financial Empowerment for Papua New Guinea',
    'header.getStarted': 'Get Started',
    'header.signIn': 'Sign In',
    'header.tokPisin': 'Tok Pisin',
    'header.english': 'English',
    
    // Navigation
    'nav.home': 'Home',
    'nav.budget': 'My Budget',
    'nav.market': 'Market Check',
    'nav.rights': 'Know Your Rights',
    'nav.learn': 'Learn & Grow',
    
    // Hero Section
    'hero.title': 'Take Control of Your Finances',
    'hero.subtitle': 'Empowering Papua New Guineans with financial knowledge and price transparency',
    'hero.description': 'Join thousands of PNG families who are building better financial futures through smart budgeting, market awareness, and consumer rights education.',
    'hero.startBudgeting': 'Start Budgeting',
    'hero.checkPrices': 'Check Prices',
    'hero.learnMore': 'Learn More',
    
    // Features
    'features.budget.title': 'Smart Budgeting',
    'features.budget.description': 'Track income and expenses in PNG Kina with culturally relevant categories',
    'features.market.title': 'Price Transparency',
    'features.market.description': 'Compare prices across PNG and avoid being overcharged',
    'features.rights.title': 'Know Your Rights',
    'features.rights.description': 'Understand PNG consumer laws and report unfair pricing',
    'features.learn.title': 'Financial Education',
    'features.learn.description': 'Build wealth through practical financial knowledge',
    
    // Auth
    'auth.title': 'Welcome to PNG PriceWatch',
    'auth.subtitle': 'Sign in to start your financial journey',
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.noAccount': "Don't have an account?",
    'auth.haveAccount': 'Already have an account?',
    'auth.creating': 'Creating account...',
    'auth.signingIn': 'Signing in...',
    'auth.backToHome': 'Back to Home',
    
    // Hero Section - detailed
    'hero.featuresTitle.budget': 'My Budget',
    'hero.featuresDesc.budget': 'Track income, expenses, and set financial goals with our easy-to-use budgeting tools.',
    'hero.featuresTitle.market': 'Market Check',
    'hero.featuresDesc.market': 'Compare prices from your community and find the best deals on essential items.',
    'hero.featuresTitle.rights': 'Know Your Rights',
    'hero.featuresDesc.rights': 'Understand pricing regulations and report unfair practices to protect your community.',
    'hero.featuresTitle.learn': 'Learn & Grow',
    'hero.featuresDesc.learn': 'Access educational resources to improve your financial knowledge and skills.',
    'hero.mission.title': 'Our Mission',
    'hero.mission.description': 'We believe that financial empowerment starts with understanding. PNG PriceWatch helps you take control of your finances, make informed purchasing decisions, and build a stronger economic future for Papua New Guinea.',
    
    // Market Section
    'market.title': 'Market Check',
    'market.subtitle': 'Compare prices and find the best deals in your community',
    'market.search.placeholder': 'Search for products (e.g., rice, oil, sugar...)',
    'market.search.button': 'Search',
    'market.trend.up': 'up',
    'market.trend.down': 'down',
    'market.trend.stable': 'stable',
    'market.signIn.title': 'Sign In to Contribute',
    'market.signIn.description': 'Join our community to add price information and help others find better deals',
    'market.signIn.button': 'Sign In to Add Prices',
    'market.contribute.title': 'Help Your Community',
    'market.contribute.description': 'Share price information from your local store to help others find better deals',
    'market.contribute.button': 'Add Price Information',
    'market.alert.title': 'High Price Alert',
    'market.alert.description': 'Sugar prices have increased by 15% this week. Consider buying from alternative stores or reducing consumption.',
    
    // Rights Section
    'rights.title': 'Know Your Rights',
    'rights.subtitle': 'Understanding regulations and protecting yourself from unfair pricing',
    'rights.alert.title': 'Know Your Rights:',
    'rights.alert.description': 'PNG has price regulations on essential services. Report overcharging to help protect your community.',
    'rights.regulated.title': 'Government Regulated Prices',
    'rights.report.title': 'Report Overcharging',
    'rights.report.description': 'Found a store charging above regulated prices? Take a photo and report it to the authorities.',
    'rights.report.button': 'Take Photo & Report',
    'rights.contact.title': 'Contact Authorities',
    'rights.consumerRights.title': 'Your Consumer Rights in PNG',
    'rights.fairPricing.title': 'Right to Fair Pricing',
    'rights.fairPricing.description': 'Businesses cannot charge more than regulated maximum prices for essential services like fuel, electricity, and water.',
    'rights.information.title': 'Right to Information',
    'rights.information.description': 'Businesses must clearly display prices and cannot hide additional charges or fees.',
    'rights.quality.title': 'Right to Quality',
    'rights.quality.description': 'Products must match their description and be of reasonable quality for the price paid.',
    'rights.complain.title': 'Right to Complain',
    'rights.complain.description': 'You can report unfair practices to government authorities and consumer protection agencies.',
    'rights.warning.title': 'Warning:',
    'rights.warning.description': 'If you notice consistent overcharging or price fixing, report it immediately. These practices hurt our entire community\'s economic wellbeing.',
    
    // Learn Section
    'learn.title': 'Learn & Grow',
    'learn.subtitle': 'Build your financial knowledge with our educational resources',
    'learn.journey.title': 'Your Learning Journey',
    'learn.journey.subtitle': 'Keep building your financial knowledge',
    'learn.journey.complete': 'Complete',
    'learn.achievements.title': 'Your Achievements',
    'learn.challenge.title': 'This Week\'s Challenge',
    'learn.challenge.name': 'Track Every Expense',
    'learn.challenge.description': 'Record all your expenses for 7 days to understand your spending patterns better.',
    'learn.challenge.progress': 'Progress: 3/7 days',
    'learn.challenge.daysLeft': '3 days left',
    'learn.tip.title': 'Daily Financial Tip',
    'learn.tip.label': '💡 Tip of the Day',
    'learn.tip.content': 'Before making any purchase over K50, wait 24 hours to think about whether you really need it. This simple rule can help you avoid impulse purchases and save money for more important goals.',
    'learn.course.start': 'Start Course',
    'learn.course.continue': 'Continue',
    'learn.course.review': 'Review',
    'learn.course.progress': 'Progress',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success!',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
  },
  tpi: {
    // Header
    'header.title': 'PNG PriceWatch',
    'header.subtitle': 'Strongim Mani Pasin bilong Papua Niugini',
    'header.getStarted': 'Stat Nau',
    'header.signIn': 'Sainin',
    'header.tokPisin': 'Tok Pisin',
    'header.english': 'Inglis',
    
    // Navigation
    'nav.home': 'Haus',
    'nav.budget': 'Mani Plan',
    'nav.market': 'Maket Lukaut',
    'nav.rights': 'Rait bilong Yu',
    'nav.learn': 'Skul na Kamap',
    
    // Hero Section
    'hero.title': 'Bosim Mani bilong Yu',
    'hero.subtitle': 'Strongim ol Papua Niugini wantok long save gut long mani na maket prais',
    'hero.description': 'Joinim planti PNG famili husat i buildim gutpela mani laif long smart mani plan, maket save, na rait bilong baiman.',
    'hero.startBudgeting': 'Stat Mani Plan',
    'hero.checkPrices': 'Lukautim Prais',
    'hero.learnMore': 'Lainim Moa',
    
    // Features
    'features.budget.title': 'Smart Mani Plan',
    'features.budget.description': 'Rekotim mani kam na mani go long PNG Kina wantaim PNG pasin',
    'features.market.title': 'Klia Prais',
    'features.market.description': 'Kampearim prais long olgeta hap bilong PNG na stopim bikprais',
    'features.rights.title': 'Save Rait bilong Yu',
    'features.rights.description': 'Lainim PNG lo bilong baiman na reportim nogut prais',
    'features.learn.title': 'Skul Mani',
    'features.learn.description': 'Kamap rich long gutpela mani save',
    
    // Auth
    'auth.title': 'Welkam long PNG PriceWatch',
    'auth.subtitle': 'Sainin long statim mani jorni bilong yu',
    'auth.signIn': 'Sainin',
    'auth.signUp': 'Registaim',
    'auth.email': 'Imel',
    'auth.password': 'Passwot',
    'auth.confirmPassword': 'Orait Passwot',
    'auth.forgotPassword': 'Lusim Passwot?',
    'auth.noAccount': 'No gat akaunt?',
    'auth.haveAccount': 'Gat akaunt pinis?',
    'auth.creating': 'Mekim akaunt...',
    'auth.signingIn': 'Sainin nau...',
    'auth.backToHome': 'Go Bek long Haus',
    
    // Hero Section - detailed
    'hero.featuresTitle.budget': 'Mani Plan bilong Mi',
    'hero.featuresDesc.budget': 'Lukautim mani kam na mani go na putim mani gol wantaim isi tool.',
    'hero.featuresTitle.market': 'Maket Lukaut',
    'hero.featuresDesc.market': 'Kampearim prais long komuniti na painim gutpela prais samting.',
    'hero.featuresTitle.rights': 'Save Rait bilong Yu',
    'hero.featuresDesc.rights': 'Lainim prais lo na reportim nogut prais long protektim komuniti.',
    'hero.featuresTitle.learn': 'Skul na Kamap',
    'hero.featuresDesc.learn': 'Kisim skul samting long kamap smart long mani save.',
    'hero.mission.title': 'Wok bilong Mipela',
    'hero.mission.description': 'Mipela bilip se mani strong i stat long save. PNG PriceWatch i helpim yu long bosim mani bilong yu, mekim smart baim samting, na buildim strong mani laif long Papua Niugini.',
    
    // Market Section
    'market.title': 'Maket Lukaut',
    'market.subtitle': 'Kampearim prais na painim gutpela prais long komuniti bilong yu',
    'market.search.placeholder': 'Painim samting (olsem rais, wel, suga...)',
    'market.search.button': 'Painim',
    'market.trend.up': 'antap',
    'market.trend.down': 'daun',
    'market.trend.stable': 'stap gut',
    'market.signIn.title': 'Sainin long Helpim',
    'market.signIn.description': 'Joinim komuniti long putim prais infomesen na helpim ol narapela painim gutpela prais',
    'market.signIn.button': 'Sainin long Putim Prais',
    'market.contribute.title': 'Helpim Komuniti bilong Yu',
    'market.contribute.description': 'Serim prais infomesen long stoa bilong yu long helpim ol narapela painim gutpela prais',
    'market.contribute.button': 'Putim Prais Infomesen',
    'market.alert.title': 'Bikprais Alert',
    'market.alert.description': 'Suga prais i go antap 15% dispela wik. Traim painim narapela stoa o no baim planti.',
    
    // Rights Section
    'rights.title': 'Save Rait bilong Yu',
    'rights.subtitle': 'Lainim lo na protektim yu yet long nogut prais',
    'rights.alert.title': 'Save Rait bilong Yu:',
    'rights.alert.description': 'PNG i gat prais lo long importan samting. Reportim bikprais long helpim protektim komuniti.',
    'rights.regulated.title': 'Gavman Prais Lo',
    'rights.report.title': 'Reportim Bikprais',
    'rights.report.description': 'Lukim stoa i sakim bikprais? Kisim piksa na reportim long gavman.',
    'rights.report.button': 'Kisim Piksa na Reportim',
    'rights.contact.title': 'Kolim Gavman',
    'rights.consumerRights.title': 'Rait bilong Baiman long PNG',
    'rights.fairPricing.title': 'Rait long Gutpela Prais',
    'rights.fairPricing.description': 'Bisnis no ken sakim moa long gavman prais long importan samting olsem petrol, lait, na wara.',
    'rights.information.title': 'Rait long Save',
    'rights.information.description': 'Bisnis mas soim prais klia na no ken haitim narapela pe.',
    'rights.quality.title': 'Rait long Gutpela Samting',
    'rights.quality.description': 'Samting mas matmatim toktok na i mas gutpela long prais yu peim.',
    'rights.complain.title': 'Rait long Komplen',
    'rights.complain.description': 'Yu ken reportim nogut bisnis pasin long gavman na protektim komuniti.',
    'rights.warning.title': 'Lukaut:',
    'rights.warning.description': 'Sapos yu lukim stap bikprais o prais pilai, reportim kwiktaim. Dispela samting i bagarapim mani laif bilong komuniti.',
    
    // Learn Section
    'learn.title': 'Skul na Kamap',
    'learn.subtitle': 'Buildim mani save wantaim skul samting bilong mipela',
    'learn.journey.title': 'Skul Jerni bilong Yu',
    'learn.journey.subtitle': 'Stap buildim mani save bilong yu',
    'learn.journey.complete': 'Pinis',
    'learn.achievements.title': 'Gutpela Samting yu Mekim',
    'learn.challenge.title': 'Dispela Wik Taim',
    'learn.challenge.name': 'Rekotim Olgeta Mani Go',
    'learn.challenge.description': 'Raitim olgeta mani yu spendim long 7 de long save gut wanem samting yu baim.',
    'learn.challenge.progress': 'Kamap: 3/7 de',
    'learn.challenge.daysLeft': '3 de i stap',
    'learn.tip.title': 'De De Mani Tip',
    'learn.tip.label': '💡 Tip bilong De',
    'learn.tip.content': 'Bipo yu baim samting i kostim moa long K50, wet 24 aua long tingting gut sapos yu rili nidim. Dispela rul i ken helpim yu long no baim samting tasol na seipim mani long moa importan samting.',
    'learn.course.start': 'Stat Kos',
    'learn.course.continue': 'Kontinyu',
    'learn.course.review': 'Lukbek',
    'learn.course.progress': 'Kamap',
    
    // Common
    'common.loading': 'Waitim...',
    'common.error': 'Samting rong',
    'common.success': 'Orait!',
    'common.cancel': 'Pinis',
    'common.save': 'Seipim',
    'common.delete': 'Rausim',
    'common.edit': 'Senisim',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'tpi' || saved === 'en') ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}