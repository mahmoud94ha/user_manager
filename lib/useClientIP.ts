import { useState, useEffect } from "react";
import axios from "axios";

export default function useClientIP() {
  const [clientIP, setClientIP] = useState(null);

  useEffect(() => {
    const fetchIP = async () => {
      try {
        const response = await axios.get("https://httpbin.org/ip");
        setClientIP(response.data.origin);
      } catch (error) {
        console.error("Error fetching IP:", error);
        setClientIP(null);
      }
    };

    fetchIP();
  }, []);

  if (clientIP) {
    return btoa(clientIP);
  }
  return null;
}
