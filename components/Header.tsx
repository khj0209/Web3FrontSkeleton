
import MetamaskButton from "./MetamaskButton";

type HeaderProps = {
  title: string;
};

const Header = ({title}: HeaderProps) => {
  return (
    <div>
    <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
      {/* <h1 className="text-xl font-semibold">{title}</h1> */}
      <h1 className="text-xl font-semibold">{title}</h1>
      <MetamaskButton />
    </header>
    </div>
  );
};

export default Header;
