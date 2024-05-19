import { useState, useEffect } from 'react';
import axios from 'axios';

export default async function useClientIP() {
    try {
        const response = await axios.get('https://httpbin.org/ip');
        const ip = response.data.origin;
        return btoa(ip);
    } catch (error) {
        console.error('Error fetching IP:', error);
        return btoa(null);
    }
}
