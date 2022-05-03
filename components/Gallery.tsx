import axios from "axios";
import { BigNumber } from "ethers";
import { useState, useEffect } from "react";
import Link from "next/link";
import useCustomContractRead from "../hooks/useCustomContractRead";
import { priceEndpoint } from "../constants";

export default function Gallery({ address }: { address: string }) {
  const [wallet, setWallet] = useState<BigNumber[]>([]);
  const { data, isFetched } = useCustomContractRead({
    method: "walletOfOwner",
    args: address,
  });

  useEffect(() => {
    if (data) {
      setWallet(data as BigNumber[]);
    }
  }, [data]);

  return isFetched && wallet.length === 0 ? (
    <div className="text-center p-20 opacity-50" suppressHydrationWarning>
      {"No NFT to display"}
    </div>
  ) : (
    <div
      className="p-10 grid grid-cols-4 gap-x-4 gap-y-2"
      suppressHydrationWarning
    >
      {wallet.map((tokenId) => (
        <NFTCard key={tokenId.toNumber()} tokenId={tokenId.toNumber()} />
      ))}
    </div>
  );
}

const NFTCard = ({ tokenId }: { tokenId: number | null }) => {
  const { data } = useCustomContractRead({
    method: "tokenURI",
    args: tokenId,
    preventTrigger: tokenId === null,
  });

  const [nftInfo, setNftInfo] = useState<any>();
  const [price, setPrice] = useState<number>(0);

  useEffect(() => {
    if (data) {
      const fetchNftInfo = async () => {
        const res = await axios.get(data.toString());
        setNftInfo(res.data);
        const resPrice = await axios.get(priceEndpoint(tokenId?.toString()));
        setPrice(resPrice.data / 10e18);
      };
      fetchNftInfo();
    }
  }, [data, tokenId]);

  return (
    <Link href={`/nft/${tokenId}`} passHref>
      <div
        className="w-fit p-10 text-center grid gap-y-3 font-engravers cursor-pointer"
        suppressHydrationWarning
      >
        <div className="relative h-48 w-48">
          {nftInfo && <img src={nftInfo?.image} />}
        </div>
        <div className="grid gap-y-1">
          <div>{nftInfo?.name}</div>
          <div className="grid grid-cols-2 w-fit items-center m-auto">
            <div className="font-bold">{price.toFixed(2)}</div>
            <div className="text-gray-400 font-bold">$LVETH</div>
          </div>
        </div>
      </div>
    </Link>
  );
};
