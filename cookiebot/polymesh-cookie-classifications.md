# Cookie Classifications for Polymesh Portal

This document provides a comprehensive overview of all cookies and local storage items used by the Polymesh Portal application, categorized according to their purpose and functionality.

## Cookie Classification Table

| Cookie Name | Category | Provider | Domain | Classification Source | Purpose |
|------------|----------|-----------|---------|---------------------|---------|
| **CookieConsent** | Necessary | portal.polymesh.dev | portal.polymesh.dev | Automatic | Cookie consent management |
| **__cf_bm** | Necessary | polymesh.zendesk.com | portal.polymesh.dev | Automatic | Cloudflare bot management |
| **_cfuvid** | Necessary | polymesh.zendesk.com | portal.polymesh.dev | Automatic | Cloudflare visitor identification |
| **ZD-suid** | Statistics | static.zdassets.com | portal.polymesh.dev | Automatic | Zendesk analytics |
| **ZD-store** | Preferences | static.zdassets.com | portal.polymesh.dev | Automatic | Zendesk preferences |
| **rememberSelectedAccount** | Necessary | portal.polymesh.dev | portal.polymesh.dev | Manual | Stores user preference to remember selected account for future sessions |
| **defaultExtension** | Necessary | portal.polymesh.dev | portal.polymesh.dev | Manual | Stores user's preferred wallet extension for automatic connections |
| **defaultAccount** | Necessary | portal.polymesh.dev | portal.polymesh.dev | Manual | Stores user's default account address for authentication |
| **blockedWallets** | Necessary | portal.polymesh.dev | portal.polymesh.dev | Manual | Security feature - stores array of wallet addresses blocked by user |
| **showAuth** | Necessary | portal.polymesh.dev | portal.polymesh.dev | Manual | Controls authentication modal visibility - essential for UX flow |
| **rpcUrl** | Necessary | portal.polymesh.dev | portal.polymesh.dev | Manual | RPC endpoint URL for blockchain connectivity - required for app functionality |
| **middlewareUrl** | Necessary | portal.polymesh.dev | portal.polymesh.dev | Manual | Middleware service endpoint URL - essential for API communication |
| **middlewareKey** | Necessary | portal.polymesh.dev | portal.polymesh.dev | Manual | API key for middleware service authentication - required for secure API access |
| **chainMetadata** | Necessary | portal.polymesh.dev | portal.polymesh.dev | Manual | Cached blockchain metadata for performance optimization - essential for app functionality |
| **storageVersion** | Necessary | portal.polymesh.dev | portal.polymesh.dev | Manual | Version tracking for localStorage migrations - critical for app compatibility |
| **theme** | Necessary | portal.polymesh.dev | portal.polymesh.dev | Automatic | Stores user's theme preference (light/dark mode) |
| **useSystemTheme** | Preferences | portal.polymesh.dev | portal.polymesh.dev | Manual | Boolean flag for using system theme preference |
| **showWelcomePopup** | Necessary | portal.polymesh.dev | portal.polymesh.dev | Manual | Controls whether welcome popup is shown to new users - essential for new user onboarding and wallet connection flow |
| **ipfsProviderUrl** | Necessary | portal.polymesh.dev | portal.polymesh.dev | Manual | IPFS provider URL for converting IPFS URIs to HTTP/HTTPS - required for NFT metadata and content display |

## Category Definitions

### Necessary
Scripts that are needed to guarantee website functionality. A tracker is deemed necessary if blocking the tracker would render the website inoperable, or unable to provide the service it is intended to provide. For example, a cookie enabling shopping basket functionality on an e-commerce website.

### Preferences
Setting user choices to navigate the website. Scripts that remember user preferences like whether a user has seen a popup or chosen a color scheme. These are not strictly needed for the website to work, but can make the flow easier for a user.

### Statistics
Used for analytical purposes. For example, Google Analytics cookies that help understand how visitors interact with websites by collecting and reporting information anonymously.

### Marketing
Used for targeting the user with personalized advertisements. For example, the Facebook pixel can be used to show specific ads to certain users based on their browsing behavior across websites.

### Unclassified
Cookies that have not been given a purpose description yet, making it impossible for website visitors to provide informed consent. These require manual classification and cannot be automatically blocked by Cookiebot until categorized.

## Source Code References

All manually classified cookies are implemented using the `useLocalStorage` hook located at:
- `src/hooks/utility/useLocalStorage.tsx`

Key implementation files:
- **Account Management**: `src/context/AccountContext/provider.tsx`
- **Wallet & Network Config**: `src/context/PolymeshContext/provider.tsx` 
- **Theme Preferences**: `src/context/ThemeContext/provider.tsx`
- **Authentication Flow**: `src/context/AuthContext/provider.tsx`
- **Welcome Experience**: `src/components/UserAuth/components/PopupWelcome/index.tsx`
- **Storage Migrations**: `src/helpers/localStorageMigrations.ts`

## Classification Changes

**2025-01-18**: Reclassified `showWelcomePopup` from Preferences to Necessary - this cookie is essential for new user onboarding flow and wallet connection process. Without it, new users experience popup fatigue on every visit, significantly impacting the ability to complete essential wallet setup.

## Last Updated
Generated on: 2025-01-18
Updated on: 2025-01-18

---