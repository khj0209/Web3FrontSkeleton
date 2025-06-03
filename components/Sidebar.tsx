import Link from 'next/link';
import { useState } from 'react';

const Sidebar = () => {
  const [isTokenMenuOpen, setTokenMenuOpen] = useState(false);
  const [isContractMenuOpen, setContractMenuOpen] = useState(false);

  return (
    <aside className="w-64 h-screen bg-gray-800 text-white p-4">
      <Link href="/" className="text-2xl block font-bold mb-6">Front Skeleton</Link>
      <nav className="space-y-6">
        {/* 토큰 메뉴 */}
        <div>
          <h2
            className={`text-lg font-semibold mb-2 cursor-pointer p-2 rounded flex items-center justify-between ${
              isTokenMenuOpen ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
            onClick={() => setTokenMenuOpen(!isTokenMenuOpen)}
          >
            <span>토큰</span>
            <span>{isTokenMenuOpen ? '-' : '+'}</span>
          </h2>
          {isTokenMenuOpen && (
            <div className="space-y-2 pl-4">
              <Link href="/page1" className="block hover:text-gray-300">네이티브 토큰 전송</Link>
              <hr className="my-2 border-gray-600" />
              <Link href="/20/deploy" className="block hover:text-gray-300">ERC-20 Deploy</Link>
              <Link href="/20/minting" className="block hover:text-gray-300">ERC-20 Minting</Link>
              <Link href="/20/transfer" className="block hover:text-gray-300">ERC-20 Transfer</Link>
              <Link href="/20/batch" className="block hover:text-gray-300">ERC-20 Batch Transfer</Link>
              <hr className="my-2 border-gray-600" />
              <Link href="/721/deploy" className="block hover:text-gray-300">ERC-721 Deploy</Link>
              <Link href="/721/minting" className="block hover:text-gray-300">ERC-721 Minting</Link>
              <Link href="/721/transfer" className="block hover:text-gray-300">ERC-721 Transfer</Link>
              <Link href="/721/batch" className="block hover:text-gray-300">ERC-721 Batch Transfer</Link>
            </div>
            
          )}
        </div>
        {/* 컨트랙트 메뉴 */}
        <div>
          <h2
            className={`text-lg font-semibold mb-2 cursor-pointer p-2 rounded flex items-center justify-between ${
              isContractMenuOpen ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
            onClick={() => setContractMenuOpen(!isContractMenuOpen)}
          >
            <span>컨트랙트</span>
            <span>{isContractMenuOpen ? '-' : '+'}</span>
          </h2>
          {isContractMenuOpen && (
            <div className="space-y-2 pl-4">
              <Link href="/contract/upload" className="block hover:text-gray-300">Contract Upload</Link>
              <Link href="/contract/deploy" className="block hover:text-gray-300">Contract Deploy</Link>
              <Link href="/contract/call" className="block hover:text-gray-300">Contract Call</Link>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
