// file: lib/CustomCSRF.ts

import { nextCsrf } from "next-csrf";

const { csrf, setup } = nextCsrf({
  // eslint-disable-next-line no-undef
  tokenKey: "usermanager",
  csrfErrorMessage: "Unauthorized [400]",
  secret: process.env.CSRF_SECRET,
});

export { csrf, setup };
