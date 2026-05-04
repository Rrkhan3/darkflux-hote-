'use client';

import { Hotel, MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#2e2e2e] bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Hotel className="h-6 w-6 text-amber-500" />
              <span className="gold-shimmer text-xl font-bold">DARKFLUX</span>
            </div>
            <p className="text-sm text-neutral-500">
              Experience luxury redefined. Where elegance meets comfort in the heart of Kathmandu.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li className="hover:text-amber-500 cursor-pointer transition-colors">Rooms & Suites</li>
              <li className="hover:text-amber-500 cursor-pointer transition-colors">Restaurant & Bar</li>
              <li className="hover:text-amber-500 cursor-pointer transition-colors">Spa & Wellness</li>
              <li className="hover:text-amber-500 cursor-pointer transition-colors">Events & Meetings</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider">Contact</h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-500/70" />
                Thamel, Kathmandu, Nepal
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-amber-500/70" />
                +977-01-4700000
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-amber-500/70" />
                hello@darkflux.com
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider">Follow Us</h3>
            <div className="flex gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e1e1e] text-neutral-400 hover:bg-amber-500/20 hover:text-amber-500 cursor-pointer transition-colors">
                <Instagram className="h-4 w-4" />
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e1e1e] text-neutral-400 hover:bg-amber-500/20 hover:text-amber-500 cursor-pointer transition-colors">
                <Facebook className="h-4 w-4" />
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e1e1e] text-neutral-400 hover:bg-amber-500/20 hover:text-amber-500 cursor-pointer transition-colors">
                <Twitter className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xs text-neutral-600 mt-4">
              Check-in: 2:00 PM | Check-out: 12:00 PM
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-[#2e2e2e] pt-6 text-center">
          <p className="text-xs text-neutral-600">
            © 2025 DARKFLUX HOTEL. All rights reserved. Crafted with luxury in mind.
          </p>
        </div>
      </div>
    </footer>
  );
}
