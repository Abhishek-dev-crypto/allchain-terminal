import { useEffect, useState } from "react";
import { getIntelSnapshot } from "../../lib/intel";

export function useIntel() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getIntelSnapshot().then(setData);

    const interval = setInterval(() => {
      getIntelSnapshot().then(setData);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return data;
}