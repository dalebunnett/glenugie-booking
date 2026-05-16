import { useState } from 'react';
import { Button } from './ui/button';
import Logo from './Logo';
import { baseUrl } from '../lib/base-url';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: `${baseUrl}/`, label: 'Home' },
    { href: `${baseUrl}/about-us`, label: 'About' },
    { href: `${baseUrl}/accommodations`, label: 'Kennels and Suites' },
    { href: `${baseUrl}/booking`, label: 'Book Now' },
    { href: `${baseUrl}/contact`, label: 'Contact' }
  ];

  return (
    <nav className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-2">
          {/* Logo */}
          <a href={baseUrl || '/'} className="group py-3.5 px-4">
            <Logo className="group-hover:scale-105 transition-transform" />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            ))}
            <a href={`${baseUrl}/my-bookings`}>
              <Button variant="default" size="sm">
                My Bookings
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-3 border-t">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block py-2 text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            ))}
            <a href={`${baseUrl}/my-bookings`} className="block py-2">
              <Button variant="default" size="sm" className="w-full">
                My Bookings
              </Button>
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}







