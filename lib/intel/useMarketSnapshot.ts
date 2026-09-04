"use client";

import { useMemo } from "react";
import type { Coin } from "@/lib/types/coin";

import {
  buildMarketSnapshot,
  type MarketSnapshot,
} from "./buildMarketSnapshot";

export type { MarketSnapshot };

export function useMarketSnapshot(
  coins: Coin[]
): MarketSnapshot {
  return useMemo(
    () => buildMarketSnapshot(coins),
    [coins]
  );
}