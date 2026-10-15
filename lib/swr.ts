export const fetcher = async <T = any>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${res.status}: Failed to fetch ${url}`);
  }
  return res.json();
};

export const defaultSwrConfig = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 3000,
  errorRetryCount: 3,
};
