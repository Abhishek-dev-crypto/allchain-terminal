"use client";

import { useEffect, useState } from "react";

type EdgeDirection =
  | "LONG"
  | "SHORT";

type EdgeSetup =
  | "MOMENTUM_CONTINUATION"
  | "STRUCTURE_BREAKOUT"
  | "TREND_PULLBACK"
  | "REVERSAL";

type EdgeOpportunity = {
  symbol: string;
  asset: string;

  direction: EdgeDirection;
  setup: EdgeSetup;

  edgeScore: number;
  confidence: number;

  entry: {
    low: number;
    high: number;
  };

  target: number;
  invalidation: number;

  riskReward: number;

  evidence: {
    signal1h: "BUY" | "SELL";
    signal4h: "BUY" | "SELL";

    ema:
      | "BULLISH"
      | "BEARISH";

    rsi:
      | "OVERBOUGHT"
      | "BULLISH"
      | "NEUTRAL"
      | "BEARISH"
      | "OVERSOLD";

    macd:
      | "BULLISH"
      | "BEARISH";

    volume:
      | "CONFIRMING"
      | "NORMAL";

    structure:
      | "HIGHER_HIGHS"
      | "LOWER_LOWS"
      | "RANGE";
  };

  reasons: string[];

  updatedAt: string;
};

type EdgeRejectedCandidate = {
  symbol: string;
  asset: string;

  direction: EdgeDirection;
  setup: EdgeSetup;

  entry: {
    low: number;
    high: number;
  };

  target: number;
  invalidation: number;

  riskReward: number;
  confidence: number;

  signal1h: "BUY" | "SELL";
  signal4h: "BUY" | "SELL";

  reason: "LOW_RISK_REWARD";
};

type EdgeOpportunitiesResponse = {
  opportunities: EdgeOpportunity[];

  rejectedCandidates: EdgeRejectedCandidate[];

  marketContext: {
    currentRegime:
      | "BULLISH"
      | "BEARISH"
      | "NEUTRAL"
      | "TRANSITION";

    forecastRegime:
      | "BULLISH"
      | "BEARISH"
      | "NEUTRAL"
      | "TRANSITION";

    confidence: number;
    transitionRisk: number;
  };

  assetsAnalyzed: number;
  opportunitiesFound: number;

  diagnostics: {
    insufficientData: number;
    hold1h: number;
    hold4h: number;
    timeframeDisagreement: number;
    invalidTradeLevels: number;
    lowRiskReward: number;
    validOpportunities: number;
  };

  updatedAt: string;
};

function formatPrice(
  value: number
) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  if (value >= 1000) {
    return value.toLocaleString(
      undefined,
      {
        maximumFractionDigits: 2,
      }
    );
  }

  if (value >= 1) {
    return value.toLocaleString(
      undefined,
      {
        maximumFractionDigits: 4,
      }
    );
  }

  return value.toLocaleString(
    undefined,
    {
      maximumSignificantDigits: 6,
    }
  );
}

function formatSetup(
  setup: EdgeSetup
) {
  return setup
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

function regimeLabel(
  regime:
    | "BULLISH"
    | "BEARISH"
    | "NEUTRAL"
    | "TRANSITION"
) {
  return regime
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

function EvidenceItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/[0.04] py-2 last:border-b-0">
      <span className="text-[10px] uppercase tracking-[0.12em] text-white/30">
        {label}
      </span>

      <span className="text-[11px] font-medium text-white/70">
        {value}
      </span>
    </div>
  );
}

function ScoreBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const safeValue = Math.max(
    0,
    Math.min(100, value)
  );

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-[0.14em] text-white/30">
          {label}
        </span>

        <span className="text-[10px] text-white/60">
          {safeValue}
        </span>
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-white/40 transition-all"
          style={{
            width: `${safeValue}%`,
          }}
        />
      </div>
    </div>
  );
}

