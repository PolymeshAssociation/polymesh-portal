/**
 * Hash a file using SHA-256 and return hex string with 0x prefix
 * @param file - The file to hash
 * @returns Promise that resolves to hex-encoded hash with 0x prefix
 */
export const hashFile = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `0x${hashHex}`;
};

/**
 * Verify a file against a known hash
 * @param file - The file to verify
 * @param expectedHash - The expected hash value (with or without 0x prefix)
 * @returns Promise that resolves to true if hashes match
 */
export const verifyFileHash = async (
  file: File,
  expectedHash: string,
): Promise<boolean> => {
  const actualHash = await hashFile(file);
  const normalizedExpected = expectedHash.startsWith('0x')
    ? expectedHash
    : `0x${expectedHash}`;
  return actualHash.toLowerCase() === normalizedExpected.toLowerCase();
};
