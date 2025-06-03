import { useState, useRef, useEffect, use } from "react";
import axios from "axios";
import ContractList from "../../../components/ContractList";
import { ethers } from "ethers";

const ContractDeploy = () => {
    const [contractList, setContractList] = useState<any[]>([]);
    const [showList, setShowList] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [contractAddress, setContractAddress] = useState<string | null>(null);
    const popup = useRef<Window | null>(null);
    const unsignedTxRef = useRef({
        to: null,
        data: "",
    });

    const WALLET_SERVICE_ORIGIN = process.env.NEXT_PUBLIC_WALLET_ORIGIN;
    const REDIRECT_URI = typeof window !== "undefined" ? window.location.origin : "";
    // const signUrl = `${WALLET_SERVICE_ORIGIN}/sign?redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    const signUrl = `${WALLET_SERVICE_ORIGIN}/sign/custom`;

    useEffect(() => {
        const handler = (event: MessageEvent) => {
                if (event.origin !== WALLET_SERVICE_ORIGIN) return;
                const { type, payload } = event.data;
                if (type === 'WALLET_READY') {
                    popup.current?.postMessage(
                        {
                            type: 'SIGN_REQUEST',
                            payload: {
                                to: unsignedTxRef.current.to,
                                data: unsignedTxRef.current.data,
                                address: sessionStorage.getItem("account") || "",
                            }
                        },
                        WALLET_SERVICE_ORIGIN
                    );
                }
                if (type === 'TX_RECEIPT') {
                    setTxHash(payload.receipt.hash);
                    setContractAddress(payload.receipt.contractAddress);
                }
            };
            window.addEventListener('message', handler);

            // 팝업 닫힘 감지
            const interval = setInterval(() => {
                if (popup.current && popup.current.closed) {
                    clearInterval(interval);
                    window.removeEventListener('message', handler);
                }
            }, 500);

    }, []);

    // 컨트랙트 리스트 조회
    const getContractList = async () => {
        const list = await axios.post(process.env.NEXT_PUBLIC_BACKEND_URL + "/contracts/get")
            .then((response) => response.data.code === "SUCCESS" ? response.data.data : [])
            .catch(() => []);
        setContractList(list);
        setShowList(true);
    };

    // 배포 요청 핸들러
    const handleDeploy = async (cont: any, params: string[]) => {
        console.log("컨트랙트 배포 요청:", cont, params);
        // 컨트랙트 상세 정보 조회
        const contractDetails = await axios.post(process.env.NEXT_PUBLIC_BACKEND_URL + "/contracts/contract/get", { contId: cont.contId })
            .then((response) => response.data.code === "SUCCESS" ? response.data.data : null)
            .catch(() => null);
        if (!contractDetails) {
            alert("컨트랙트 상세 정보가 없습니다.");
            return;
        }

        // ABI로 컨트랙트 인터페이스 생성)
        console.log("컨트랙트 상세 정보:", contractDetails);
        const contractInterface = new ethers.utils.Interface(contractDetails.abiDtlsCtt);

        // 생성자 파라미터 인코딩딩
        const deployData = contractInterface.encodeDeploy(params);
        const unsignedTx = {
            to: null,
            // 배포할때 bytecode + 생성자 파라미터 인코딩한 값값
            data: contractDetails.byteCdDtlsCtt + deployData.replace("0x", ""),
        };
        unsignedTxRef.current = unsignedTx;

        popup.current = window.open(signUrl, 'walletPopup', 'width=500,height=700');
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <form className="bg-white p-6 rounded shadow-md max-w-md mx-auto">
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                        컨트랙트 배포
                    </label>
                </div>
                {showList ? (
                    <ContractList contractList={contractList} handleDeploy={handleDeploy} />
                ) : (
                    <div className="text-center">
                        <button
                            onClick={(e) => { e.preventDefault(); getContractList(); }}
                            type="button"
                            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            컨트랙트 리스트 조회
                        </button>
                    </div>
                )}
                {/* 배포 결과 표시 */}
                {txHash &&
                    <div className="mt-4 text-center text-green-700 font-medium">
                        🎉 트랜잭션 해시: {txHash}
                        <br />
                        🎉 Contract Address: {contractAddress}
                    </div>
                }
            </form>
        </div>
    );
};

export default ContractDeploy;