export default function EdgeOpportunities() {
  const [
    data,
    setData,
  ] =
    useState<EdgeOpportunitiesResponse | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await fetch(
            "/api/intelligence/edge-opportunities",
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            "Edge opportunities unavailable"
          );
        }

        const result =
          (await response.json()) as EdgeOpportunitiesResponse;

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        console.error(
          "Edge Opportunities UI Error:",
          err
        );

        if (!cancelled) {
          setError(
            "Unable to load edge opportunities"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="rounded-2xl border border-white/[0.06] bg-black/20 p-5">
        <div className="mb-5">
          <div className="h-4 w-40 animate-pulse rounded bg-white/[0.06]" />

          <div className="mt-2 h-3 w-64 animate-pulse rounded bg-white/[0.04]" />
        </div>

        <div className="h-64 animate-pulse rounded-xl bg-white/[0.03]" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-white/[0.06] bg-black/20 p-5">
        <div className="text-sm text-white/60">
          {error}
        </div>

        <div className="mt-2 text-[10px] text-white/25">
          The intelligence engine did not
          return a valid response.
        </div>
      </section>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <section className="space-y-4">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-white/70" />

            <h2 className="text-sm font-semibold tracking-wide text-white">
              Edge Opportunities
            </h2>
          </div>

          <p className="mt-1 text-[10px] text-white/35">
            Model-ranked asymmetric trade setups
            from live market intelligence.
          </p>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-[9px] uppercase tracking-[0.14em] text-white/25">
            Universe
          </div>

          <div className="mt-1 text-xs text-white/60">
            {data.assetsAnalyzed} assets
          </div>
        </div>
      </div>

      {/* =====================================================
          MARKET CONTEXT
      ===================================================== */}

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3">
          <div className="text-[9px] uppercase tracking-[0.12em] text-white/25">
            Current Regime
          </div>

          <div className="mt-2 text-sm font-medium text-white/75">
            {regimeLabel(
              data.marketContext.currentRegime
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3">
          <div className="text-[9px] uppercase tracking-[0.12em] text-white/25">
            7D Outlook
          </div>

          <div className="mt-2 text-sm font-medium text-white/75">
            {regimeLabel(
              data.marketContext.forecastRegime
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3">
          <div className="text-[9px] uppercase tracking-[0.12em] text-white/25">
            Model Confidence
          </div>

          <div className="mt-2 text-sm font-medium text-white/75">
            {data.marketContext.confidence}
            <span className="ml-1 text-[10px] text-white/25">
              /100
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3">
          <div className="text-[9px] uppercase tracking-[0.12em] text-white/25">
            Transition Risk
          </div>

          <div className="mt-2 text-sm font-medium text-white/75">
            {data.marketContext.transitionRisk}
            <span className="ml-1 text-[10px] text-white/25">
              /100
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          OPPORTUNITIES
      ===================================================== */}

      {data.opportunities.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-8 text-center">
          <div className="text-sm text-white/65">
            No qualifying opportunities
          </div>

          <div className="mx-auto mt-2 max-w-md text-[10px] leading-relaxed text-white/30">
            The engine found no setup that
            currently satisfies its directional,
            structural, and risk/reward
            requirements.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {data.opportunities.map(
            (opportunity) => (
              <article
                key={`${opportunity.symbol}-${opportunity.updatedAt}`}
                className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/25"
              >
                {/* TOP */}
                <div className="border-b border-white/[0.06] p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xl font-semibold text-white">
                          {opportunity.asset}
                        </span>

                        <span className="text-[10px] text-white/25">
                          {opportunity.symbol}
                        </span>

                        <span
                          className={`rounded-md border px-2 py-1 text-[9px] font-semibold tracking-[0.1em] ${
                            opportunity.direction ===
                            "LONG"
                              ? "border-white/15 bg-white/[0.05] text-white/75"
                              : "border-white/10 bg-white/[0.025] text-white/65"
                          }`}
                        >
                          {opportunity.direction}
                        </span>

                        <span className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[9px] tracking-wide text-white/40">
                          {formatSetup(
                            opportunity.setup
                          )}
                        </span>
                      </div>

                      <div className="mt-2 text-[10px] text-white/30">
                        Ranked from multi-timeframe
                        technical and structural
                        evidence.
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5 lg:text-right">
                      <div>
                        <div className="text-[9px] uppercase tracking-[0.14em] text-white/25">
                          Edge Score
                        </div>

                        <div className="mt-1 text-2xl font-semibold text-white/85">
                          {opportunity.edgeScore}
                        </div>

                        <div className="text-[9px] text-white/25">
                          /100
                        </div>
                      </div>

                      <div>
                        <div className="text-[9px] uppercase tracking-[0.14em] text-white/25">
                          Confidence
                        </div>

                        <div className="mt-1 text-2xl font-semibold text-white/75">
                          {opportunity.confidence}
                        </div>

                        <div className="text-[9px] text-white/25">
                          /100
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TRADE LEVELS */}
                <div className="grid grid-cols-2 gap-px bg-white/[0.05] lg:grid-cols-4">
                  <div className="bg-black/30 p-4">
                    <div className="text-[9px] uppercase tracking-[0.13em] text-white/25">
                      Entry
                    </div>

                    <div className="mt-2 text-sm font-medium text-white/75">
                      {formatPrice(
                        opportunity.entry.low
                      )}

                      <span className="mx-1 text-white/20">
                        —
                      </span>

                      {formatPrice(
                        opportunity.entry.high
                      )}
                    </div>
                  </div>

                  <div className="bg-black/30 p-4">
                    <div className="text-[9px] uppercase tracking-[0.13em] text-white/25">
                      Target
                    </div>

                    <div className="mt-2 text-sm font-medium text-white/75">
                      {formatPrice(
                        opportunity.target
                      )}
                    </div>
                  </div>

                  <div className="bg-black/30 p-4">
                    <div className="text-[9px] uppercase tracking-[0.13em] text-white/25">
                      Invalidation
                    </div>

                    <div className="mt-2 text-sm font-medium text-white/75">
                      {formatPrice(
                        opportunity.invalidation
                      )}
                    </div>
                  </div>

                  <div className="bg-black/30 p-4">
                    <div className="text-[9px] uppercase tracking-[0.13em] text-white/25">
                      Risk / Reward
                    </div>

                    <div className="mt-2 text-sm font-semibold text-white/85">
                      {opportunity.riskReward.toFixed(
                        2
                      )}
                      :1
                    </div>
                  </div>
                </div>

                {/* LOWER */}
                <div className="grid gap-5 p-5 lg:grid-cols-[1.2fr_1fr]">
                  {/* EVIDENCE */}
                  <div>
                    <div className="mb-2 text-[9px] uppercase tracking-[0.15em] text-white/25">
                      Evidence
                    </div>

                    <div className="rounded-xl border border-white/[0.05] bg-white/[0.01] px-3">
                      <EvidenceItem
                        label="1H Signal"
                        value={
                          opportunity.evidence
                            .signal1h
                        }
                      />

                      <EvidenceItem
                        label="4H Signal"
                        value={
                          opportunity.evidence
                            .signal4h
                        }
                      />

                      <EvidenceItem
                        label="EMA"
                        value={
                          opportunity.evidence
                            .ema
                        }
                      />

                      <EvidenceItem
                        label="RSI"
                        value={
                          opportunity.evidence
                            .rsi
                        }
                      />

                      <EvidenceItem
                        label="MACD"
                        value={
                          opportunity.evidence
                            .macd
                        }
                      />

                      <EvidenceItem
                        label="Volume"
                        value={
                          opportunity.evidence
                            .volume
                        }
                      />

                      <EvidenceItem
                        label="Structure"
                        value={
                          opportunity.evidence
                            .structure
                        }
                      />
                    </div>
                  </div>

                  {/* SCORE + REASONS */}
                  <div>
                    <div className="mb-3 text-[9px] uppercase tracking-[0.15em] text-white/25">
                      Model Output
                    </div>

                    <div className="space-y-3">
                      <ScoreBar
                        label="Edge Score"
                        value={
                          opportunity.edgeScore
                        }
                      />

                      <ScoreBar
                        label="Confidence"
                        value={
                          opportunity.confidence
                        }
                      />

                      <div className="pt-2">
                        <div className="mb-2 text-[9px] uppercase tracking-[0.15em] text-white/25">
                          Why it qualifies
                        </div>

                        <div className="space-y-2">
                          {opportunity.reasons.map(
                            (
                              reason,
                              index
                            ) => (
                              <div
                                key={`${reason}-${index}`}
                                className="flex gap-2 text-[10px] leading-relaxed text-white/45"
                              >
                                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-white/30" />

                                <span>
                                  {reason}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="flex flex-col gap-2 border-t border-white/[0.05] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-[9px] text-white/20">
                    Model-ranked setup · not a
                    guaranteed outcome
                  </span>

                  <span className="text-[9px] text-white/20">
                    Updated{" "}
                    {new Date(
                      opportunity.updatedAt
                    ).toLocaleTimeString()}
                  </span>
                </div>
              </article>
            )
          )}
        </div>
      )}

      {/* =====================================================
          DIAGNOSTICS
      ===================================================== */}

      <div className="rounded-xl border border-white/[0.05] bg-white/[0.01] p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[9px] uppercase tracking-[0.15em] text-white/25">
            Engine Diagnostics
          </div>

          <div className="text-[9px] text-white/20">
            {data.opportunitiesFound} qualifying
            setup
            {data.opportunitiesFound === 1
              ? ""
              : "s"}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
          <div>
            <div className="text-sm text-white/65">
              {data.diagnostics.insufficientData}
            </div>

            <div className="text-[9px] text-white/25">
              Insufficient data
            </div>
          </div>

          <div>
            <div className="text-sm text-white/65">
              {data.diagnostics.hold1h}
            </div>

            <div className="text-[9px] text-white/25">
              HOLD 1H
            </div>
          </div>

          <div>
            <div className="text-sm text-white/65">
              {data.diagnostics.hold4h}
            </div>

            <div className="text-[9px] text-white/25">
              HOLD 4H
            </div>
          </div>

          <div>
            <div className="text-sm text-white/65">
              {
                data.diagnostics
                  .timeframeDisagreement
              }
            </div>

            <div className="text-[9px] text-white/25">
              TF disagreement
            </div>
          </div>

          <div>
            <div className="text-sm text-white/65">
              {
                data.diagnostics
                  .lowRiskReward
              }
            </div>

            <div className="text-[9px] text-white/25">
              Low R:R
            </div>
          </div>

          <div>
            <div className="text-sm text-white/65">
              {
                data.diagnostics
                  .validOpportunities
              }
            </div>

            <div className="text-[9px] text-white/25">
              Valid
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}