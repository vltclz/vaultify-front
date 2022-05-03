import { useEffect, useState } from "react";
import { useContractRead } from "wagmi";
import { contractAddress, contractABI } from "../constants";

export default function useCustomContractRead({
  method,
  args,
  preventTrigger,
}: {
  method: string;
  args?: any | any[];
  preventTrigger?: boolean;
}) {
  const [fetched, setFetched] = useState<boolean>(false);
  const contractRead = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    method,
    {
      args,
      enabled: preventTrigger ? false : !fetched,
      onSuccess() {
        setFetched(true);
      },
    }
  );

  return contractRead;
}
