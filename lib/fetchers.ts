// utils/fetchers.ts
export const fetchCoinData = async (coinId: string) => {
    const res = await fetch(`/api/coins?coinId=${coinId}`);
    if (!res.ok) throw new Error('Failed to fetch coin data');
    return res.json();
  };
  