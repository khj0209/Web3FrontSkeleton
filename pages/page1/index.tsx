import { useState } from "react";
import useMetamask from "../../hooks/useMetamask";
import { ethers } from "ethers";

const RpcTest = () => {
    const { account, connectWallet, provider, signer, chainId } = useMetamask();
    const [formData, setFormData] = useState({
        address: "",
        amount: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const walletAddress = account;
        if (!walletAddress) {
            alert("지갑이 연결되지 않았습니다.");
            return;
        }

        const submissionData = {
            ...formData,
            walletAddress,
        };

        console.log("제출 데이터:", submissionData);
        
        // 서버로 제출 로직 추가

    };

    const sendTransaction = async () => {
        if (!signer) {
            alert("지갑이 연결되지 않았습니다.");
            return;
        }

        const transaction = {
            to: formData.address,
            value: ethers.utils.parseEther(formData.amount),
        };

        // 연결된 메타마스크 지갑을 활용해 이더 전송 트랜잭션
        try {
            const txResponse = await signer.sendTransaction(transaction);
            console.log("트랜잭션 응답:", txResponse);
            alert("트랜잭션이 성공적으로 전송되었습니다.");
        } catch (error) {
            console.error("트랜잭션 오류:", error);
            alert("트랜잭션 전송 중 오류가 발생했습니다.");
        }
    }

    return (
      <div className="p-6 bg-gray-100 min-h-screen">
            <form className="bg-white p-6 rounded shadow-md max-w-md mx-auto">
            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                    메타마스크로 보내기
                </label>
                <label className="block text-gray-700 font-medium mb-2">
                    주소:
                    <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </label>
                </div>
                <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                    신청금액:
                    <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </label>
                </div>
                <div className="text-center">
                <button
                    onClick={sendTransaction}
                    type="button"
                    className="px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    제출
                </button>
                </div>
            </form>
        </div>
    );
};
// 🧠 페이지에 title을 넣어 전달
(RpcTest as any).title = '토큰 전송';

export default RpcTest;