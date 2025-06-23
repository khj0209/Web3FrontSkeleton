import axios from "axios";
import { ethers } from "ethers";
import { useEffect, useRef, useState } from "react";

// 컨트랙트 이름-ABI 매핑
const contractMap: Record<string, { abi: any; bytecode: string }> = {
    HanaKRW: require("../../../HanaKRW.json"),
    SimpleStorage: require("../../../SimpleStorage.json"),
    FiatTokenProxy: require("../../../FiatTokenV2_2.json"),
    // FiatTokenProxy: require("../../../FiatTokenProxy.json"),
    // ...필요한 만큼 추가
};

const ContractCallTest = () => {
    const [contractName, setContractName] = useState<string>("HanaKRW");
    const [contractAddress, setContractAddress] = useState<string>("");
    const [functionList, setFunctionList] = useState<any[]>([]);
    const [paramValues, setParamValues] = useState<string[][]>([]);
    const [txReturn, setTxReturn] = useState<string[]>([]);
    const unsignedTxRef = useRef<any>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const popup = useRef<Window | null>(null);

    const WALLET_SERVICE_ORIGIN = process.env.NEXT_PUBLIC_WALLET_ORIGIN;
    const REDIRECT_URI = window.location.origin;
    const signUrl = `${WALLET_SERVICE_ORIGIN}/sign?redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

    // contractInterface는 contractName이 바뀔 때마다 새로 생성
    const [contractInterface, setContractInterface] = useState<any>(  
        new ethers.utils.Interface(contractMap[contractName].abi)
    );

    useEffect(() => {
        setContractInterface(new ethers.utils.Interface(contractMap[contractName].abi));
        setFunctionList([]);
        setParamValues([]);
        setTxReturn([]);
    }, [contractName]);

    // 컨트랙트 함수 목록 조회
    const readContract = () => {
        const functionNames = Object.keys(contractInterface.functions);
        const filtered = functionNames
            .map((name) => {
                const fragment = contractInterface.getFunction(name);
                return {
                    name,
                    inputs: fragment.inputs || [],
                    stateMutability: fragment.stateMutability,
                };
            })
            .filter((f) => !f.name.includes('(') || !f.name.startsWith('constructor'));
        setFunctionList(filtered);
        setParamValues(filtered.map(f => f.inputs.map(() => "")));
        setTxReturn(filtered.map(() => ""));
    };

    // 파라미터 입력값 변경
    const handleParamChange = (funcIdx: number, paramIdx: number, value: string) => {
        setParamValues(prev => {
            const updated = prev.map(arr => [...arr]);
            updated[funcIdx][paramIdx] = value;
            return updated;
        });
    };

    // 트랜잭션/eth_call 실행
    const sendTransaction = async (idx: number) => {
        const func = functionList[idx];
        console.log("Selected function:", func);
        const params = paramValues[idx];
        const isView = func.stateMutability === 'view' || func.stateMutability === 'pure';

        const fragment = contractInterface.getFunction(func.name);
        console.log("Function fragment:", fragment);
        const data = contractInterface.encodeFunctionData(fragment, params);
        console.log("Encoded data:", data);

        if (isView) {
            // eth_call
            const callData = { to: contractAddress, data };
            console.log("eth_call data:", callData);
            const response = await axios.post(process.env.NEXT_PUBLIC_NODE_SERVICE + "/ethCall", callData);
            if (response.data.status === "error") {
                alert("컨트랙트 호출에 실패했습니다.");
                return;
            }
            console.log("eth_call response:", response);
            const result = contractInterface.decodeFunctionResult(func.name, response.data.data.result);
            setTxReturn(prev => {
                const updated = [...prev];
                updated[idx] = Array.isArray(result) ? result[0]?.toString() : result?.toString();
                return updated;
            });
        } else {
            // 트랜잭션
            const unsignedTx = { to: contractAddress, data };
            unsignedTxRef.current = unsignedTx;
            openWalletPopup();
        }
    };

    // 팝업 관련
    const openWalletPopup = () => {
        popup.current = window.open(signUrl, 'walletPopup', 'width=500,height=700');
    };

    useEffect(() => {
        const handler = (event: MessageEvent) => {
            if (event.origin !== WALLET_SERVICE_ORIGIN) return;
            const { type, payload } = event.data;
            if (type === 'WALLET_READY') {
                popup.current?.postMessage(
                    {
                        type: 'SIGN_REQUEST',
                        payload: {
                            unsignedTx: unsignedTxRef.current,
                            address: sessionStorage.getItem("account") || "",
                        }
                    },
                    WALLET_SERVICE_ORIGIN
                );
            }
            if (type === 'TX_RECEIPT') {
                setTxHash(payload.receipt.hash);
                // setContractAddress(payload.receipt.contractAddress);
                if (payload.receipt.status === 0) {
                    alert("트랜잭션이 실패했습니다.");
                } else {
                    alert("트랜잭션이 성공적으로 처리되었습니다.");
                }
            }
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, []);

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <form className="bg-white p-6 rounded shadow-md max-w-md mx-auto">
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                        Contract Name:
                        <select
                            value={contractName}
                            onChange={e => setContractName(e.target.value)}
                            className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {Object.keys(contractMap).map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </label>
                    <label className="block text-gray-700 font-medium mb-2">
                        Contract Address:
                        <input
                            type="text"
                            name="address"
                            value={contractAddress}
                            onChange={e => setContractAddress(e.target.value)}
                            required
                            className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </label>
                </div>
                <button
                    onClick={e => { e.preventDefault(); readContract(); }}
                    type="button"
                    className="px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    조회
                </button>
                <div className="mb-4">
                    {functionList.map((func, funcIdx) => (
                        <div key={funcIdx} className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">
                                {func.name}
                            </label>
                            {func.inputs.map((input: any, paramIdx: number) => (
                                <input
                                    key={paramIdx}
                                    type="text"
                                    placeholder={input.name || `param${paramIdx + 1}`}
                                    value={paramValues[funcIdx]?.[paramIdx] || ""}
                                    onChange={e => handleParamChange(funcIdx, paramIdx, e.target.value)}
                                    className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            ))}
                            {func.stateMutability === 'view' || func.stateMutability === 'pure' ? (
                                <p className="mt-1 p-2 bg-gray-100 border border-gray-300 rounded">
                                    {txReturn[funcIdx] || "..."}
                                </p>
                            ) : null}
                            <button
                                onClick={e => { e.preventDefault(); sendTransaction(funcIdx); }}
                                type="button"
                                className="px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                            >
                                호출
                            </button>
                        </div>
                    ))}
                </div>
            </form>
        </div>
    );
};

(ContractCallTest as any).title = '컨트랙트 호출';

export default ContractCallTest;