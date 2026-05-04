import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizes = {
    sm: 'h-16',
    md: 'h-20',
    lg: 'h-24',
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="https://cdn.prod.website-files.com/69ea97152f20066bc07c2195/69f3040dd464f74196109bd2_Glenugie%20Kennelsbcsolid400.png"
        alt="Glenugie Kennels Logo"
        className={sizes[size]}
      />
    </div>
  );
}


