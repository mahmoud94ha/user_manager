import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useClientIP() {
    const [clientIP, setClientIP] = useState(null);

    useEffect(() => {
        const fetchIP = async () => {
            try {
                const headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                };
                const response = await axios.get('https://httpbin.org/ip', { headers });
                const ip = response.data.origin;
                setClientIP(ip);
            } catch (error) {
                console.error('Error fetching IP:', error);
                setClientIP(null);
            }
        };

        fetchIP();
    }, []);

    return btoa(clientIP);
}
