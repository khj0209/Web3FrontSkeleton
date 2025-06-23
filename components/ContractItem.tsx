"use client";
type ContractItemProps = {
    cont: any;
    isOpen: boolean;
    onToggle: () => void;
    creatorParams: any[];
    inputValues: string[];
    onInputChange: (paramIdx: number, value: string) => void;
    handleDeploy: (cont: any, params: string[]) => void;
};

const ContractItem = ({
    cont,
    isOpen,
    onToggle,
    creatorParams,
    inputValues,
    onInputChange,
    handleDeploy,
}: ContractItemProps) => {
    return (
        <li className="border-b pb-4">
            <div className="flex items-center justify-between">
                <span className="font-semibold">{cont.contNm}</span>
                <button
                    onClick={onToggle}
                    className="ml-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    type="button"
                >
                    {isOpen ? "접기" : "펼치기"}
                </button>
            </div>
            {isOpen && (
                <div className="mt-2 space-y-2">
                    {creatorParams.length === 0 ? (
                        <div className="text-gray-500">생성자 파라미터 없음</div>
                    ) : (
                        creatorParams.map((param, paramIdx) => (
                            <div key={param.name || paramIdx} className="flex items-center">
                                <span className="w-32 text-gray-700">{param.name}</span>
                                <input
                                    type="text"
                                    className="flex-1 p-1 border border-gray-300 rounded ml-2"
                                    value={inputValues[paramIdx] || ""}
                                    onChange={e => onInputChange(paramIdx, e.target.value)}
                                    placeholder={param.type}
                                />
                            </div>
                        ))
                    )}
                    <button
                        className="mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        onClick={() => handleDeploy(cont, inputValues)}
                        type="button"
                    >
                        배포하기
                    </button>
                </div>
            )}
        </li>
    );
};

export default ContractItem;