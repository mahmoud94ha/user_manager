import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useClientIP() {
    async function getIp() {
        try {
            const response = await axios.get('https://httpbin.org/ip');
            const ip = response.data.origin;
            return ip;
        } catch (error) {
            console.error('Error fetching IP:', error);
            return null;
        }
    }
    getIp()
}
