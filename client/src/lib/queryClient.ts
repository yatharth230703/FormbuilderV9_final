import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>(
  urlOrOptions: string | RequestInit & { url: string },
  optionsOrNothing?: RequestInit,
): Promise<T> {
  let url: string;
  let options: RequestInit;

  // Handle both formats: apiRequest(url, options) and apiRequest({ url, ...options })
  if (typeof urlOrOptions === 'string') {
    url = urlOrOptions;
    options = optionsOrNothing || {};
  } else {
    url = urlOrOptions.url;
    const { url: _, ...rest } = urlOrOptions;
    options = rest;
  }

  // Ensure credentials are included
  options.credentials = 'include';

  const res = await fetch(url, options);
  await throwIfResNotOk(res);

  // Parse the JSON response
  const data = await res.json();
  return data as T;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
