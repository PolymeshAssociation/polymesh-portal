import React from 'react';
import { isValidHttpUrl, convertIpfsLink } from '../../helpers/security';

interface SafeLinkProps {
  href: string;
  children?: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  fallbackText?: string;
}

/**
 * SafeLink component that validates URLs before rendering links
 * Prevents XSS attacks through malicious URLs
 * Supports IPFS URIs by converting them to HTTPS using the configured provider
 */
export const SafeLink: React.FC<SafeLinkProps> = ({
  href,
  children,
  className,
  target = '_blank',
  rel = 'noopener noreferrer',
  fallbackText = 'Invalid URL',
}) => {
  // Convert IPFS URIs and validate the URL
  const httpsUrl = convertIpfsLink(href);

  if (!isValidHttpUrl(httpsUrl)) {
    return <span className={className}>{fallbackText}</span>;
  }

  return (
    <a href={httpsUrl} target={target} rel={rel} className={className}>
      {children || href}
    </a>
  );
};
