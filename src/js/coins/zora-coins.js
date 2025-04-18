// src/js/coins/zora-coins.js
// All ZORA Coins SDK logic is kept isolated from drawing/canvas logic.
// This module provides functions to mint (create) signature coins.

import { createCoin } from "@zoralabs/coins-sdk";
import { validateMetadataJSON } from "@zoralabs/coins-sdk";
import { createWalletClient, createPublicClient, http, custom } from "viem";
import { base } from "viem/chains";

// Gate logs and env variables
const DEV = import.meta.env.DEV;
const API_URL = import.meta.env.VITE_API_URL;
function log(...args) {
  if (DEV) console.log(...args);
}

/**
 * Create a new signature coin on ZORA.
 *
 * @param {Object} opts
 * @param {string} opts.name - Coin name (e.g., "Signature")
 * @param {string} opts.symbol - Coin symbol (e.g., "SIG")
 * @param {string} opts.metadataUri - IPFS URI for signature metadata
 * @param {string} opts.payoutRecipient - Payout recipient address (user's wallet)
 * @param {string} opts.account - User's wallet address (Hex string)
 * @param {string} opts.rpcUrl - RPC URL for Base chain
 * @param {string} [opts.platformReferrer] - (Optional) Platform referrer address
 * @param {bigint} [opts.initialPurchaseWei] - (Optional) Initial purchase amount in Wei
 * @param {string} [opts.currency] - (Optional) Currency address (zero for ETH, WETH for ERC20)
 * @param {bigint} [opts.orderSize] - (Optional) Initial purchase amount in Wei
 * @returns {Promise<Object>} Coin deployment result
 */
