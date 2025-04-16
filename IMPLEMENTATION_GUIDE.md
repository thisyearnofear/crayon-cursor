# Implementation Guide

This guide explains how to implement the code reorganization for the signature minting experience.

## Step 1: Add New Utility and Service Modules

First, add the new utility and service modules:

1. **Create utility modules**:
   - `src/js/utils/image.js`: Image manipulation utilities
   - `src/js/utils/dom.js`: DOM manipulation utilities
   - Update `src/js/utils/metadata.js`: Update to match Zora Coins standard

2. **Create service modules**:
   - `src/js/services/ipfs.js`: IPFS/Pinata service
   - `src/js/services/blockchain.js`: Blockchain interactions
   - `src/js/services/storage.js`: Grove storage service

## Step 2: Add New Components

Next, add the new modal components:

1. **Create base components**:
   - `src/js/components/modal-base.js`: Base modal component
   - `src/js/components/signature-modal.js`: Unified signature modal

2. **Create style files**:
   - `src/styles/components/buttons.scss`: Button styles
   - `src/styles/components/modals.scss`: Modal styles
   - `src/styles/components/signature.scss`: Signature component styles
   - `src/styles/main.scss`: Main style file

## Step 3: Update Existing Components

Now, update the existing components to use the new modules:

1. **Update signature controls**:
   - Replace `src/js/components/signature-controls.js` with `src/js/components/signature-controls-new.js`

2. **Remove deprecated components**:
   - `src/js/components/signature-preview-modal.js`
   - `src/js/components/mobile-signature-modal.js`
   - `src/js/components/ui-helpers.js`
   - `src/js/components/mint-signature.js`

## Step 4: Update Imports

Update imports in your main JavaScript files:

1. **Update `src/js/pages/index.js`**:
   ```javascript
   import { SignatureControls } from '../components/signature-controls-new.js';
   import '../styles/main.scss';
   ```

## Step 5: Test the Implementation

Test the implementation to ensure everything works correctly:

1. **Test desktop flow**:
   - Start recording a signature
   - Stop recording
   - Click "Sign" to open the signature modal
   - Test both "Save" and "Mint" functionality

2. **Test mobile flow**:
   - Click "Sign on Mobile" to open the mobile signature modal
   - Draw a signature
   - Test both "Save" and "Mint" functionality

## Minting Flow

The minting flow is now consistent across both mobile and desktop:

1. User creates a signature (either by drawing on mobile or recording on desktop)
2. User clicks "Mint" in the signature modal
3. A mint form is displayed where the user can enter details like name, symbol, and payout address
4. The signature image is uploaded to IPFS via Pinata
5. Metadata is created and uploaded to IPFS
6. The signature is minted as an NFT using the ZORA Coins SDK

## Notes on Zora Coins Integration

The minting process follows the Zora Coins EIP-7572 standard:

1. The image is uploaded to IPFS via Pinata
2. Metadata JSON is created with the following format:
   ```json
   {
     "name": "Signature Opal",
     "description": "A unique signature minted as an NFT.",
     "image": "ipfs://bafkreifch6stfh3fn3nqv5tpxnknjpo7zulqav55f2b5pryadx6hldldwe",
     "properties": {
       "category": "signature",
       "type": "image"
     }
   }
   ```
3. The metadata is uploaded to IPFS via Pinata
4. The IPFS URI is used to mint the NFT using the Zora Coins SDK

## Environment Variables

Make sure the following environment variables are set:

- `PINATA_JWT`: JWT for Pinata API
- `VENICE_API_KEY`: API key for Venice upscaling (optional)
