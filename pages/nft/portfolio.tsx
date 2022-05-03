import {
  useAccount,
  useBalance,
  useSendTransaction,
  useWaitForTransaction,
} from "wagmi";
import { BigNumber } from "ethers";
import Head from "next/head";
import { useEffect, useState } from "react";
import { BigNumberInput } from "big-number-input";
import Gallery from "../../components/Gallery";
import Spinner from "../../components/Spinner";
import { CreditProps } from "../../types";
import { vaultAddress } from "../../constants";

export default function Portfolio({ balance, refetchBalance }: CreditProps) {
  const { data: account } = useAccount();
  const { data: chainBalance } = useBalance({
    addressOrName: account?.address,
  });

  const [depositValue, setDepositValue] = useState<string>("");
  const [depositNumber, setDepositNumber] = useState<BigNumber>();
  const [loading, setLoading] = useState<boolean>(false);
  const [hash, setHash] = useState<string>();
  const [txSuccess, setTxSuccess] = useState<boolean>(false);
  const [initialBalance, setInitialBalance] = useState<number>(balance);

  const txSend = useSendTransaction({
    request: {
      to: vaultAddress,
      value: depositNumber,
    },
  });

  const txPending = useWaitForTransaction({
    hash: hash,
    enabled: !!hash,
  });

  useEffect(() => {
    if (!loading) {
      setInitialBalance(balance);
    }
  }, [balance, loading]);

  useEffect(() => {
    setDepositNumber(BigNumber.from(!!depositValue ? depositValue : "0"));
  }, [depositValue]);

  useEffect(() => {
    if (txSend.isSuccess) setHash(txSend.data?.hash);
    if (txSend.isError) setLoading(false);
  }, [txSend]);

  useEffect(() => {
    if (txPending.isSuccess) setTxSuccess(true);
    if (txPending.isError) setLoading(false);
  }, [txPending]);

  useEffect(() => {
    if (loading && initialBalance !== balance) {
      console.log("done loading");
      setLoading(false);
      setDepositValue("");
    } else if (txSuccess && loading) {
      console.log("fetching balance");
      setInitialBalance(balance);
      const timer = setInterval(() => refetchBalance(account?.address), 2000);
      return () => clearInterval(timer);
    }
  }, [
    txSuccess,
    refetchBalance,
    balance,
    loading,
    initialBalance,
    account?.address,
  ]);

  return (
    <>
      <Head>
        <title>LV NFT Portfolio</title>
        <meta name="description" content="Louis Vuitton NFT Portfolio" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {account ? (
        <div
          className="p-20 grid gap-y-10 text-center font-engravers"
          suppressHydrationWarning
        >
          <div className="grid gap-y-2">
            <div>Your LV Balance</div>
            <div className="grid grid-cols-[auto_auto] gap-x-2 w-fit items-center m-auto text-2xl">
              <div className="font-bold">{balance.toFixed(2)}</div>
              <div className="text-gray-400 font-bold">$LVETH</div>
            </div>
            <div className="grid grid-cols-[auto_auto_auto] gap-x-4 w-fit m-auto">
              {chainBalance && (
                <button
                  onClick={() =>
                    setDepositValue(chainBalance?.value.toString())
                  }
                  className="leading-4 text-right"
                >
                  <div className="underline">max</div>
                  {/* <div className="opacity-50">
                    {chainBalance.formatted.slice(0, 4)}…
                    {chainBalance.formatted.slice(-2)}
                  </div> */}
                </button>
              )}
              <BigNumberInput
                min="0"
                max={chainBalance?.value.toString()}
                placeholder="eth from wallet"
                decimals={18}
                onChange={setDepositValue}
                value={depositValue}
                renderInput={(props) => (
                  <input
                    {...props}
                    className="border border-gray-200 rounded-lg p-2 outline-none"
                  />
                )}
              />
              <button
                disabled={!depositNumber?.gt(0) || loading}
                className="bg-black text-white px-10 py-3 w-40 h-12 m-auto disabled:bg-gray-300 disabled:cursor-not-allowed"
                onClick={() => {
                  setLoading(true);
                  setTxSuccess(false);
                  txSend.sendTransaction();
                }}
              >
                {loading ? <Spinner /> : "Deposit"}
              </button>
            </div>
            <div className="">
              {txSend.isLoading && "Waiting for tx confirmation…"}
              {hash &&
                txPending.isLoading &&
                `Waiting for ${hash.slice(0, 6)}…
                    ${hash.slice(-6)} to success`}
              {txSuccess && loading && "Waiting for balance to be updated…"}
              {txSuccess && !loading && "Success!"}
            </div>
          </div>

          <div>
            <div>Your NFTS</div>
            <Gallery address={account.address ?? ""} />
          </div>
        </div>
      ) : (
        <div className="p-20 grid text-center font-engravers">
          Please connect
        </div>
      )}
    </>
  );
}
