import React, { useState, useEffect } from "react";
import useClientIP from '@lib/useClientIP';
import { makeApiCall } from "@lib/visitor";
import Head from "next/head";
import { setup } from "@lib/CustomCSRF";

async function Home() {
  const clientIP = await useClientIP();

  useEffect(() => {
    if (clientIP) {
      makeApiCall(clientIP, "home-page");
    }
  }, [clientIP]);

  return (
    <>
      <p style={{ color: "white" }}>Soon</p>
    </>
  );
}

export const getServerSideProps = setup(async ({ req, res }) => {
  return { props: {} };
});

export default Home;
