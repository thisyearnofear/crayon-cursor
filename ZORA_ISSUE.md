# Zora Coins SDK Issue Report

## Issue Summary

When attempting to create a coin using the Zora Coins SDK, we consistently encounter a contract revert error with signature `0x4ab38e08`. This error occurs during the `deploy` function call on the contract at address `0x777777751622c0d3258f214F9DF38E35BF45baF3`.

## Environment

- **Network**: Base Mainnet
- **SDK Version**: @zoralabs/coins-sdk@0.0.8
- **Wallet**: Connected to Base network (Chain ID: 0x2105)
- **Browser**: Chrome with Pelagus wallet extension

## Steps to Reproduce

1. Connect wallet to Base network
2. Upload an image to IPFS
3. Create metadata following EIP-7572 standard
4. Upload metadata to IPFS
5. Call `createCoin` function with the following parameters:
   ```javascript
   {
     name: "Signature Opal",
     symbol: "SIGiw", // Unique symbol with timestamp suffix
     uri: "ipfs://QmQmmxD6LiRgz49Ktu8pcSHJG6jvQaMBtePPBDWdMnVx8g",
     payoutRecipient: "0x55A5705453Ee82c742274154136Fce8149597058",
     owners: ["0x55A5705453Ee82c742274154136Fce8149597058"],
     platformReferrer: "0x55A5705453Ee82c742274154136Fce8149597058",
     currency: "0x4200000000000000000000000000000000000006", // WETH on Base
     tickLower: -199200,
     orderSize: 0
   }
   ```

## Error Message

```
ContractFunctionExecutionError: The contract function "deploy" reverted with the following signature:
0x4ab38e08

Unable to decode signature "0x4ab38e08" as it was not found on the provided ABI.
Make sure you are using the correct ABI and that the error exists on it.
You can look up the decoded signature here: https://openchain.xyz/signatures?query=0x4ab38e08.
 
Contract Call:
  address:   0x777777751622c0d3258f214F9DF38E35BF45baF3
  function:  deploy(address payoutRecipient, address[] owners, string uri, string name, string symbol, address platformReferrer, address currency, int24 tickLower, uint256 orderSize)
  args:            (0x55A5705453Ee82c742274154136Fce8149597058, ["0x55A5705453Ee82c742274154136Fce8149597058"], ipfs://QmQmmxD6LiRgz49Ktu8pcSHJG6jvQaMBtePPBDWdMnVx8g, Signature Opal, SIGiw, 0x55A5705453Ee82c742274154136Fce8149597058, 0x4200000000000000000000000000000000000006, -199200, 0)
  sender:    0x55A5705453Ee82c742274154136Fce8149597058
```

## What We've Tried

1. **Unique Symbols**: Generated unique symbols with timestamp suffixes to avoid collisions
2. **Network Switching**: Ensured wallet is connected to Base network before minting
3. **Metadata Validation**: Validated metadata follows EIP-7572 standard
4. **Parameter Validation**: Added extensive validation for all parameters
5. **Different Accounts**: Tried with different wallet accounts
6. **SDK Options**: Used `skipMetadataValidation: true` option

## Relevant Code

### Creating the Coin

```javascript
// Prepare coin params according to the documentation
const coinParams = {
  name,
  symbol: uniqueSymbol, // Generated with timestamp suffix
  uri: metadataUri,
  payoutRecipient,
  // Default owners to payoutRecipient if not provided
  owners: [payoutRecipient],
  // Use default tick lower for Uniswap V3 pool
  tickLower: -199200,
  // Default currency is WETH on Base
  currency: "0x4200000000000000000000000000000000000006",
  // Default order size is 0
  orderSize: 0,
  // Add platform referrer if provided
  ...(platformReferrer ? { platformReferrer } : {}),
  // Add initial purchase amount if provided
  ...(initialPurchaseWei ? { initialPurchaseWei } : {}),
};

// Call the SDK with skipMetadataValidation option
const result = await createCoin(coinParams, walletClient, publicClient, {
  skipMetadataValidation: true,
});
```

### Metadata Format

```javascript
{
  "name": "Signature Opal",
  "description": "A unique signature minted as an NFT.",
  "image": "ipfs://QmTHwW3ugVo8FC8jfQMtTFAeAon1WiMUPycijx9GJw5GEy",
  "properties": {
    "category": "signature",
    "type": "image"
  }
}
```

## Zora Minting Issue Report

**Context:** Signature coin deploy on Zora x Base reverts with error signature `0x4ab38e08`.

### Attempts

1. Wired through `initialPurchaseWei`, derived `currency` (zero/WETH) and `orderSize`.
2. Passed `overrides: { value: initialPurchaseWei }` for ETH mints.
3. Set `tickLower` to `0n`.
4. Added ERC20 approval (`approve` WETH to factory) for non-native mints.
5. Overrode SDK `ipfsFetch` to use local `/api/ipfs` proxy instead of default Magic gateway.
6. Added `skipSimulation: true` to bypass static call simulation.
7. Refined override logic to send ETH only when native currency and `orderSize > 0`.
8. Appended timestamp suffix to symbol to avoid name/symbol collisions.

### Latest Error

```
ContractFunctionExecutionError: deploy reverted with signature 0x4ab38e08
Args: payoutRecipient, owners, uri, name, symbol, platformReferrer, currency(0x4200000000000000000000000000000000000006), tickLower(0), orderSize(0)
```

**Request:** Please advise why the factory deploy is still reverting and any missing parameters or steps.

## Questions for the Zora Team

1. What does the error signature `0x4ab38e08` represent in the contract?
2. Are there any specific requirements for the contract parameters that we're missing?
3. Could there be an issue with the contract on Base network?
4. Are there any known limitations or restrictions for creating coins?
5. Is there a way to get more detailed error information from the contract?


## Live Demo

You can test the issue at: https://signature-opal.netlify.app/
