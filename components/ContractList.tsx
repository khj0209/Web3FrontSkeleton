import { useState } from "react";
import ContractItem from "./ContractItem";
import axios from "axios";

type ContractListProps = {
    contractList: any[];
    handleDeploy: (cont: any, params: string[]) => void;
};

const ContractList = ({ contractList, handleDeploy }: ContractListProps) => {
    const [openId, setOpenId] = useState<string | null>(null);
    const [creatorParams, setCreatorParams] = useState<{ [contId: string]: any[] }>({});
    const [inputValues, setInputValues] = useState<{ [contId: string]: string[] }>({});

    // 펼치기 버튼 클릭 시 파라미터 조회
    const handleToggle = async (cont: any) => {
        if (openId === cont.contId) {
            setOpenId(null);
            return;
        }
        if (!creatorParams[cont.contId]) {
            const params = await axios
                .post(process.env.NEXT_PUBLIC_BACKEND_URL + "/contracts/contract/cretr-paras/get", { contId: cont.contId })
                .then(res => res.data.code === "SUCCESS" ? res.data.data : [])
                .catch(() => []);
            setCreatorParams(prev => ({ ...prev, [cont.contId]: params }));
            setInputValues(prev => ({ ...prev, [cont.contId]: params.map(() => "") }));
        }
        setOpenId(cont.contId);
    };

    // 입력값 변경
    const handleInputChange = (contId: string, paramIdx: number, value: string) => {
        setInputValues(prev => ({
            ...prev,
            [contId]: prev[contId].map((v, i) => i === paramIdx ? value : v)
        }));
    };

    return (
        <ul className="space-y-4">
            {contractList.map((cont) => (
                <ContractItem
                    key={cont.contId}
                    cont={cont}
                    isOpen={openId === cont.contId}
                    onToggle={() => handleToggle(cont)}
                    creatorParams={creatorParams[cont.contId] || []}
                    inputValues={inputValues[cont.contId] || []}
                    onInputChange={(paramIdx, value) => handleInputChange(cont.contId, paramIdx, value)}
                    handleDeploy={handleDeploy}
                />
            ))}
        </ul>
    );
};

export default ContractList;