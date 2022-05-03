import Head from "next/head";
import axios from "axios";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import useCustomContractRead from "../../hooks/useCustomContractRead";
import Spinner from "../../components/Spinner";
import { buyEndpoint, priceEndpoint, vaultAddress } from "../../constants";
import { CreditProps } from "../../types";

export const getStaticPaths = async () => ({
  paths: Array(9999)
    .fill(null)
    .map((_, index) => ({ params: { tokenId: index.toString() } })),
  fallback: false,
});

export const getStaticProps = async (context: any) => {
  const tokenId = context.params.tokenId;

  return {
    props: { tokenId },
  };
};

const NFTCard = ({
  balance,
  refetchBalance,
  tokenId,
}: CreditProps & { tokenId: number }) => {
  const { data: tokenURIData } = useCustomContractRead({
    method: "tokenURI",
    args: tokenId,
    preventTrigger: tokenId === null,
  });

  const [isBuying, setIsBuying] = useState<boolean>(false);
  const [bought, setIsBought] = useState<boolean>(false);
  const [nftInfo, setNftInfo] = useState<any>();
  const [price, setPrice] = useState<number>(0);

  useEffect(() => {
    if (tokenURIData) {
      const fetchNftInfo = async () => {
        const res = await axios.get(tokenURIData.toString());
        setNftInfo(res.data);
        const resPrice = await axios.get(priceEndpoint(tokenId?.toString()));
        setPrice(resPrice.data / 10e18);
      };
      fetchNftInfo();
    }
  }, [tokenURIData, tokenId]);

  const { data: ownerOfData, refetch: refetchOwner } = useCustomContractRead({
    method: "ownerOf",
    args: tokenId,
    preventTrigger: tokenId === null,
  });

  const [tokenOwner, setTokenOwner] = useState<string | null>(null);

  useEffect(() => {
    if (ownerOfData) {
      setTokenOwner(ownerOfData.toString());
    }
  }, [ownerOfData]);

  const { data: account } = useAccount();
  const isOwnedByVault = tokenOwner === vaultAddress;
  const isOwnedByUser = tokenOwner === account?.address;
  const isBuyable = isOwnedByVault && balance >= price;

  useEffect(() => {
    if (isBuying && bought) {
      const timer = setInterval(() => {
        refetchOwner();
        refetchBalance(account?.address);
      }, 2000);
      return () => clearInterval(timer);
    }
  }, [bought, isBuying, refetchOwner, refetchBalance, account?.address]);

  useEffect(() => {
    if (tokenOwner === account?.address) {
      setIsBuying(false);
    }
  }, [tokenOwner, account?.address]);

  return (
    <>
      <Head>
        <title>LV NFT {tokenId}</title>
        <meta name="description" content="Louis Vuitton NFTs Marketplace" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="p-20 grid grid-cols-2 gap-x-6" suppressHydrationWarning>
        <div>
          <img src={nftInfo?.image} />
        </div>
        <div className="text-center self-center font-engravers px-20 grid gap-y-6">
          <div className="grid gap-y-2">
            <div className="text-7xl font-bold">{nftInfo?.name}</div>
            <div className="grid grid-cols-[auto_auto] gap-x-2 w-fit items-center m-auto text-2xl">
              <div className="font-bold">{price.toFixed(2)}</div>
              <div className="text-gray-400 font-bold">$LVETH</div>
            </div>
          </div>

          {isOwnedByUser ? (
            <div className="border-2 border-black px-10 py-3 items-center">
              You own this NFT
            </div>
          ) : (
            <button
              disabled={!isBuyable || isBuying}
              className="bg-black text-white px-10 py-3 w-40 h-12 m-auto disabled:bg-gray-300 disabled:cursor-not-allowed"
              onClick={() => {
                const buyNFT = async () => {
                  setIsBuying(true);
                  const res = await axios.get(
                    `${buyEndpoint}/${tokenId}/${account?.address}`
                  );
                  if (res.data.success) {
                    setIsBought(true);
                  } else {
                    setIsBuying(false);
                  }
                };
                buyNFT();
              }}
            >
              {isBuying ? <Spinner /> : "Buy"}
            </button>
          )}

          <div className="grid grid-cols-2 gap-6">
            {nftInfo?.attributes.map(
              (
                { trait_type, value }: { trait_type: string; value: string },
                index: number
              ) =>
                trait_type !== "tier" && (
                  <div
                    key={trait_type}
                    className={`text-xl font-bold leading-5 ${
                      index % 2 ? "text-left" : "text-right"
                    }`}
                  >
                    <div className="text-sky-500">{trait_type}</div>
                    <div>{value}</div>
                    <div className="font-light text-sm opacity-60">
                      Rarity {nftInfo?.points[trait_type]}
                    </div>
                  </div>
                )
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NFTCard;
