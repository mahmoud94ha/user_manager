import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useClientIP() {
    const [clientIP, setClientIP] = useState(null);

    useEffect(() => {
        const fetchIP = async () => {
            try {
                const response = await axios.get('https://api64.ipify.org?format=json');
                setClientIP(response.data.ip);
            } catch (error) {
                console.error('Error fetching IP:', error);
                setClientIP(null);
            }
        };

        fetchIP();
    }, []);

    return btoa(clientIP);
}
