import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useClientIP() {
    let clientIp = null

    const fetchIP = async () => {
        try {
            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            };
            const response = await axios.get('https://httpbin.org/ip', { headers });
            const ip = response.data.origin;
            console.log(ip);
            clientIp = ip;
        } catch (error) {
            console.error('Error fetching IP:', error);
            clientIp = null;
        }
    };
    fetchIP();
    return btoa(clientIp);
}
