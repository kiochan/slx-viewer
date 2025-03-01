import { useState, useEffect } from "react";
import { clear, load, save } from "./slx-json.store";

/**
 * 🚀 `useIndexedDbData` Hook
 * - 自动加载数据
 * - `saveData(data)` 存储数据
 * - `clearData()` 清空数据
 */
export function useSimulinkParsed() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // 初次加载数据
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const storedData = await load();
        setData(storedData);
      } catch (error) {
        console.error("Failed to fetch data from IndexedDB", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // 存储数据
  const saveData = async (newData: any) => {
    await save(newData);
    setData(newData);
  };

  // 清空数据
  const clearData = async () => {
    await clear();
    setData(null);
  };

  return { data, loading, saveData, clearData };
}
