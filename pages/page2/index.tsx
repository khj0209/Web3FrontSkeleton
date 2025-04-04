import { useState } from "react";
import useMetamask from "../../hooks/useMetamask";

const DepositApp = () => {
    const { account, connectWallet, provider, signer, chainId } = useMetamask();
    const [formData, setFormData] = useState({
        name: "",
        bank: "",
        accountNumber: "",
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

    return (
      <div className="p-6 bg-gray-100 min-h-screen">
            <form className="bg-white p-6 rounded shadow-md max-w-md mx-auto">
            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                    이름:
                    <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </label>
                </div>
                <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                    은행:
                    <input
                    type="text"
                    name="bank"
                    value={formData.bank}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </label>
                </div>
                <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                    계좌번호:
                    <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
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
                    type="submit"
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
(DepositApp as any).title = '기타 등등';

export default DepositApp;