import Link from 'next/link';

const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-gray-800 text-white p-4">
      <div className="text-2xl font-bold mb-6">Front Skeleton</div>
      <nav className="space-y-4">
        <Link href="/page1" className="block hover:text-gray-300">페이지 1</Link>
        <Link href="/page2" className="block hover:text-gray-300">페이지 2</Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
