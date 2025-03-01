// IndexedDB 操作封装
const DB_NAME = "SLX_VIEWER";
const STORE_NAME = "slxJsonData";
const KEY = "latest"; // 存储唯一键

/** IndexedDB 读取数据 */
export async function load(): Promise<any | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = (event: any) => {
      const db = event.target.result;
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(KEY);

      getRequest.onsuccess = () => resolve(getRequest.result?.content || null);
      getRequest.onerror = () => reject("Error fetching data from IndexedDB");
    };

    request.onerror = () => reject("Error opening IndexedDB");
  });
}

/** IndexedDB 存储数据 */
export async function save(data: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onsuccess = (event: any) => {
      const db = event.target.result;
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      store.put({ id: KEY, content: data });

      resolve();
    };

    request.onerror = () => reject("Error opening IndexedDB");
  });
}

/** IndexedDB 清除数据 */
export async function clear(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onsuccess = (event: any) => {
      const db = event.target.result;
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      store.delete(KEY);

      resolve();
    };

    request.onerror = () => reject("Error opening IndexedDB");
  });
}
