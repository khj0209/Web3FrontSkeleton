import Link from 'next/link';

const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-gray-800 text-white p-4">
      <Link href="/" className="text-2xl block font-bold mb-6">Front Skeleton</Link>
      <nav className="space-y-4">
        <Link href="/page1" className="block hover:text-gray-300">네이티브 토큰 전송</Link>
        {/* <Link href="/page2" className="block hover:text-gray-300">페이지 2</Link> */}
        <Link href="/deploy" className="block hover:text-gray-300">컨트랙트 배포 테스트</Link>
        <Link href="/call" className="block hover:text-gray-300">컨트랙트 호출 테스트</Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
