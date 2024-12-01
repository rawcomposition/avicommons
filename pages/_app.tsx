import type { AppProps } from "next/app";
import "../styles/globals.css";
import Header from "components/Header";
import { Toaster } from "react-hot-toast";
import NextNProgress from "nextjs-progressbar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { get } from "lib/helpers";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => get(queryKey[0] as string, (queryKey[1] || {}) as any),
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster containerStyle={{ zIndex: 10001 }} />
      <Header />
      <NextNProgress height={1} />
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}

export default MyApp;
