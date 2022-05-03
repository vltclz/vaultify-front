import "../styles/globals.css";
import { BigNumber, providers } from "ethers";
import axios from "axios";
import type { AppProps } from "next/app";
import { Provider, createClient } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import Header from "../components/Header";
import { useCallback, useState } from "react";
import { balanceEndpoint, chainId } from "../constants";

const client = createClient({
  connectors: [new InjectedConnector()],
  provider(config) {
    return new providers.AlchemyProvider(
      chainId,
      "tuLP0LX4w1n8kd-eoER0uUp2vD9mNYyt"
    );
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  const [balance, setBalance] = useState<number>(0);

  const refetchBalance = useCallback(async (address?: string) => {
    if (address) {
      const res = await axios.get(`${balanceEndpoint}/${address}`);
      setBalance(res.data / 10e18);
    }
  }, []);

  return (
    <Provider client={client}>
      <Header balance={balance} refetchBalance={refetchBalance} />
      <Component
        {...pageProps}
        balance={balance}
        refetchBalance={refetchBalance}
      />
    </Provider>
  );
}

export default MyApp;
