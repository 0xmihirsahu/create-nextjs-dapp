"use client";

import { useEffect, useState } from "react";
import { useActiveAccount, useReadContract, useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { client } from "../lib/client";

const contract = getContract({
  client,
  chain: sepolia,
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
});

const useGreeting = ({
  newGreeting,
  onSetGreetingSuccess,
}: {
  newGreeting?: string;
  onSetGreetingSuccess?: () => void;
}): {
  address: string | undefined;
  greeting: string | null;
  getGreetingLoading: boolean;
  getGreetingError: boolean;
  setGreeting: (() => void) | undefined;
  setGreetingLoading: boolean;
  prepareSetGreetingError: boolean;
  setGreetingError: boolean;
} => {
  const account = useActiveAccount();
  const [txSuccess, setTxSuccess] = useState(false);

  const {
    data: greeting,
    isLoading: getGreetingLoading,
    isError: getGreetingError,
    refetch: refetchGreeting,
  } = useReadContract({
    contract,
    method: "function getGreeting() view returns (string)",
    params: [],
  });

  const {
    mutate: sendTransaction,
    isPending: setGreetingLoading,
    isError: setGreetingError,
  } = useSendTransaction();

  useEffect(() => {
    if (txSuccess) {
      onSetGreetingSuccess?.();
      refetchGreeting();
      setTxSuccess(false);
    }
  }, [txSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSetGreeting = () => {
    if (!newGreeting) return;

    const transaction = prepareContractCall({
      contract,
      method: "function setGreeting(string _greeting)",
      params: [newGreeting],
    });

    sendTransaction(transaction, {
      onSuccess: () => setTxSuccess(true),
    });
  };

  return {
    address: account?.address,
    greeting: greeting as string,
    getGreetingLoading,
    getGreetingError,
    setGreeting: handleSetGreeting,
    setGreetingLoading,
    prepareSetGreetingError: newGreeting === undefined,
    setGreetingError,
  };
};

export { useGreeting };
