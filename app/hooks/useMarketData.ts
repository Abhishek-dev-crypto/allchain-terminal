"use client";

import useSWR from "swr";
import type { Coin } from "@/lib/types/coin";

const fetcher = async (url: string): Promise<Coin[]> => {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch market data");
  }

  return res.json();
};

export function useMarketData() {
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<Coin[]>("/api/market", fetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 30_000,
    keepPreviousData: true,
  });

  return {
    data: data ?? [],
    isLoading,
    error,
    isValidating,
    refresh: mutate,
  };
}