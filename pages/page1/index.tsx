import { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";

const RpcTest = () => {
    const [account, setAccount] = useState<string>(""); // 예시 지갑 주소
    const [txHash, setTxHash] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        address: "",
        amount: "",
    });
    const popup = useRef<Window | null>(null);
    const unsignedTxRef = useRef({
        to: "",
        value: "0",
    });
    const WALLET_SERVICE_ORIGIN = process.env.NEXT_PUBLIC_WALLET_ORIGIN;
    const REDIRECT_URI = window.location.origin;
    const signUrl = `${WALLET_SERVICE_ORIGIN}/sign?redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

    useEffect(() => {
        const handler = (event: MessageEvent) => {
            if (event.origin !== WALLET_SERVICE_ORIGIN) return;

            const { type, payload } = event.data;
            console.log('[App] message 수신:', event.data);

            if (type === 'WALLET_READY') {
                console.log('[App] 지갑 팝업 준비됨, 트랜잭션 전송');
                popup.current?.postMessage(
                    {
                        type: 'SIGN_REQUEST',
                        payload: {
                            unsignedTx : unsignedTxRef.current,
                            address: sessionStorage.getItem("account") || "",
                        }
                    },
                    WALLET_SERVICE_ORIGIN
                );
            }
    
            if (type === 'TX_RECEIPT') {
                console.log('[✅ App 서비스] 트랜잭션 receipt 수신:', payload);
                // 후처리 로직 가능
                setTxHash(payload.receipt.hash);
                if(payload.receipt.status === 0) {
                    console.error("트랜잭션 실패:", payload.receipt);
                    alert("트랜잭션이 실패했습니다. 상태를 확인해주세요.");
                }else {
                    console.log("트랜잭션 성공:", payload.receipt);
                    alert("트랜잭션이 성공적으로 처리되었습니다.");
                }
                console.log(txHash);
            }
        };
    
        window.addEventListener('message', handler);

        const interval = setInterval(() => {
            if (popup.current && popup.current.closed) {
                console.log('[App] 팝업이 닫혔습니다.');
                clearInterval(interval);
            }
        }, 500);

        return () => {
            window.removeEventListener('message', handler);
            clearInterval(interval);
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        console.log(`입력 변경: ${name} = ${value}`);
    };

    const sendTransaction = async () => {
        if (!formData.address || !formData.amount) {
            alert("주소와 금액을 입력해주세요.");
            return;
        }

        try {
            const amountInWei = ethers.utils.parseEther(formData.amount);
            unsignedTxRef.current = {
                to: formData.address,
                value: amountInWei.toString(),
            };

            console.log('트랜잭션 데이터:', unsignedTxRef.current);

            popup.current = window.open(signUrl, 'walletPopup', 'width=500,height=700');
        } catch (error) {
            console.error("트랜잭션 전송 실패:", error);
            alert("트랜잭션 전송에 실패했습니다. 콘솔을 확인해주세요.");
        }
    }

    return (
      <div className="p-6 bg-gray-100 min-h-screen">
            <form className="bg-white p-6 rounded shadow-md max-w-md mx-auto">
            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                    1Q Wallet으로 토큰 보내기
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