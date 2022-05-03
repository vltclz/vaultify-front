import { useAccount, useConnect, useEnsName } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { useRouter } from "next/router";
import { FaWallet, FaChevronLeft } from "react-icons/fa";
import Link from "next/link";
import { CreditProps } from "../types";
import { useEffect } from "react";

const Header = ({ balance, refetchBalance }: CreditProps) => {
  const { data: account } = useAccount();
  const { data: ensName } = useEnsName({ address: account?.address });
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const connected = ensName ?? account?.address ?? "";
  const router = useRouter();

  const showMarketplaceButton = router.pathname !== "/nft";

  useEffect(() => {
    refetchBalance(account?.address);
  }, [account, refetchBalance]);

  return (
    <div
      className="h-20 grid grid-cols-3 items-center py-3 px-20"
      suppressHydrationWarning
    >
      <div>
        {showMarketplaceButton && (
          <Link passHref href="/nft">
            <div className=" w-fit grid grid-cols-[auto_auto] gap-x-2 items-center cursor-pointer">
              <FaChevronLeft />
              <div className="font-engravers">Marketplace</div>
            </div>
          </Link>
        )}
      </div>
      <div>
        <img
          className="m-auto w-60"
          src="https://www.louisvuitton.com/images/is/image/lv/brand-logo-louis-vuitton-logo"
        />
      </div>

      <div className="text-center justify-self-end">
        {account ? (
          <div className="grid grid-cols-[auto_auto] gap-x-10 border-2 border-black px-6 py-3 items-center">
            <Link href="/nft/portfolio" passHref>
              <div className="opacity-80 cursor-pointer text-sm">
                {connected.slice(0, 5)}…{connected.slice(-3)}
              </div>
            </Link>
            {/* <div className="text-lg">|</div> */}
            <div className="grid grid-cols-[auto_auto] gap-x-2 w-fit items-center m-auto font-engravers">
              <div className="font-bold">{balance.toFixed(2)}</div>
              <div className="text-gray-400 font-bold">$LVETH</div>
            </div>
          </div>
        ) : (
          <button
            className="bg-black w-fit text-white px-10 py-3 grid grid-cols-[auto_auto] gap-x-4 items-center font-engravers"
            onClick={() => connect()}
          >
            <FaWallet />
            <div>Connect Wallet</div>
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
