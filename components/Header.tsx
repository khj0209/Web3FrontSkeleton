
import MetamaskButton from "./MetamaskButton";
import MyWalletConnectButton from "./MyWalletConnectButton";

type HeaderProps = {
  title: string;
};

const Header = ({title}: HeaderProps) => {
  return (
    <div>
    <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
      {/* <h1 className="text-xl font-semibold">{title}</h1> */}
      <h1 className="text-xl font-semibold">{title}</h1>
      {/* <MetamaskButton /> */}
      <div className="ml-auto flex space-x-4">
          <MyWalletConnectButton />
      </div>
    </header>
    </div>
  );
};

export default Header;
