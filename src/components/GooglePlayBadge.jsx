import React from 'react';
import './GooglePlayBadge.css';

const DEFAULT_PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.joinamana.app&pcampaignid=web_share';

const GooglePlayBadge = ({ 
  href = DEFAULT_PLAY_STORE_URL, 
  variant = 'dark', // 'dark' | 'light' | 'primary'
  size = 'md',      // 'sm' | 'md' | 'lg'
  className = '',
  showRating = false,
}) => {
  return (
    <a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`google-play-badge google-play-badge-${variant} google-play-badge-${size} ${className}`}
      title="Get Amana on Google Play Store"
    >
      {/* Authentic Multi-Color Google Play Icon */}
      <svg 
        className="google-play-svg-icon" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path 
          d="M3.609 1.814C3.393 2.053 3.25 2.457 3.25 2.996V21.004C3.25 21.543 3.393 21.947 3.609 22.186L3.682 22.253L13.738 12.197V11.803L3.682 1.747L3.609 1.814Z" 
          fill="url(#gp_grad_blue)"
        />
        <path 
          d="M17.09 15.549L13.738 12.197V11.803L17.09 8.451L17.172 8.498L21.144 10.756C22.278 11.4 22.278 12.454 21.144 13.098L17.172 15.356L17.09 15.549Z" 
          fill="url(#gp_grad_yellow)"
        />
        <path 
          d="M17.172 15.356L13.738 11.922L3.609 22.051C4.015 22.482 4.693 22.537 5.467 22.098L17.172 15.356Z" 
          fill="url(#gp_grad_red)"
        />
        <path 
          d="M17.172 8.498L5.467 1.756C4.693 1.317 4.015 1.372 3.609 1.803L13.738 11.932L17.172 8.498Z" 
          fill="url(#gp_grad_green)"
        />
        <defs>
          <linearGradient id="gp_grad_blue" x1="12.83" y1="2.66" x2="-2.01" y2="17.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00A0FF"/>
            <stop offset="0.007" stopColor="#00A1FF"/>
            <stop offset="0.26" stopColor="#00BEFF"/>
            <stop offset="0.512" stopColor="#00D2FF"/>
            <stop offset="0.76" stopColor="#00DFFF"/>
            <stop offset="1" stopColor="#00E3FF"/>
          </linearGradient>
          <linearGradient id="gp_grad_yellow" x1="22.55" y1="12" x2="3.15" y2="12" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFE000"/>
            <stop offset="0.409" stopColor="#FFBD00"/>
            <stop offset="0.775" stopColor="#FFA500"/>
            <stop offset="1" stopColor="#FF9C00"/>
          </linearGradient>
          <linearGradient id="gp_grad_red" x1="15.82" y1="13.28" x2="1.31" y2="27.79" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF3A44"/>
            <stop offset="1" stopColor="#C31162"/>
          </linearGradient>
          <linearGradient id="gp_grad_green" x1="2.72" y1="-1.67" x2="9.86" y2="5.47" gradientUnits="userSpaceOnUse">
            <stop stopColor="#32A071"/>
            <stop offset="0.069" stopColor="#2DA771"/>
            <stop offset="0.476" stopColor="#15CF74"/>
            <stop offset="0.801" stopColor="#06E775"/>
            <stop offset="1" stopColor="#00F076"/>
          </linearGradient>
        </defs>
      </svg>

      {/* Official Typography */}
      <div className="google-play-copy">
        <span className="google-play-subtext">GET IT ON</span>
        <span className="google-play-maintext">Google Play</span>
      </div>

      {showRating && (
        <span className="google-play-tag">Android</span>
      )}
    </a>
  );
};

export default GooglePlayBadge;
