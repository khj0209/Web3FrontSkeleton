import { useState, useEffect, useCallback } from "react";
import { ethers, providers } from "ethers";

interface MetamaskState {
  provider: providers.Web3Provider | null;
  signer: ethers.Signer | null;
  account: string;
  chainId: number | null;
}

export default function useMetamask() {
  const [state, setState] = useState<MetamaskState>({
    provider: null,
    signer: null,
    account: "",
    chainId: null,
  });

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === "undefined") {
      alert("MetaMask가 설치되어 있지 않습니다.");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const chainId = (await provider.getNetwork()).chainId;

      setState({
        provider,
        signer,
        account: accounts[0],
        chainId,
      });

      // MetaMask 이벤트 리스너 등록
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        setState((prev) => ({
          ...prev,
          account: accounts[0] || "",
        }));
      });

      window.ethereum.on("chainChanged", (chainIdHex: string) => {
        setState((prev) => ({
          ...prev,
          chainId: parseInt(chainIdHex, 16),
        }));
      });
    } catch (error) {
      console.error("MetaMask 연결 오류:", error);
    }
  }, []);

  useEffect(() => {
    if (window.ethereum?.isConnected()) {
      connectWallet();
    }
    return () => {
      window.ethereum?.removeAllListeners();
    };
  }, [connectWallet]);

  return { ...state, connectWallet };
}
