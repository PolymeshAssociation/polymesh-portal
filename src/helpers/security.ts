/**
 * Security utilities for XSS prevention and input validation
 */

import { IPFS_PROVIDER_URL } from '~/context/PolymeshContext/constants';

/**
 * Converts IPFS URIs to usable URLs using the configured IPFS provider
 * @param uri - The URI to convert (may be IPFS or already HTTP/HTTPS)
 * @returns Converted URL
 */
export const convertIpfsLink = (uri: string): string => {
  if (!uri || typeof uri !== 'string') {
    return '';
  }

  const trimmedUri = uri.trim();

  // If it's already an HTTP/HTTPS URL, return as-is
  if (trimmedUri.startsWith('http://') || trimmedUri.startsWith('https://')) {
    return trimmedUri;
  }

  // Convert IPFS URIs to HTTPS using the configured provider
  if (trimmedUri.startsWith('ipfs://')) {
    const rawIpfsUrl: string =
      JSON.parse(localStorage.getItem('ipfsProviderUrl') || 'null') ||
      IPFS_PROVIDER_URL;
    const ipfsUrl =
      rawIpfsUrl.charAt(rawIpfsUrl.length - 1) === '/'
        ? rawIpfsUrl
        : `${rawIpfsUrl}/`;

    return trimmedUri.replace('ipfs://', ipfsUrl);
  }

  // For other URIs, try to make them HTTPS
  return trimmedUri.startsWith('//')
    ? `https:${trimmedUri}`
    : `https://${trimmedUri}`;
};

/**
 * Validates if a URL is a valid and safe HTTP/HTTPS URL
 * @param url - The URL to validate (can be IPFS URI which will be converted)
 * @returns true if the URL is valid and safe, false otherwise
 */
export const isValidHttpUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Convert IPFS URIs to usable URLs first
  const httpsUrl = convertIpfsLink(url);

  if (!httpsUrl) {
    return false;
  }

  try {
    const urlObject = new URL(httpsUrl);

    // Only allow HTTP and HTTPS protocols
    if (!['http:', 'https:'].includes(urlObject.protocol)) {
      return false;
    }

    // Check for dangerous patterns in the URL
    const dangerousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /file:/i,
      /ftp:/i,
      /blob:/i,
    ];

    if (dangerousPatterns.some((pattern) => pattern.test(httpsUrl))) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};
