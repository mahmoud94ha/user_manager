import { SessionProvider } from 'next-auth/react';
import UserActivityWrapper from '@lib/UserActivityWrapper';

import "../src/Styles/app.scss";

function MyApp({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <UserActivityWrapper Component={Component} pageProps={pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
