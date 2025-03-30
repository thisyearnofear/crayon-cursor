import { init } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";

const injected = injectedModule();

export const web3Onboard = init({
  wallets: [injected],
  chains: [
    {
      id: "0x1", // Ethereum Mainnet
      token: "ETH",
      label: "Ethereum Mainnet",
      rpcUrl: "https://mainnet.infura.io/v3/your-project-id",
    },
  ],
  appMetadata: {
    name: "Your App Name",
    icon: "<svg>...</svg>",
    description: "Your app description",
  },
});
