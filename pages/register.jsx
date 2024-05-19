import Head from "next/head";
import React, { useState, useEffect } from "react";
import Register from "../components/register/register";
import getSession from "@lib/getSession";
import useClientIP from '@lib/useClientIP';
import { setup } from "@lib/CustomCSRF";

// import LoadingAnimation from "../components/LoadingAnimation/animation";

async function RegisterPage() {
  const clientIP = await useClientIP();
  const [currentPage, setCurrentPage] = useState("register");
  const session = getSession();
  // const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) {
      window.location.href = "/";
    }
  }, [session]);


  const components = {
    register: (
      <Register
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

export default RegisterPage;
