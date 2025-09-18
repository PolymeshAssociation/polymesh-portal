import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'styled-components';
import Modal from '~/components/Modal';
import { useWindowWidth } from '~/hooks/utility';
import { setCookiebotThemeProperties } from '~/utils/cookiebotTheme';
import { Button, Heading, Text } from '../UiKit';
import { StyledButtonsWrapper, StyledModalContent } from './styles';

/**
 * Check if Cookiebot is enabled from environment variable
 * Handles both boolean and string values, similar to isProviderEnabled pattern
 */
const isCookiebotEnabled = (envVar: string | undefined): boolean => {
  return envVar?.toLowerCase() === 'true';
};

interface ICookieDeclarationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CookieDeclarationModal: React.FC<ICookieDeclarationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const styledTheme = useTheme();
  const { isMobile } = useWindowWidth();
  const [isDeclarationReady, setIsDeclarationReady] = useState(false);

  const modalContentRef = useRef<HTMLDivElement>(null);

  const cookiebotId = import.meta.env.VITE_COOKIEBOT_ID;
  const cookiebotEnabled = isCookiebotEnabled(
    import.meta.env.VITE_COOKIEBOT_ENABLED ?? 'false',
  );

  useEffect(() => {
    // Set theme properties whenever theme changes
    setCookiebotThemeProperties(styledTheme);
  }, [styledTheme]);

  useEffect(() => {
    let observer: MutationObserver | null = null;
    let timeout: NodeJS.Timeout | null = null;

    // Reset when modal closes
    if (!isOpen) {
      // Clean up script when modal closes to ensure fresh data on next open
      const existingScript = document.getElementById('CookieDeclarationScript');
      if (existingScript) {
        existingScript.remove();
      }
      const tempContainer = document.getElementById('CookieDeclarationTemp');
      if (tempContainer) {
        tempContainer.remove();
      }
      setIsDeclarationReady(false);
      return undefined; // No cleanup needed when modal is closed
    }

    // Skip if Cookiebot is disabled or ID is not set
    if (
      !cookiebotEnabled ||
      !cookiebotId ||
      cookiebotId === 'VITE_COOKIEBOT_ID_NOT_SET' ||
      !/^[a-zA-Z0-9-]+$/.test(cookiebotId)
    ) {
      return undefined; // No cleanup needed when Cookiebot is disabled
    }

    // Create temp container and load script there
    const createCookieDeclaration = () => {
      // Clean up any existing elements
      const existingScript = document.getElementById('CookieDeclarationScript');
      if (existingScript) {
        existingScript.remove();
      }
      const existingTemp = document.getElementById('CookieDeclarationTemp');
      if (existingTemp) {
        existingTemp.remove();
      }

      // Create hidden temp container
      const tempContainer = document.createElement('div');
      tempContainer.id = 'CookieDeclarationTemp';
      tempContainer.style.position = 'absolute';
      tempContainer.style.width = '0';
      tempContainer.style.height = '0';
      tempContainer.style.overflow = 'hidden';
      tempContainer.style.visibility = 'hidden';
      tempContainer.style.pointerEvents = 'none';
      document.body.appendChild(tempContainer);

      // Create and append script to temp container
      const script = document.createElement('script');
      script.id = 'CookieDeclarationScript';
      script.src = `https://consent.cookiebot.com/${cookiebotId}/cd.js`;
      script.type = 'text/javascript';
      script.async = true;

      script.onload = () => {
        // Use MutationObserver to watch for content being added to temp container
        observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (
              mutation.type === 'childList' &&
              mutation.addedNodes.length > 0
            ) {
              // Check if actual content (not just script) was added
              const hasContent = Array.from(tempContainer.children).some(
                (child) => child.tagName !== 'SCRIPT',
              );
              if (hasContent) {
                setIsDeclarationReady(true);
                if (observer) {
                  observer.disconnect();
                  observer = null;
                }
                if (timeout) {
                  clearTimeout(timeout);
                  timeout = null;
                }
              }
            }
          });
        });

        // Start observing the temp container for child additions
        observer.observe(tempContainer, {
          childList: true,
          subtree: true,
        });

        // Fallback timeout in case content never loads
        timeout = setTimeout(() => {
          setIsDeclarationReady(true); // Show modal even if content didn't load properly
          if (observer) {
            observer.disconnect();
            observer = null;
          }
          timeout = null;
        }, 5000); // 5 second timeout
      };

      tempContainer.appendChild(script);
    };

    createCookieDeclaration();

    // Cleanup function
    return (): void => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
    };
  }, [isOpen, cookiebotEnabled, cookiebotId]);

  // Move content from temp to modal when ready
  useEffect(() => {
    if (isDeclarationReady && modalContentRef.current) {
      const tempContainer = document.getElementById('CookieDeclarationTemp');
      if (tempContainer) {
        Array.from(tempContainer.children).forEach((child) => {
          if (child.tagName !== 'SCRIPT') {
            modalContentRef.current?.appendChild(child);
          }
        });
        tempContainer.remove();
      }
    }
  }, [isDeclarationReady]);

  if (!isOpen || !isDeclarationReady) return null;

  // Show message if Cookiebot is disabled
  if (
    !cookiebotEnabled ||
    !cookiebotId ||
    cookiebotId === 'VITE_COOKIEBOT_ID_NOT_SET' ||
    !/^[a-zA-Z0-9-]+$/.test(cookiebotId)
  ) {
    return (
      <Modal handleClose={onClose} customWidth="600px">
        <StyledModalContent>
          <Heading type="h2" marginBottom={12}>
            Cookie Declaration
          </Heading>
          <Text>
            Cookie declaration is currently disabled or not configured.
          </Text>
        </StyledModalContent>
        {!isMobile && (
          <StyledButtonsWrapper>
            <Button variant="modalSecondary" marginTop={40} onClick={onClose}>
              Close
            </Button>
          </StyledButtonsWrapper>
        )}
      </Modal>
    );
  }

  return (
    <Modal
      handleClose={onClose}
      customWidth="fit-content"
      disableOverflow
      flexLayout
    >
      <Heading type="h2" marginBottom={12}>
        Cookie Declaration
      </Heading>
      <StyledModalContent>
        <div ref={modalContentRef} />
      </StyledModalContent>
      {!isMobile && (
        <StyledButtonsWrapper>
          <Button variant="modalSecondary" marginTop={40} onClick={onClose}>
            Close
          </Button>
        </StyledButtonsWrapper>
      )}
    </Modal>
  );
};

export default CookieDeclarationModal;
