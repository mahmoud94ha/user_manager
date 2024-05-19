import Head from "next/head";
import React, { useState, useEffect } from "react";
import Login from "../components/login/login";
import useClientIP from '@lib/useClientIP';
import { setup } from "@lib/CustomCSRF";

// import LoadingAnimation from "../components/LoadingAnimation/animation";

async function SignInPage() {
  const clientIP = await useClientIP();
  const [currentPage, setCurrentPage] = useState("Login");
  // const [isLoading, setIsLoading] = useState(false);

  const components = {
    Login: (
      <Login
        clientIP={clientIP}
      />
    ),
  };

  return (
    <div>
      {components[currentPage]}
    </div>
  );
}

export default SignInPage;
