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