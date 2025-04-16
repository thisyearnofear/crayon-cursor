// src/js/coins/zora-coins.js
// All ZORA Coins SDK logic is kept isolated from drawing/canvas logic.
// This module provides functions to mint (create) signature coins.

import { createCoin } from '@zoralabs/coins-sdk';
import { createWalletClient, createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

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
  initialPurchaseWei
}) {
  // Set up viem clients
  const publicClient = createPublicClient({
    chain: base,
    transport: http(rpcUrl)
  });
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(rpcUrl)
  });

  // Prepare coin params
  const coinParams = {
    name,
    symbol,
    uri: metadataUri,
    payoutRecipient,
    ...(platformReferrer ? { platformReferrer } : {}),
    ...(initialPurchaseWei ? { initialPurchaseWei } : {})
  };

  // Call the SDK
  return await createCoin(coinParams, walletClient, publicClient);
}

// Future: add trade, query, and utility functions as needed.
