import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type BinanceOrder = {
  price: number;
  qty: number;
  notional: number;
};

type LiquidityZone = {
  low: number;
  high: number;
  liquidity: number;
  levels: number;
  strength: "Strong" | "Moderate" | "Light";
  distancePercent: number;
};

type LiquidityAsset = {
  symbol: string;
  baseAsset: string;

  bestBid: number;
  bestAsk: number;
  mid: number;

  spread: number;
  spreadPercent: number;

  buyLiquidity: number;
  sellLiquidity: number;
  totalLiquidity: number;

  imbalance: number;

  pressure:
    | "BUY-SIDE DOMINANT"
    | "SELL-SIDE DOMINANT"
    | "BALANCED";

  confidence: number;

  buyLiquidityPercent: number;
  sellLiquidityPercent: number;

  strongestBuyZone: LiquidityZone | null;
  strongestSellZone: LiquidityZone | null;

  bidLevels: number;
  askLevels: number;

  timestamp: number;
};

const ASSETS = [
  {
    symbol: "BTCUSDT",
    baseAsset: "BTC",
  },
  {
    symbol: "ETHUSDT",
    baseAsset: "ETH",
  },
  {
    symbol: "BNBUSDT",
    baseAsset: "BNB",
  },
  {
    symbol: "XRPUSDT",
    baseAsset: "XRP",
  },
  {
    symbol: "SOLUSDT",
    baseAsset: "SOL",
  },
  {
    symbol: "USDCUSDT",
    baseAsset: "USDC",
  },
  {
    symbol: "DOGEUSDT",
    baseAsset: "DOGE",
  },
  {
    symbol: "ADAUSDT",
    baseAsset: "ADA",
  },
  {
    symbol: "TRXUSDT",
    baseAsset: "TRX",
  },
  {
    symbol: "AVAXUSDT",
    baseAsset: "AVAX",
  },
];

const BINANCE_DEPTH_LIMIT = 20;

const BUCKET_PERCENT = 0.0025;

function safeNumber(value: unknown) {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : 0;
}

function clamp(
  value: number,
  min = 0,
  max = 100
) {
  return Math.min(
    max,
    Math.max(min, safeNumber(value))
  );
}

function buildZones(
  orders: BinanceOrder[],
  mid: number
): LiquidityZone[] {
  if (!orders.length || !mid) {
    return [];
  }

  const buckets = new Map<
    number,
    {
      low: number;
      high: number;
      liquidity: number;
      levels: number;
    }
  >();

  for (const order of orders) {
    const distance =
      Math.abs(order.price - mid) / mid;

    /*
     * Only consider liquidity within
     * 3% of the current market price.
     */
    if (distance > 0.03) {
      continue;
    }

    const bucketIndex = Math.floor(
      distance / BUCKET_PERCENT
    );

    const existing =
      buckets.get(bucketIndex);

    if (existing) {
      existing.low = Math.min(
        existing.low,
        order.price
      );

      existing.high = Math.max(
        existing.high,
        order.price
      );

      existing.liquidity +=
        order.notional;

      existing.levels += 1;
    } else {
      buckets.set(bucketIndex, {
        low: order.price,
        high: order.price,
        liquidity: order.notional,
        levels: 1,
      });
    }
  }

  const rawZones =
    [...buckets.values()];

  if (!rawZones.length) {
    return [];
  }

  const maxLiquidity =
    Math.max(
      ...rawZones.map(
        (zone) => zone.liquidity
      ),
      1
    );

  return rawZones
    .map((zone) => {
      const relativeStrength =
        zone.liquidity /
        maxLiquidity;

      const strength: LiquidityZone["strength"] =
  relativeStrength >= 0.7
    ? "Strong"
    : relativeStrength >= 0.4
    ? "Moderate"
    : "Light";

      const zoneMid =
        (zone.low + zone.high) / 2;

      const distancePercent =
        (Math.abs(zoneMid - mid) /
          mid) *
        100;

      return {
        ...zone,
        strength,
        distancePercent,
      };
    })
    .sort(
      (a, b) =>
        b.liquidity -
        a.liquidity
    );
}

