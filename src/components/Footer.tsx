import React from 'react';
import { LOGO_URL, SOCIAL_LINKS } from '../config';

const SOCIALS = [
  {
    label: 'Facebook',
    href: SOCIAL_LINKS.facebook,
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9Z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: SOCIAL_LINKS.instagram,
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: SOCIAL_LINKS.tiktok,
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M16.6 3c.3 2.1 1.6 3.6 3.9 3.8v3a7 7 0 0 1-3.9-1.2v6.1a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6 0 .9.1v3.1a2.7 2.7 0 1 0 1.8 2.5V3h3Z" />
      </svg>
    ),
  },
];

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0D0D0D] text-[#F9F7F2] px-6 md:px-12 py-12 border-t border-[#8C6D3E]/20 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-[1280px] mx-auto gap-8">
        <div className="flex items-center gap-4 text-center md:text-left">

          <img
            src={LOGO_URL}
            alt="G Business Immo Logo"
            width={48}
            height={48}
            loading="lazy"
            decoding="async"
            className="h-12 w-12 rounded-full object-cover border border-[#C5A059]/40 shrink-0"
          />
          <div>
            <span className="font-serif text-[20px] font-bold tracking-tight text-[#F9F7F2] block">
              G BUSINESS IMMO
            </span>
            <span className="font-sans text-[11px] text-[#F9F7F2]/60 uppercase tracking-widest block mt-0.5">
              © 2024 G Business Immo — Tous droits réservés.
            </span>
          </div>
        </div>
        <nav className="flex flex-wrap justify-center gap-6 md:gap-8 font-sans text-[11px] font-semibold uppercase tracking-widest">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-[#F9F7F2]/70 hover:text-[#C5A059] transition-colors"
          >
            Mentions Légales
          </a>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-[#F9F7F2]/70 hover:text-[#C5A059] transition-colors"
          >
            Confidentialité
          </a>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-[#F9F7F2]/70 hover:text-[#C5A059] transition-colors"
          >
            Carrières
          </a>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-[#F9F7F2]/70 hover:text-[#C5A059] transition-colors"
          >
            Investisseurs
          </a>
        </nav>
        <div className="flex items-center gap-3">
          {SOCIALS.map(({ label, href, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`G Business Immo sur ${label}`}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-[#C5A059]/40 text-[#F9F7F2]/80 hover:bg-[#C5A059] hover:text-[#0D0D0D] hover:border-[#C5A059] transition-colors"
            >
              {icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};
