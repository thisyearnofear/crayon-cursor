# Signature

An interactive web application that lets users create unique digital signatures using a stop-motion crayon effect. Built on top of the p5 Brush implementation by [Jorge Toloza](http://jorgetoloza.co), with added blockchain integration for minting signatures as NFTs.

## Current Features

- Interactive canvas with stop-motion crayon effect
- Real-time drawing with mouse interactions
- WebGL-powered p5.js brush system
- Organic, hand-drawn animation style

![Image Title](cover.jpg)

[Tutorial on Codrops](https://tympanus.net/codrops/?p=)

[Demo](http://tympanus.net/Development/.../)

## Installation

Install dependencies:

```
npm install
```

---

## ZORA Coins SDK Integration Plan

To safely add ERC-20 minting for user signatures using the ZORA Coins SDK, we will follow a three-phase, low-risk approach. The core principle is to keep all blockchain/minting logic modular and completely separate from the drawing/canvas (p5.js) code.

_Note: The project is called **Signature Opal**. All defaults and references have been updated accordingly._

### **Phase 1: Foundation & Isolation**
- **Install SDKs:** Add `@zoralabs/coins-sdk` and `viem` as dependencies.
- **Create Blockchain Module:** Implement all ZORA coin creation and trading logic in a dedicated module (e.g., `src/js/coins/`), with no dependencies on p5.js or canvas logic.
- **Integrate Wallet Detection:** Ensure wallet connection logic is robust and isolated from drawing code.
- **No UI/UX changes to drawing or canvas at this stage.**

### **Phase 2: UI Integration (Non-Disruptive)**
- **Add Mint Button:** Add a "Mint" button to the UI, visually and functionally separated from the drawing/canvas area.
- **Trigger Mint Flow:** On click, the button will invoke the blockchain module, passing only the signature metadata URI and user wallet address.
- **Status Feedback:** Display transaction progress, errors, and results in a modal or sidebar, not on the canvas.
- **No changes to p5.js or animation logic.**

### **Phase 3: Testing, Validation & Rollout**
- **Test End-to-End:** Thoroughly test minting on testnets and mainnet, ensuring the drawing experience is never blocked or slowed by blockchain operations.
- **Error Handling:** Add robust error and edge-case handling for wallet, network, and SDK issues.
- **Document Usage:** Update documentation for contributors and users, clarifying that minting is optional and isolated from the creative experience.
- **Monitor & Iterate:** Monitor for issues post-launch and further decouple logic if needed.

---

### **Phase 4: Trading, Aggregation & Platform Dashboard (Planned)**
- **Trading:** Integrate ZORA Coins SDK trading functions to allow users to buy/sell coins minted via Signature Opal.
- **Aggregation:** Track all coins minted with the platformReferrer address (0x55A5705453Ee82c742274154136Fce8149597058) to display, aggregate, and analyze platform-created coins.
- **Platform Fees:** Ensure all minting and trading calls include the platformReferrer address so Signature Opal can accrue and later withdraw platform fees.
- **Dashboard:** Build a dashboard for platform admins to view, filter, and manage all Signature Opal coins and trading activity.

**Current Focus:**
> The immediate priority is to deliver a seamless, performant, in-modal minting experience for user signatures. Trading and aggregation features will be implemented after minting is stable and user-tested.

**Key Principle:**
> All blockchain and minting logic must remain strictly separated from the drawing/canvas (p5.js) codebase. The drawing experience should never be impacted by blockchain/network events.

---

Compile start a local server:

```
npm run dev
```

Create the build:

```
npm run build
```

## Planned On-chain Features

Upcoming integration with the Zora Protocol will allow users to mint their signatures as NFTs:

### Core Features
- Timed drawing sessions for signature creation
- Capture and store drawing data on-chain
- Multiple minting options:
  - ERC-721: One-of-one unique signature NFTs
  - ERC-1155: Multiple editions of the same signature
  - Zora Protocol Coins: Create a token around your signature

### Technical Implementation Plan
1. **Drawing Session**
   - Add timer functionality
   - Implement drawing data capture
   - Preview and confirmation system

2. **Blockchain Integration**
   - Connect wallet functionality
   - Zora Protocol SDK integration
   - Smart contract deployment for minting options

3. **User Interface**
   - Timer controls and display
   - Minting options selection
   - Transaction status and confirmation

4. **Storage**
   - Drawing data storage on IPFS
   - Metadata generation for NFTs
   - On-chain signature verification

## Misc

Follow Jorge Toloza: [Website](https://jorgetoloza.co), [Instagram](https://instagram.com/jorgecapillo), [X](https://twitter.com/jorgecapillo), [GitHub](https://github.com/jorgecapillo) 

Follow Codrops: [X](http://www.X.com/codrops), [Facebook](http://www.facebook.com/codrops), [GitHub](https://github.com/codrops), [Instagram](https://www.instagram.com/codropsss/)

## License
[MIT](LICENSE)

Made with :blue_heart:  by [Jorge Toloza](https://jorgetoloza.co) and [Codrops](http://www.codrops.com)