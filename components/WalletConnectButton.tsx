import React from "react";
import { useEffect, useState } from "react";
import { Core } from "@walletconnect/core";
import WalletKit, { WalletKitTypes } from "@reown/walletkit";// import the builder util
// import { WalletKit, WalletKitTypes } from '@reown/walletkit'
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils'

const core = new Core({
  projectId: process.env.PROJECT_ID,
  relayUrl: "https://reown.com/walletKit"
});

const WalletConnectButton = () => {
    const [account, setAccount] = useState<string | null>(null);
    const [walletKit, setWalletKit] = useState<WalletKit | null>(null);

    // 비동기 초기화
    useEffect(() => {
      console.log(process.env.NEXT_PUBLIC_PROJECT_ID);
      const initWalletKit = async () => {
        const kit = await WalletKit.init({
          core,
          metadata: {
            name: "custodial-wallet",
            description: "Demo Client as Wallet",
            url: "http://localhost:3000/wallet", // 정확한 URL로 변경
            icons: [],
          },
        });
        setWalletKit(kit);
        console.log("WalletKit initialized:", kit);
      };
      initWalletKit();
    }, []);

    const connectWallet = async () => {
      if (!walletKit) {
        console.warn("WalletKit not ready");
        return;
      }
  
      const activeSessions = walletKit.getActiveSessions();
      console.log("Active sessions:", activeSessions);
  
      // 이후 필요한 session 연결 로직 수행
    };

  return (
    <button 
      onClick={connectWallet}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
    >
      {account ? `${account.slice(0,6)}...${account.slice(-4)}` : "지갑 연결"}
    </button>
  );
};

export default WalletConnectButton;
