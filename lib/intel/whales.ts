export async function getWhaleData() {
  try {
    const res = await fetch(
      `https://api.etherscan.io/api?module=account&action=txlist&address=0x0000000000000000000000000000000000000000&apikey=${process.env.ETHERSCAN_KEY}`
    );

    const data = await res.json();

    const result = data?.result;

    if (!Array.isArray(result)) {
      console.warn("Whale API invalid response:", data);
      return [];
    }

    return result
      .filter((tx: any) => Number(tx.value) > 1e18)
      .map((tx: any) => ({
        from: tx.from,
        to: tx.to,
        value: Number(tx.value) / 1e18,
        timestamp: tx.timeStamp,
      }));
  } catch (err) {
    console.error("Whale fetch error:", err);
    return [];
  }
}