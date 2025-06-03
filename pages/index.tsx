import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 관리
  const router = useRouter();

  useEffect(() => {
    // JWT 토큰 확인 (예: localStorage에서 가져오기)
    const token = sessionStorage.getItem("jwt"); // 세션 스토리지에서 JWT 가져오기
    console.log("token", token);
    if (token) {
      setIsLoggedIn(true); // 토큰이 있으면 로그인 상태로 설정
      router.push("/page1"); // /page1으로 이동
    }
  }, [router]);

  
  return (
    <div className="max-w-xl mx-auto mt-16 p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">응용 서비스 메인 페이지</h1>
      <ul className="space-y-6">
        <li>
          <span className="font-semibold text-blue-700">1. 지갑 연동 및 서명</span>
          <div className="text-gray-700 ml-2">
            지갑 서비스와 연동하여 트랜잭션 서명 및 전송을 안전하게 처리합니다.<br />
            팝업을 통해 서명 요청 및 결과를 확인할 수 있습니다.
          </div>
        </li>
        <li>
          <span className="font-semibold text-blue-700">2. 네이티브 토큰 전송</span>
          <div className="text-gray-700 ml-2">
            지갑을 통해 네이티브 토큰을 다른 주소로 전송할 수 있습니다.<br />
            주소와 금액을 입력하고 트랜잭션을 제출하면 됩니다.
          </div>
        </li>
        <li>
          <span className="font-semibold text-blue-700">3. 컨트랙트 배포</span>
          <div className="text-gray-700 ml-2">
            스마트 컨트랙트를 블록체인 네트워크에 배포할 수 있습니다.<br />
            배포 후 트랜잭션 해시와 컨트랙트 주소를 확인할 수 있습니다.
          </div>
        </li>
        <li>
          <span className="font-semibold text-blue-700">4. 컨트랙트 함수 호출</span>
          <div className="text-gray-700 ml-2">
            배포된 컨트랙트의 함수를 호출하여 데이터를 읽거나 쓸 수 있습니다.<br />
            예시: 값 저장(setValue), 값 조회(getValue) 등.
          </div>
        </li>
      </ul>
      <div className="mt-8 text-center text-gray-500 text-sm">
        좌측 또는 상단 메뉴를 통해 원하는 기능을 선택하세요.
      </div>
    </div>
  );
}
