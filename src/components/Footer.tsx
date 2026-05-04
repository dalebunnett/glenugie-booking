import Logo from './Logo';
import { baseUrl } from '../lib/base-url';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Branding */}
          <div>
            <div className="mb-4">
              <Logo size="lg" />
            </div>
            <div className="flex gap-4">
              {/* Social media icons */}
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={baseUrl || '/'} className="text-muted-foreground hover:text-primary">
                  Home
                </a>
              </li>
              <li>
                <a href={`${baseUrl}/about`} className="text-muted-foreground hover:text-primary">
                  About Us
                </a>
              </li>
              <li>
                <a href={`${baseUrl}/accommodations`} className="text-muted-foreground hover:text-primary">
                  Kennels and Suites
                </a>
              </li>
              <li>
                <a href={`${baseUrl}/booking`} className="text-muted-foreground hover:text-primary">
                  Book Now
                </a>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="font-bold text-lg mb-4">Information</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={`${baseUrl}/terms`} className="text-muted-foreground hover:text-primary">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href={`${baseUrl}/my-bookings`} className="text-muted-foreground hover:text-primary">
                  My Bookings
                </a>
              </li>
              <li>
                <a href={`${baseUrl}/contact`} className="text-muted-foreground hover:text-primary">
                  Contact Us
                </a>
              </li>
              <li>
                <a href={`${baseUrl}/admin`} className="text-muted-foreground hover:text-primary">
                  Admin Login
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="tel:+447359427817" className="hover:text-primary">
                  07359 427817
                </a>
              </li>
              <li>
                <a href="mailto:info@glenugiekennels.co.uk" className="hover:text-primary">
                  info@glenugiekennels.co.uk
                </a>
              </li>
              <li className="pt-2">
                <p className="font-medium text-foreground mb-1">Address</p>
                <p>Glenugie Boarding Kennels</p>
                <p>Mains of Springhill</p>
                <p>Boddam</p>
                <p>Aberdeenshire</p>
                <p>AB42 3BH</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Hours Section - Full Width */}
        <div className="border-t mt-8 pt-8">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="font-bold text-lg mb-2">Opening Hours</p>
              <p className="text-muted-foreground">Daily: 10AM - 5PM</p>
            </div>
            <div>
              <p className="font-bold text-lg mb-2">Drop Off Times</p>
              <p className="text-muted-foreground">2PM - 5PM Daily</p>
            </div>
            <div>
              <p className="font-bold text-lg mb-2">Pick Up Times</p>
              <p className="text-muted-foreground">10AM - 12PM</p>
              <p className="text-xs text-muted-foreground mt-1">After 12PM additional charges apply</p>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Glenugie Kennels. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}












