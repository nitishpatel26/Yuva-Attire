import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/logo.jpeg';

export default function Logo({ size = 'md', className = '' }) {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  // Crisp dimensions so the boy/girl characters and "Yuva Attire" lettering are clearly readable
  const heightClass = isSmall 
    ? 'h-10 sm:h-12 max-w-[140px]' 
    : isLarge 
    ? 'h-24 sm:h-28 max-w-[280px]' 
    : 'h-14 sm:h-16 md:h-18 max-w-[200px] sm:max-w-[240px]';

  return (
    <Link 
      to="/" 
      className={`inline-flex items-center group decoration-transparent shrink-0 transition-transform duration-300 hover:scale-[1.02] ${className}`}
      title="Yuva Attire - Style begins young "
    >
      <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100/90 flex items-center justify-center">
        <img
          src={logoImg || '/logo.jpeg'}
          alt="Yuva Attire - Style begins young"
          className={`${heightClass} w-auto object-contain rounded-xl`}
          loading="eager"
        />
      </div>
    </Link>
  );
}
