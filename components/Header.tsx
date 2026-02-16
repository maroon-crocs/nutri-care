import React, { useState, useEffect } from 'react';
import { Menu, X, Leaf } from 'lucide-react';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Services', href: '#services' },
    { name: 'BMI Calculator', href: '#bmi' },
    { name: 'Healthy Games', href: '#healthy-games' },
    { name: 'AI Assistant', href: '#ai-assistant' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <div className="bg-leaf-600 p-2 rounded-full text-white group-hover:bg-leaf-700 transition-colors">
            <Leaf size={24} />
          </div>
          <span className={`font-serif text-2xl font-bold tracking-tight ${isScrolled ? 'text-slate-800' : 'text-slate-800 lg:text-slate-900'}`}>
            NutriGuide
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className={`text-sm font-medium hover:text-leaf-600 transition-colors ${
                isScrolled ? 'text-slate-600' : 'text-slate-700'
              }`}
            >
              {link.name}
            </a>
          ))}
          <a 
            href="#contact"
            className="bg-leaf-600 hover:bg-leaf-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-lg shadow-leaf-200"
          >
            Get Started
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-slate-700 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-slate-100 p-6 flex flex-col gap-4 animate-in slide-in-from-top-5">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className="text-slate-700 font-medium py-2 border-b border-slate-50 hover:text-leaf-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <a 
            href="#contact"
            className="bg-leaf-600 text-white text-center py-3 rounded-xl font-medium mt-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Get Started
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;
