import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

type Props = {
  children: ReactNode;
  title: string;
};

const Layout = ({ children, title }: Props) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title}/>
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
