import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe } from "lucide-react";
import { useLang, useT } from "@/lib/i18n";
import logoIcon from "@assets/Icon_png_2-removebg-preview_1754497111079.png";
import logoText from "@assets/headline_1754497111077.png";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, setLang } = useLang();
  const t = useT();

  const navigation = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.initiatives'), href: '/initiatives' },
    { name: t('nav.news'), href: '/news' },
    { name: t('nav.diaspora'), href: '/overseas-korean' },
    { name: t('nav.contact'), href: '/contact' },
  ];

  const LangToggle = (
    <div className="flex items-center gap-1.5 text-sm">
      <Globe className="w-4 h-4 text-gray-400" />
      <button
        onClick={() => setLang("ko")}
        className={`font-medium transition-colors ${lang === "ko" ? "text-cordia-teal font-bold" : "text-gray-400 hover:text-gray-600"}`}
        data-testid="lang-ko"
      >
        KOR
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => setLang("en")}
        className={`font-medium transition-colors ${lang === "en" ? "text-cordia-teal font-bold" : "text-gray-400 hover:text-gray-600"}`}
        data-testid="lang-en"
      >
        ENG
      </button>
    </div>
  );

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer" data-testid="logo">
                <img 
                  src={logoIcon} 
                  alt="CordiaEC Icon" 
                  className="h-10 w-auto"
                />
                <img 
                  src={logoText} 
                  alt="CordiaEC" 
                  className="h-8 w-auto hidden sm:block"
                />
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span className={`font-medium transition-colors duration-200 cursor-pointer ${
                    isActive(item.href)
                      ? 'text-cordia-dark'
                      : 'text-gray-600 hover:text-cordia-teal'
                  }`} data-testid={`nav-${item.href}`}>
                    {item.name}
                  </span>
                </Link>
              ))}
              {LangToggle}
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </nav>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 py-4 space-y-4">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span
                    className={`block font-medium cursor-pointer ${
                      isActive(item.href)
                        ? 'text-cordia-dark'
                        : 'text-gray-600 hover:text-cordia-teal'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`mobile-nav-${item.href}`}
                  >
                    {item.name}
                  </span>
                </Link>
              ))}
              <div className="pt-2 border-t border-gray-100">{LangToggle}</div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-cordia-dark text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src={logoIcon} 
                  alt="CordiaEC Icon" 
                  className="h-8 w-auto"
                />
                <img 
                  src={logoText} 
                  alt="CordiaEC" 
                  className="h-6 w-auto"
                />
              </div>
              <p className="text-gray-400 mb-4">
                {t('footer.tagline')}
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">{t('footer.quickLinks')}</h3>
              <ul className="space-y-2">
                {navigation.slice(1).map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <span className="text-gray-400 hover:text-cordia-teal transition-colors cursor-pointer">
                        {item.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Contact Info */}
            <div>
              <h3 className="font-semibold mb-4">{t('footer.contactInfo')}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>k-academy@inha.ac.kr</li>
                <li>Incheon, South Korea</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 mb-4 md:mb-0">
              <p>©2025 CordiaEC. All rights reserved. Email: k-academy@inha.ac.kr</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-cordia-teal transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-cordia-teal transition-colors text-sm">
                Terms of Service
              </a>
              <Link href="/admin">
                <span className="text-gray-400 hover:text-cordia-teal transition-colors text-sm cursor-pointer" data-testid="link-admin">
                  Admin
                </span>
              </Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
