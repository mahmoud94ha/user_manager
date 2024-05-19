import useUserActivity from '@lib/useUserActivity';

const UserActivityWrapper = ({ Component, pageProps }) => {
  useUserActivity();
  return <Component {...pageProps} />;
};

export default UserActivityWrapper;
