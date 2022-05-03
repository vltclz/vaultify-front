import Head from "next/head";
import { vaultAddress } from "../../constants";
import Gallery from "../../components/Gallery";

export default function Marketplace() {
  return (
    <>
      <Head>
        <title>LV NFTs</title>
        <meta name="description" content="Louis Vuitton NFTs Marketplace" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Gallery address={vaultAddress} />
    </>
  );
}
