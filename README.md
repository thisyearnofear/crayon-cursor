# Signature Opal

An interactive web application that lets users create unique digital signatures using a stop-motion crayon effect. Built on top of the p5 Brush implementation by [Jorge Toloza](http://jorgetoloza.co), with advanced blockchain integration for minting signatures as NFTs through the ZORA protocol by Papa.

## Overview

Signature Opal combines creative digital artistry with blockchain technology, enabling users to:

- Create beautiful, organic signatures with a stop-motion crayon effect
- Capture their unique drawing style as digital collectibles
- Mint signatures as NFTs through various blockchain options
- Trade and collect signature tokens using the ZORA protocol

## Core Features

### Drawing Experience

- Interactive canvas with stop-motion crayon effect
- Real-time drawing with natural mouse/touch interactions
- WebGL-powered p5.js brush system for smooth rendering
- Organic, hand-drawn animation style
- Timed drawing sessions for signature creation
- Responsive design for both desktop and mobile experiences

### Blockchain Integration

- Multiple minting options:
  - ERC-721: One-of-one unique signature NFTs
  - ERC-1155: Multiple editions of the same signature
  - ZORA Protocol Coins: Create a token around your signature
- Drawing data capture and on-chain storage
- Preview and confirmation system before minting
- Wallet connection functionality for major providers
- Transaction status tracking and confirmation

### Technical Stack

- Frontend: Vanilla JavaScript with modern ES6+ features
- Drawing: p5.js with WebGL for high-performance rendering
- Storage: IPFS via Pinata for decentralized asset storage
- Blockchain: ZORA Protocol SDK for NFT creation and trading
- Building: Webpack/npm-based development workflow

## Installation & Development

### Prerequisites

- Node.js (v14+)
- NPM or Yarn
- Modern web browser with JavaScript enabled

### Setup

1. Clone the repository:

```
git clone https://github.com/thisyearnofear/signature-opal.git
cd signature-opal
```

2. Install dependencies:

```
npm install
```

3. Set up environment variables (create a `.env` file):

```
# Pinata API JWT for IPFS storage (server-side only)
PINATA_JWT=your_pinata_jwt_here

```

### Development

Run the development server:

```
npm run dev
```

For both frontend and backend together:

```
npm run dev:all
```

### Building for Production

Create an optimized build:

```
npm run build
```

## ZORA Coins SDK Integration Plan

The blockchain integration follows a carefully planned, modular approach to ensure the drawing experience remains fluid while providing robust NFT minting capabilities.

### Coming Soon: Trading, Aggregation & Platform Dashboard

- **Trading:** Integrate ZORA Coins SDK trading functions for buying/selling coins
- **Aggregation:** Track platform-created coins with platformReferrer address (0x55A5705453Ee82c742274154136Fce8149597058)
- **Dashboard:** Build admin dashboard for coin management and analytics

## Code Architecture

The codebase is organized into a modular architecture designed for maintainability and separation of concerns:

### Directory Structure

```
src/
├── js/
│   ├── components/       # UI Components
│   │   ├── modal-base.js           # Base modal component
│   │   ├── signature-modal.js      # Unified signature modal
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
│       └── index.js      # Main entry point
├── styles/
│   ├── components/       # Component-specific styles
│   │   ├── buttons.scss  # Button styles
│   │   ├── modals.scss   # Modal styles
│   │   └── signature.scss # Signature component styles
│   ├── utils/            # Style utilities
│   │   └── mixins.scss   # SCSS mixins
│   └── main.scss         # Main style file
└── server/
    └── proxy.js          # Backend proxy for secure API calls
```

### Key Components

#### Modal Components

- **ModalBase**: Base class with common modal functionality
- **SignatureModal**: Unified component handling both preview and mobile drawing

#### Utility Modules

- **dom.js**: Helper functions for UI elements
- **image.js**: Image processing utilities
- **metadata.js**: NFT metadata creation following Zora Coins standard

#### Service Modules

- **blockchain.js**: Blockchain interaction service
- **ipfs.js**: IPFS/Pinata integration
- **storage.js**: Local storage service

## Minting Flow

The minting process follows a consistent workflow across devices:

1. **Create Signature**: User draws (mobile) or records (desktop) their signature
2. **Review**: User reviews signature in the modal
3. **Mint**: User clicks "Mint" button in the modal
4. **Configure**: User enters details (name, symbol, payout address)
5. **Upload**: Signature image uploaded to IPFS via Pinata
6. **Metadata**: JSON metadata created following EIP-7572 standard:
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
7. **Blockchain**: NFT minted using ZORA Coins SDK
8. **Confirmation**: User receives confirmation and link to view NFT

## Backend Security

A secure approach for handling sensitive API calls:

1. **Express Proxy**: Backend server mediates API calls to Pinata
2. **Secret Management**: API keys and tokens secured server-side
3. **File Upload Handling**: Proper multipart form handling for uploads
4. **Error Management**: Robust error handling and user feedback

## RPC Configuration

Reliable blockchain connectivity with:

1. Alchemy RPC URLs for Base network
2. Fallback mechanisms for wallet providers
3. Error handling for network issues
4. Performance optimization for mobile devices

## Deployment

This project is designed for a split deployment architecture:

- Frontend deployed on Vercel
- Backend deployed on Northflank

### Frontend Deployment to Vercel

1. **Fork or clone the repository to your GitHub account**

2. **Create a new project on Vercel**

   - Connect your GitHub repository
   - Vercel will automatically detect the configuration

3. **Configure environment variables**

   - Add `VITE_API_URL` pointing to your Northflank backend URL
   - For example: `VITE_API_URL=https://p01--signature--sqrfq849w2vt.code.run`
   - Make sure to include the `https://` prefix

4. **Deploy**
   - Vercel will build and deploy the frontend
   - The frontend will be available at your Vercel URL

### Backend Deployment to Northflank

1. **Create a Northflank account**

   - Sign up at [Northflank](https://northflank.com)
   - Create a new project

2. **Create a combined service**

   - Select your GitHub repository
   - Choose the main branch
   - Select Dockerfile as the build option
   - Ensure port 3000 is exposed

3. **Configure environment variables**

   - Add `PINATA_JWT` with your Pinata JWT token
   - Add `NODE_ENV=production`
   - Add `FRONTEND_URL` pointing to your Vercel frontend URL

4. **Deploy**
   - Northflank will build and deploy your backend
   - The backend API will be available at your Northflank URL (e.g., https://p01--signature--sqrfq849w2vt.code.run)
   - Make note of this URL as you'll need it for the frontend configuration

### Configuration Files

- **Dockerfile**: Configures the Node.js environment for Northflank
- **vercel.json**: Configures the frontend deployment on Vercel
- **.env.example**: Shows all required environment variables

## Troubleshooting

Common issues and solutions:

1. **Wallet Connection Issues**

   - Make sure you have a compatible wallet extension installed
   - Try refreshing the page or reconnecting the wallet
   - Check if your wallet is properly connected to the Base network

2. **Drawing Performance**

   - On older devices, try reducing the canvas size
   - Close other browser tabs to free up resources

3. **Minting Errors**
   - Check your wallet has enough ETH for gas fees
   - Verify you're connected to the correct network (Base)
   - If you see error code `0x4ab38e08`, this is a contract deployment error (see Known Issues section)

## Known Issues

### Contract Deployment Error (0x4ab38e08)

We're currently experiencing an issue with the Zora Coins contract deployment that returns error code `0x4ab38e08`. This appears to be related to the contract interaction rather than our implementation.

**Details:**

- Error occurs during the `createCoin` function call in the Zora Coins SDK
- The error persists regardless of the name or symbol used
- All metadata validation passes successfully
- The wallet is properly connected to the Base network

**Error Message:**

```
ContractFunctionExecutionError: The contract function "deploy" reverted with the following signature:
0x4ab38e08

Unable to decode signature "0x4ab38e08" as it was not found on the provided ABI.
Make sure you are using the correct ABI and that the error exists on it.
You can look up the decoded signature here: https://openchain.xyz/signatures?query=0x4ab38e08.

Contract Call:
  address:   0x777777751622c0d3258f214F9DF38E35BF45baF3
  function:  deploy(address payoutRecipient, address[] owners, string uri, string name, string symbol, address platformReferrer, address currency, int24 tickLower, uint256 orderSize)
  args:      (0x55A5705453Ee82c742274154136Fce8149597058, ["0x55A5705453Ee82c742274154136Fce8149597058"], ipfs://QmVk21LHoHKd6XhY9rjxW9opvq7M1Ft4rQN8U5YphT5r2X, Signature Papa, SIG, 0x55A5705453Ee82c742274154136Fce8149597058, 0x4200000000000000000000000000000000000006, -199200, 0)
  sender:    0x55A5705453Ee82c742274154136Fce8149597058
```

**Possible causes:**

- The contract may have specific requirements not documented in the SDK
- There might be an issue with the contract parameters we're providing
- The contract might have been updated since the SDK version we're using
- The error code 0x4ab38e08 might indicate a specific validation failure in the contract

**Workarounds attempted:**

- Generated unique symbols to avoid collisions
- Added additional validation for all parameters
- Ensured proper network connection to Base
- Verified metadata follows the EIP-7572 standard
- Tried different parameter combinations

**SDK Version:**

- @zoralabs/coins-sdk: 0.0.8

If you're from the Zora team and can help diagnose this issue, please check the contract interaction in `src/js/coins/zora-coins.js` and the error handling in the same file.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
