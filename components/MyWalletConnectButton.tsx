import React from "react";
import { useEffect, useState } from "react";

export function loginWithWalletService(): Promise<string> {
  const WALLET_SERVICE_ORIGIN = process.env.NEXT_PUBLIC_WALLET_ORIGIN;
  const REDIRECT_URI = window.location.origin;
  
  return new Promise((resolve, reject) => {
    // 로그인 URL에 redirect_uri 쿼리 추가
    const loginUrl = `${WALLET_SERVICE_ORIGIN}/login?redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    const popup = window.open(loginUrl, '_blank', 'width=400,height=600');

    // 팝업이 열리지 않은 경우
    if (!popup) {
      return reject(new Error('팝업 차단됨: 팝업을 허용해주세요.'));
    }

    // postMessage 수신 핸들러
    function handleMessage(event: MessageEvent) {
      if (event.origin !== WALLET_SERVICE_ORIGIN) return;
      const { type, jwt, error } = event.data as Record<string, any>;
      
      if (type === 'LOGIN_SUCCESS' && jwt) {
        cleanup();
        resolve(jwt);
      } else if (type === 'LOGIN_FAILURE') {
        cleanup();
        reject(new Error(error || '로그인 실패'));
      }
    }

    // 팝업 닫힘 감지 및 cleanup
    const checkPopupClosed = setInterval(() => {
      if (popup.closed) {
        cleanup();
        reject(new Error('로그인 팝업이 닫혔습니다.'));
      }
    }, 500);

    function cleanup() {
      clearInterval(checkPopupClosed);
      window.removeEventListener('message', handleMessage);
      if (popup && !popup.closed) popup.close();
    }

    window.addEventListener('message', handleMessage);
  });
}

const MyWalletConnectButton = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 관리

  // 비동기 초기화
  useEffect(() => {
    const storedAccount = sessionStorage.getItem('account');
    if (storedAccount) {
      setAccount(storedAccount);
      setIsLoggedIn(true); // 로그인 상태 업데이트
    }
  }, []);

  const [isLoading, setLoading] = useState(false);
  const [jwt, setJwt] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const token = await loginWithWalletService();
      console.log('JWT:', token);
      setJwt(token);
      // TODO: 로컬 스토리지나 전역 상태에 JWT 저장
      console.log('JWT:', token);
      verifyJwt(token); // JWT 검증
      setIsLoggedIn(true); // 로그인 상태 업데이트
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // 로그아웃 처리 로직
    // alert로 로그아웃 여부 확인
    const confirmLogout = window.confirm("정말 로그아웃 하시겠습니까?");
    if (!confirmLogout) return; // 사용자가 취소하면 아무 작업도 하지 않음
    setAccount(null);
    setIsLoggedIn(false); // 로그인 상태 업데이트
    sessionStorage.removeItem('account'); // 세션 스토리지에서 계정 정보 제거
    sessionStorage.removeItem('jwt'); // 세션 스토리지에서 JWT 제거
  }


  const verifyJwt = async (jwt: string) => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL+'/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${jwt}`,
        },
        body: JSON.stringify({ jwt }),
      });
      const data = await response.json();
      if (data && data.address) {
        setAccount(data.address);
        sessionStorage.setItem('account', data.address); // 세션 스토리지에 저장
        sessionStorage.setItem('jwt', jwt); // 세션 스토리지에 JWT 저장
      } else {
        console.error('Response body or address is null');
      }
      if (!response.ok) {
        throw new Error('JWT verification failed');
      }
    } catch (error) {
      console.error('Error verifying JWT:', error);
    }
  }


  return (
    <button 
      onClick={isLoggedIn? handleLogout : handleLogin}
      disabled={isLoading} 
      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
    >
      {account ? `${account.slice(0,6)}...${account.slice(-4)}` : "1Q Wallet 으로 로그인"}
    </button>
  );
};

export default MyWalletConnectButton;