async function fetchOrderBook(
  symbol: string
): Promise<{
  bids: BinanceOrder[];
  asks: BinanceOrder[];
}> {
  const response =
    await fetch(
      `https://api.binance.com/api/v3/depth?symbol=${encodeURIComponent(
        symbol
      )}&limit=${BINANCE_DEPTH_LIMIT}`,
      {
        cache: "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      `Binance request failed for ${symbol}: ${response.status}`
    );
  }

  const data =
    (await response.json()) as {
      bids?: string[][];
      asks?: string[][];
    };

  const bids =
    (data.bids ?? [])
      .map((row) => {
        const price =
          Number(row[0]);

        const qty =
          Number(row[1]);

        return {
          price,
          qty,
          notional:
            price * qty,
        };
      })
      .filter(
        (order) =>
          Number.isFinite(
            order.price
          ) &&
          Number.isFinite(
            order.qty
          ) &&
          order.price > 0 &&
          order.qty > 0
      )
      .sort(
        (a, b) =>
          b.price -
          a.price
      );

  const asks =
    (data.asks ?? [])
      .map((row) => {
        const price =
          Number(row[0]);

        const qty =
          Number(row[1]);

        return {
          price,
          qty,
          notional:
            price * qty,
        };
      })
      .filter(
        (order) =>
          Number.isFinite(
            order.price
          ) &&
          Number.isFinite(
            order.qty
          ) &&
          order.price > 0 &&
          order.qty > 0
      )
      .sort(
        (a, b) =>
          a.price -
          b.price
      );

  return {
    bids,
    asks,
  };
}

function calculateLiquidity(
  asset: {
    symbol: string;
    baseAsset: string;
  },
  orderBook: {
    bids: BinanceOrder[];
    asks: BinanceOrder[];
  }
): LiquidityAsset {
  const bestBid =
    orderBook.bids[0]?.price ?? 0;

  const bestAsk =
    orderBook.asks[0]?.price ?? 0;

  const mid =
    bestBid > 0 &&
    bestAsk > 0
      ? (bestBid + bestAsk) / 2
      : bestBid || bestAsk || 0;

  const spread =
    bestBid > 0 &&
    bestAsk > 0
      ? bestAsk - bestBid
      : 0;

  const spreadPercent =
    mid > 0
      ? (spread / mid) * 100
      : 0;

  const buyLiquidity =
    orderBook.bids.reduce(
      (sum, order) =>
        sum + safeNumber(order.notional),
      0
    );

  const sellLiquidity =
    orderBook.asks.reduce(
      (sum, order) =>
        sum + safeNumber(order.notional),
      0
    );

  const totalLiquidity =
    buyLiquidity +
    sellLiquidity;

  const imbalance =
    totalLiquidity > 0
      ? ((buyLiquidity -
          sellLiquidity) /
          totalLiquidity) *
        100
      : 0;

  const pressure =
    imbalance >= 10
      ? "BUY-SIDE DOMINANT"
      : imbalance <= -10
      ? "SELL-SIDE DOMINANT"
      : "BALANCED";

  const confidence =
    clamp(
      Math.abs(imbalance) * 2.5 +
        Math.min(
          orderBook.bids.length +
            orderBook.asks.length,
          40
        ) *
          1.25
    );

  const buyZones =
    buildZones(
      orderBook.bids,
      mid
    );

  const sellZones =
    buildZones(
      orderBook.asks,
      mid
    );

  const buyLiquidityPercent =
    totalLiquidity > 0
      ? (buyLiquidity /
          totalLiquidity) *
        100
      : 50;

  const sellLiquidityPercent =
    totalLiquidity > 0
      ? (sellLiquidity /
          totalLiquidity) *
        100
      : 50;

  return {
    symbol: asset.symbol,
    baseAsset: asset.baseAsset,

    bestBid,
    bestAsk,
    mid,

    spread,
    spreadPercent,

    buyLiquidity,
    sellLiquidity,
    totalLiquidity,

    imbalance,

    pressure,

    confidence,

    buyLiquidityPercent,
    sellLiquidityPercent,

    strongestBuyZone:
      buyZones[0] ?? null,

    strongestSellZone:
      sellZones[0] ?? null,

    bidLevels:
      orderBook.bids.length,

    askLevels:
      orderBook.asks.length,

    timestamp: Date.now(),
  };
}

export async function GET() {
  const startedAt =
    Date.now();

  const results =
    await Promise.allSettled(
      ASSETS.map(
        async (asset) => {
          const orderBook =
            await fetchOrderBook(
              asset.symbol
            );

          return calculateLiquidity(
            asset,
            orderBook
          );
        }
      )
    );

  const assets: LiquidityAsset[] =
    [];

  const errors: {
    symbol: string;
    error: string;
  }[] = [];

  results.forEach(
    (result, index) => {
      const asset =
        ASSETS[index];

      if (
        result.status ===
        "fulfilled"
      ) {
        assets.push(
          result.value
        );
      } else {
        errors.push({
          symbol:
            asset.symbol,
          error:
            result.reason instanceof
            Error
              ? result.reason.message
              : "Unknown error",
        });
      }
    }
  );

  /*
   * Keep the response useful even if
   * one exchange pair fails.
   */
  return NextResponse.json({
    assets,

    meta: {
      requestedAssets:
        ASSETS.length,

      successfulAssets:
        assets.length,

      failedAssets:
        errors.length,

      errors,

      source: "Binance Order Book",

      depthLimit:
        BINANCE_DEPTH_LIMIT,

      processingTimeMs:
        Date.now() -
        startedAt,

      timestamp:
        Date.now(),
    },
  });
}