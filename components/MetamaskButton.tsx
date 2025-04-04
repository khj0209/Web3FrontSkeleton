import React from "react";
import useMetamask from "../hooks/useMetamask";

const MetamaskButton: React.FC = () => {
  const { account, connectWallet } = useMetamask();

  return (
    <button 
      onClick={connectWallet}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
    >
      {account ? `${account.slice(0,6)}...${account.slice(-4)}` : "메타마스크 연결"}
    </button>
  );
};

export default MetamaskButton;