export async function createSignatureCoin({
  name,
  symbol,
  metadataUri,
  payoutRecipient,
  account,
  rpcUrl,
  platformReferrer,
  initialPurchaseWei,
  currency,
  orderSize,
}) {
  log("Creating signature coin with params:", {
    name,
    symbol,
    metadataUri,
    payoutRecipient,
    account,
    platformReferrer,
  });

  // Check if wallet is connected using the wallet bridge or direct access
  const walletAccount = window.walletBridge
    ? window.walletBridge.getAccount()
    : window.wallet && window.wallet.getAccount && window.wallet.getAccount();

  if (!walletAccount) {
    throw new Error("Wallet not connected. Please connect your wallet first.");
  }

  // Check if window.ethereum is available
  if (!window.ethereum) {
    throw new Error(
      "No wallet provider detected. Please make sure your wallet is properly connected."
    );
  }

  log("Using wallet provider for transaction...");

  // Always use the wallet's provider for transactions
  const transport = custom(window.ethereum);

  // List of public RPC endpoints for Base
  const publicRpcUrls = [
    "https://mainnet.base.org",
    "https://base.llamarpc.com",
    "https://base.publicnode.com",
    // Add more fallbacks if needed
  ];

  // Use a public RPC endpoint for read operations
  const publicClient = createPublicClient({
    chain: base,
    transport: http(rpcUrl || publicRpcUrls[0]),
  });

  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: transport,
  });

  // Validate parameters
  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new Error("Name is required and must be a non-empty string");
  }

  if (!symbol || typeof symbol !== "string" || symbol.trim() === "") {
    throw new Error("Symbol is required and must be a non-empty string");
  }

  if (
    !metadataUri ||
    typeof metadataUri !== "string" ||
    !metadataUri.startsWith("ipfs://")
  ) {
    throw new Error("Metadata URI is required and must be an IPFS URI");
  }

  if (
    !payoutRecipient ||
    typeof payoutRecipient !== "string" ||
    !payoutRecipient.startsWith("0x")
  ) {
    throw new Error("Payout recipient is required and must be a valid address");
  }

  // Generate a unique symbol by adding a timestamp suffix if needed
  // This helps avoid collisions with existing coins
  const uniqueSymbol =
    symbol.length > 3
      ? symbol
      : `${symbol}${Date.now().toString(36).slice(-2)}`;

  // Derive orderSize and currency: only use WETH when orderSize > 0
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";
  const _orderSize = typeof orderSize !== 'undefined' ? orderSize : initialPurchaseWei;
  const _currency = _orderSize > 0n
    ? (typeof currency === 'string' && currency ? currency : WETH_ADDRESS)
    : ZERO_ADDRESS;

  // Prepare coin params according to the documentation
  const coinParams = {
    name,
    symbol: uniqueSymbol,
    uri: metadataUri,
    payoutRecipient,
    owners: [payoutRecipient],
    tickLower: 0n,
    currency: _currency,
    orderSize: _orderSize,
    ...(platformReferrer ? { platformReferrer } : {}),
    ...(initialPurchaseWei ? { initialPurchaseWei } : {}),
  };

  log("Creating coin with validated parameters:", coinParams);

  try {
    // Import the network utility functions
    const { isConnectedToBase, switchToBase } = await import(
      "../utils/network.js"
    );

    // Check if connected to Base network
    const isBase = await isConnectedToBase();
    if (!isBase) {
      log("Not connected to Base network, attempting to switch...");
      const switched = await switchToBase();
      if (!switched) {
        throw new Error(
          "Failed to switch to Base network. Please switch manually in your wallet."
        );
      }
      log("Successfully switched to Base network");
    }

    log("Calling createCoin with params:", coinParams);

    // Add more detailed logging for debugging
    log("Wallet client:", {
      account: walletClient.account,
      chain: walletClient.chain.name,
      chainId: walletClient.chain.id,
    });

    log("Public client:", {
      chain: publicClient.chain.name,
      chainId: publicClient.chain.id,
    });

    // Approve ERC20 token if using non-native currency
    if (_currency !== ZERO_ADDRESS) {
      const FACTORY_ADDRESS = "0x777777751622c0d3258f214F9DF38E35BF45baF3";
      log(`Approving ERC20 token ${_currency} to factory ${FACTORY_ADDRESS}`);
      const erc20ApproveAbi = [
        { name: "approve", type: "function", stateMutability: "nonpayable", inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" }
          ], outputs: [{ name: "", type: "bool" }]
        }
      ];
      const approvalTxHash = await walletClient.writeContract({
        address: _currency,
        abi: erc20ApproveAbi,
        functionName: "approve",
        args: [FACTORY_ADDRESS, _orderSize],
      });
      log("Approval transaction hash:", approvalTxHash);
      log("Waiting for approval confirmation...");
      await walletClient.waitForTransactionReceipt({ hash: approvalTxHash });
      log("Approval confirmed");
    }

    // Try to simulate the transaction first to get more detailed error information
    try {
      log("Simulating transaction before sending...");
      // Call the SDK with skipMetadataValidation option
      // Only send ETH value when using native currency and non-zero orderSize
      const result = await createCoin(coinParams, walletClient, publicClient, {
        // Skip on-chain simulation to avoid static revert blocking actual transaction
        skipSimulation: DEV,
        skipMetadataValidation: false,
        // Use proxy server for IPFS fetches
        ipfsFetch: async (uri) => {
          const hash = uri.replace("ipfs://", "");
          const res = await fetch(`${API_URL}/api/ipfs/${hash}`);
          if (!res.ok) throw new Error(`Failed to fetch IPFS content: ${res.status}`);
          return await res.json();
        },
        // Only send ETH when using native currency and non-zero orderSize
        overrides: (_currency === ZERO_ADDRESS && _orderSize > 0n)
          ? { value: _orderSize }
          : {},
      });

      return result;
    } catch (simulationError) {
      console.error("Simulation error:", simulationError);

      // Check if this is the specific 0x4ab38e08 error
      if (simulationError.message.includes("0x4ab38e08")) {
        // Try to look up the error signature
        log("Looking up error signature 0x4ab38e08...");

        // Log detailed information about the error for debugging
        log("Error details:", {
          message: simulationError.message,
          name: simulationError.name,
          cause: simulationError.cause
            ? simulationError.cause.message
            : "No cause",
          data: simulationError.data || "No data",
          args: coinParams,
        });

        // Throw a more specific error
        throw new Error(
          "Contract deployment failed with error code 0x4ab38e08. This might be due to a name/symbol collision or invalid parameters. Please try a different name or symbol."
        );
      }

      // Re-throw the original error if it's not the specific one we're handling
      throw simulationError;
    }

    log("Coin created successfully:", result);
    return result;
  } catch (error) {
    console.error("Error creating coin:", error);

    // Provide more detailed error information
    if (error.message.includes("metadata")) {
      throw new Error(
        `Metadata validation failed: ${error.message}. Please ensure your metadata follows the EIP-7572 standard.`
      );
    } else if (error.message.includes("gas")) {
      throw new Error(
        `Gas estimation failed: ${error.message}. Please check your wallet has enough ETH for gas.`
      );
    } else if (
      error.message.includes("rejected") ||
      error.message.includes("denied") ||
      error.message.includes("user denied")
    ) {
      throw new Error(
        "Transaction rejected by user. Please approve the transaction in your wallet."
      );
    } else if (
      error.message.includes("authenticated") ||
      error.message.includes("401")
    ) {
      throw new Error(
        "Authentication failed. Using your wallet's built-in provider instead."
      );
    } else if (error.message.includes("0x4ab38e08")) {
      // This is a specific contract error that might be related to duplicate coins or invalid parameters
      console.error(
        "Contract deployment error with signature 0x4ab38e08:",
        error
      );

      // Log detailed information about the error for debugging
      log("Detailed error information:", {
        message: error.message,
        name: error.name,
        cause: error.cause ? error.cause.message : "No cause",
        data: error.data || "No data",
        stack: error.stack,
        params: coinParams,
      });

      // Try to extract more information from the error
      const errorDetails = error.message.match(
        /Contract Call:[\s\S]*?sender:[\s\S]*?([0-9a-fA-F]+)/m
      );
      const senderInfo = errorDetails ? errorDetails[1].trim() : "Unknown";

      throw new Error(
        `Contract deployment failed with error code 0x4ab38e08. This could be because a coin with this name or symbol already exists, or the parameters are invalid. Sender: ${senderInfo}. Please try a different name or symbol.`
      );
    } else if (
      error.message.includes("network") ||
      error.message.includes("chain") ||
      error.message.includes("reverted")
    ) {
      console.error("Network or contract error:", error);
      throw new Error(
        "Network error. Please make sure your wallet is connected to the Base network and try again."
      );
    } else {
      console.error("Detailed error:", error);
      throw error;
    }
  }
}

