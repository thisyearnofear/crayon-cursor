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
    name: "Signature App",
    icon: "<svg>...</svg>",
    description: "A web3-enabled signature drawing application",
  },
  theme: "light",
  accountCenter: {
    desktop: {
      enabled: true,
      position: "topRight",
      expanded: false,
      minimal: true,
    },
    mobile: {
      enabled: true,
      position: "topRight",
      expanded: false,
      minimal: true,
    },
  },
  notify: {
    desktop: {
      enabled: true,
      transactionHandler: (transaction) => {
        console.log({ transaction });
        if (transaction.eventCode === "txPool") {
          return {
            autoDismiss: 0,
            onClick: () =>
              window.open(
                `https://etherscan.io/tx/${transaction.id}`,
                "_blank"
              ),
          };
        }
      },
      position: "topRight",
    },
    mobile: {
      enabled: true,
      transactionHandler: (transaction) => {
        console.log({ transaction });
        if (transaction.eventCode === "txPool") {
          return {
            autoDismiss: 0,
            onClick: () =>
              window.open(
                `https://etherscan.io/tx/${transaction.id}`,
                "_blank"
              ),
          };
        }
      },
      position: "topRight",
    },
  },
  i18n: {
    en: {
      connect: {
        selectingWallet: {
          header: "Select a wallet",
          sidebar: "What is a wallet?",
          sidebarTitle: "A wallet is used to:",
          sidebarBulletPoints: [
            "Hold, send, receive and interact with digital assets on the Ethereum blockchain",
            "Hold your identity and sign transactions with your private key",
            "Interact with decentralized applications",
          ],
          recommendedWallets: "Recommended Wallets",
          otherWallets: "Other Wallets",
        },
      },
    },
  },
  containerElements: {
    accountCenter: "body",
    notify: "body",
  },
});
