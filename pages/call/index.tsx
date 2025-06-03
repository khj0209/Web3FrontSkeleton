import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import axios from "axios";

//moke data
// contractaddress, abi, bytecode 포함
const mokeContract = {
        abi: require("../../SimpleStorage.json").abi,
        bytecode: require("../../SimpleStorage.json").bytecode,
    };

interface Contract {
    name: string;
    params: string[];
}

const ContractCallTest = () => {
    const [contractAddress, setContractAddress] = useState<string>("");
    const [functions, setFunctions] = useState<Contract[]>([]);
    const [functionType, setFunctionType] = useState<string[]>([]);
    const [txReturn, setTxReturn] = useState<string[]>([]);
    const unsignedTxRef = useRef<any>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const popup = useRef<Window | null>(null);

    const WALLET_SERVICE_ORIGIN = process.env.NEXT_PUBLIC_WALLET_ORIGIN;
    const REDIRECT_URI = window.location.origin;
    const signUrl = `${WALLET_SERVICE_ORIGIN}/sign?redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    
    // TODO: Contract 서비스 호출을 통해 ABI 가져와야함함
    const contractInterface = new ethers.utils.Interface(mokeContract.abi);
    // const contractInterface = await axios.post(process.env.NEXT_PUBLIC_CONTRACT_SERVICE + "/getContractInterface", {
    
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setContractAddress(value);
    };

    // const handleSubmit = (e: React.FormEvent) => {
    //     e.preventDefault();
    //     const submissionData = contractAddress;
    //     console.log("제출 데이터:", submissionData);
    // };

    const openWalletPopup = () => {
        console.log('[App] 팝업 열기 시도');
        popup.current = window.open(signUrl, 'walletPopup', 'width=500,height=700');
    };
    
    useEffect(() => {
        const handler = (event: MessageEvent) => {
            if (event.origin !== WALLET_SERVICE_ORIGIN) return;

            const { type, payload } = event.data;
            console.log('[App] message 수신:', event.data);

            if (type === 'WALLET_READY') {
                console.log('[App] 지갑 팝업 준비됨, 트랜잭션 전송');
                console.log("postMessage로 unsignedTx 전송");
                console.log("unsignedTxTest:", unsignedTxRef.current);
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
                setContractAddress(payload.receipt.contractAddress);
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

    const checkType = (funcName: string) => {
        const func = contractInterface.functions[funcName];
        if (func.stateMutability === 'view' || func.stateMutability === 'pure') {
            return 'call'; // 상태 변경이 없는 함수
        } else {
            return 'transaction'; // 상태 변경이 있는 함수
        }
    }

    const readContract = async () => {
        setFunctions([]); // 함수 목록 초기화

        //가져온 ABI를 활용해 함수 리스트 출력
        // const contractInterface = new ethers.utils.Interface(mokeContract.abi);

        const functionNames = Object.keys(contractInterface.functions);
        console.log("컨트랙트 함수 목록:", functionNames);

        for(let i = 0; i < functionNames.length; i++) {
            const functionName = functionNames[i];
            const functionParams = [contractInterface.getSighash(functionName)];
            setFunctions((prev) => [...prev, { name: functionName, params: functionParams }]);
            setFunctionType((prev) => [...prev, checkType(functionName)]);
            console.log(`함수 ${i + 1}: ${functionName}, 파라미터: ${functionParams}`);
            // return 배열 초기화
            setTxReturn((prev) => [...prev, ""]);
        }
    }

    const sendTransaction = async (idx: number) => {
        console.log("sendTransaction");

        if(contractInterface.functions[functions[idx].name].stateMutability === 'view' || 
            contractInterface.functions[functions[idx].name].stateMutability === 'pure') {
            console.log("상태 변경이 없는 함수 호출, eth_call 사용");
            ethCall(idx);
        }else {
            console.log("상태 변경이 있는 함수 호출, 트랜잭션 전송");

            // 트랜잭션 데이터 생성
            const data = contractInterface.encodeFunctionData(contractInterface.getSighash(functions[idx].name), functions[idx].params);
            console.log("트랜잭션 데이터:", data);

            const unsignedTx = {
                to: contractAddress,
                data: data,
            };
            unsignedTxRef.current = unsignedTx;

            console.log("생성된 unsignedTx:", unsignedTxRef.current);
            // 팝업 열기
            openWalletPopup();
        }

    }

    const ethCall = async (idx: number) => {        
        const functionName = functions[idx].name; 
        console.log("선택된 함수 이름:", functionName);
        const functionParams = functions[idx].params; 
        console.log("선택된 함수 파라미터:", functionParams);

        // eth call을 위한 데이터 생성
        const data = contractInterface.encodeFunctionData(contractInterface.getSighash(functionName),);
        console.log("생성된 데이터:", data);

        const callData = {
            to: contractAddress,
            data: data
        };

        console.log("컨트랙트 호출 데이터:", callData);
        const response = await axios.post(process.env.NEXT_PUBLIC_NODE_SERVICE+"/ethCall", callData);
        console.log("컨트랙트 호출 응답:", response.data);
        if (response.data.status === "error") {
            console.error("컨트랙트 호출 오류:", response.data);
            return alert("컨트랙트 호출에 실패했습니다. 상태를 확인해주세요.");
        } else {
            console.log("컨트랙트 호출 성공:", response.data.data.result);
        }

        // 결과를 txReturn에 저장
        const result = contractInterface.decodeFunctionResult(contractInterface.getSighash(functionName), response.data.data.result);
        console.log("디코딩된 결과:", result[0]._hex); // 첫 번째 반환값만 사용        
        const newTxReturn = [...txReturn]; // 기존 상태 복사
        newTxReturn[idx] = parseInt(result[0]._hex, 16).toString(); // 첫 번째 반환값만 저장

        setTxReturn(newTxReturn); // 상태 업데이트

        console.log("txReturn 상태 업데이트:", txReturn);
    }

    return (
      <div className="p-6 bg-gray-100 min-h-screen">
            <form className="bg-white p-6 rounded shadow-md max-w-md mx-auto">
            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                    Contract Call
                </label>
                <label className="block text-gray-700 font-medium mb-2">
                    Contract Address:
                    <input
                    type="text"
                    name="address"
                    value={contractAddress}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </label>
                </div>
                <button
                    onClick={readContract}
                    type="button"
                    className="px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    조회
                </button>
                {/* ---- */}
                <div className="mb-4">
                    {functions.map((func, index) => (
                        <div key={index} className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">
                                {func.name}:
                                {/* 인풋도 funcions의 param 갯수만큼 만들어줘 */}
                                {/* type을 확인하고 Call이면 text, transaction이면 input으로 만들어줘 */}
                                {functionType[index] === 'call' ? (
                                    <p className="mt-1 p-2 bg-gray-100 border border-gray-300 rounded">
                                        {txReturn[index] || "..."}
                                    </p>
                                    // <input
                                    //     type="text"
                                    //     value={txReturn[index]}
                                    //     readOnly
                                    //     className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    // />
                                ) : (
                                    func.params.map((param, paramIndex) => (
                                        <input
                                            key={paramIndex}
                                            type="text"
                                            onChange={(e) => {
                                                const newParams = [...func.params];
                                                newParams[paramIndex] = e.target.value;
                                                setFunctions((prev) => {
                                                    const updated = [...prev];
                                                    updated[index].params = newParams;
                                                    return updated;
                                                });
                                            }}
                                            className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ))
                                )}
                            </label>
                            <button
                                onClick={() => sendTransaction(index)}
                                type="button"
                                className="px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
// 🧠 페이지에 title을 넣어 전달
(ContractCallTest as any).title = '컨트랙트 호출';

export default ContractCallTest;