/**
 * Custom metadata validator that works with our IPFS setup
 * This function validates the metadata URI and its content
 * @param {string} metadataUri - The metadata URI to validate
 * @returns {Promise<boolean>} - Returns true if valid, throws error if invalid
 */
export async function validateMetadata(metadataUri) {
  log("Validating metadata URI:", metadataUri);

  if (!metadataUri || typeof metadataUri !== "string") {
    throw new Error("Invalid metadata URI");
  }

  if (!metadataUri.startsWith("ipfs://")) {
    throw new Error("Metadata URI must start with ipfs://");
  }

  // Extract the IPFS hash
  const ipfsHash = metadataUri.replace("ipfs://", "");
  log("IPFS hash:", ipfsHash);

  // Use our proxy server to fetch the metadata
  // This avoids CORS issues when fetching from the browser
  log("Using proxy server to fetch metadata...");

  // Add a delay to ensure IPFS content has propagated
  log("Waiting for IPFS content to propagate...");
  await new Promise((resolve) => setTimeout(resolve, 5000));
  log("IPFS propagation delay complete");

  try {
    log(`Fetching metadata via proxy server for hash: ${ipfsHash}`);
    // Use environment variable for API URL if available, otherwise fallback to localhost
    const proxyUrl = `${API_URL}/api/ipfs/${ipfsHash}`;

    const response = await fetch(proxyUrl);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `Proxy server error: ${response.status}`
      );
    }

    const result = await response.json();
    const metadata = result.content;
    const successGateway = result.source;

    if (!metadata) {
      throw new Error("Proxy server returned empty metadata");
    }

    log(
      `Successfully fetched metadata via proxy from ${successGateway}:`,
      metadata
    );

    // Validate the metadata according to EIP-7572 standard
    if (!metadata.name || typeof metadata.name !== "string") {
      throw new Error("Metadata must include a name as a string");
    }

    if (!metadata.description || typeof metadata.description !== "string") {
      throw new Error("Metadata must include a description as a string");
    }

    if (!metadata.image || typeof metadata.image !== "string") {
      throw new Error("Metadata must include an image URL as a string");
    }

    if (!metadata.image.startsWith("ipfs://")) {
      throw new Error("Image URL must start with ipfs://");
    }

    // Use the SDK's validator as well
    validateMetadataJSON(metadata);
    log("Metadata validation successful");

    return metadata;
  } catch (error) {
    console.error("Error fetching metadata via proxy:", error);
    throw new Error(`Failed to fetch metadata: ${error.message}`);
  }

  // The metadata is already returned from the try block above
  // This code is unreachable, but we'll keep it for reference
  return null;
}

// Future: add trade, query, and utility functions as needed.
