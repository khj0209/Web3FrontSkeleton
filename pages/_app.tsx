import './globals.css';
import type { AppProps } from 'next/app';
import Layout from '../components/Layout';

export default function App({ Component, pageProps }: AppProps) {
  const title = (Component as any).title || 'Dashboard';
  
  return (
    <Layout title={title}>
      <Component {...pageProps} />
    </Layout>
  );
}
