# Code Organization

This document outlines the organization of the codebase for the signature minting experience.

## Directory Structure

```
src/
├── js/
│   ├── components/       # UI Components
│   │   ├── modal-base.js           # Base modal component
│   │   ├── signature-modal.js      # Unified signature modal component
│   │   └── signature-controls.js   # Controls for signature recording
│   ├── utils/            # Shared utilities
│   │   ├── dom.js        # DOM manipulation utilities
│   │   ├── image.js      # Image manipulation utilities
│   │   └── metadata.js   # Metadata building utilities
│   ├── services/         # API and blockchain services
│   │   ├── blockchain.js # Blockchain interactions
│   │   ├── ipfs.js       # IPFS/Pinata service
│   │   └── storage.js    # Grove storage service
│   ├── coins/            # Blockchain coin-related code
│   │   └── zora-coins.js # ZORA Coins SDK integration
│   └── pages/            # Page-specific code
└── styles/
    ├── components/       # Component-specific styles
    │   ├── buttons.scss  # Button styles
    │   ├── modals.scss   # Modal styles
    │   └── signature.scss # Signature component styles
    └── utils/            # Style utilities
        └── mixins.scss   # SCSS mixins
```

## Key Components

### Modal Components

- **ModalBase**: A base class for all modals with common functionality like showing/hiding, status messages, etc.
- **SignatureModal**: A unified modal component that handles both signature preview and mobile drawing.

### Utility Modules

- **dom.js**: Helper functions for creating UI elements like buttons, containers, and status messages.
- **image.js**: Utilities for image manipulation like converting data URLs to blobs, cropping, and upscaling.
- **metadata.js**: Functions for building metadata for NFTs.

### Service Modules

- **blockchain.js**: Service for blockchain interactions, including minting signatures as NFTs.
- **ipfs.js**: Service for interacting with IPFS via Pinata, including pinning files and JSON metadata.
- **storage.js**: Service for Grove storage interactions, including saving signatures.

## Styling

Styles are organized into component-specific SCSS files and imported into a main SCSS file. This makes it easier to maintain and update styles for specific components.

## Minting Flow

The minting flow is now consistent across both mobile and desktop:

1. User creates a signature (either by drawing on mobile or recording on desktop)
2. User clicks "Mint" in the signature modal
3. The signature is saved to Grove storage (if not already saved)
4. A mint form is displayed where the user can enter details like name, symbol, and payout address
5. The signature image is uploaded to IPFS via Pinata
6. Metadata is created and uploaded to IPFS
7. The signature is minted as an NFT using the ZORA Coins SDK

## Benefits of This Organization

- **Reduced Duplication**: Common functionality is extracted into shared utilities and services.
- **Consistent Experience**: The minting flow is consistent across mobile and desktop.
- **Separation of Concerns**: UI components are separated from business logic and API calls.
- **Maintainability**: Code is organized into logical modules that are easier to maintain and update.
- **Scalability**: New features can be added by extending existing modules or adding new ones.
