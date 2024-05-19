import React, { useState, useEffect } from "react";
import useClientIP from '@lib/useClientIP';
import axios from "axios";

const BannedPage = () => {
    const clientIP = useClientIP();
    const [render, setRender] = useState(false);
    useEffect(async () => {
        if (clientIP) {
            try {
                const response = await axios.post("/api/user/banCheck", { re_p: clientIP });
                if (response.status === 200) {
                    window.location.href = "/";
                }
            } catch (error) {
                if (error.response.status === 403) {
                    setRender(true);
                }
                console.error();
            }
        }
    }
        , [clientIP]);
    if (render) {
        return (
            <div className="banned-container">
                <h1 className="banned-h1">You have been banned, <a href="/support">contact support</a></h1>
            </div>
        );
    }
};

export default BannedPage;