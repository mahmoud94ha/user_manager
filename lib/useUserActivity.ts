import { useEffect } from 'react';
import { useSession } from "next-auth/react";
import axios from 'axios';

const useUserActivity = () => {
    useEffect(() => {
        // console.log("what");
        let isOnline = true;
        let timeoutId;

        const updateUserStatus = async (status) => {
            try {
                await axios.post('/api/user/onlinePing', { re_o: status, re_i: await getSessions() });
            } catch (error) {
                console.error('Error updating user status:', error);
            }
        };

        const getSessions = async () => {
            try {
                const sess = await axios.get('/api/auth/session');
                if (sess.data.user.email) {
                    return sess.data.user.email;
                }
                return null;
            } catch (error) {
                console.error('Error updating user status:', error);
            }
        };

        const handleActivity = () => {
            if (!isOnline) {
                isOnline = true;
                updateUserStatus(true);
            }

            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                isOnline = false;
                updateUserStatus(false);
            }, 10000);
        };

        const events = ['mousemove', 'keydown', 'scroll'];

        events.forEach((event) => window.addEventListener(event, handleActivity));

        updateUserStatus(true);
        handleActivity();

        return () => {
            events.forEach((event) => window.removeEventListener(event, handleActivity));
            clearTimeout(timeoutId);
        };
    }, []);
};

export default useUserActivity;
