import { useState } from "react";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Logo from "@UI/icons/userLogo";
import axios from "axios";
import Head from "next/head";

const SupportPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [accountEmail, setAccountEmail] = useState("");

    const sendSupportRequest = async () => {
        if (!subject || !message) {
            toast.error("Please fill in both subject and message fields.");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post("/api/user/support", { subject, message, accountEmail });
            if (res.data.success) {
                toast.success("Support request sent successfully.", {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                setSubject("");
                setMessage("");
            }
        } catch (error) {
            console.error(error);
            if (error.response?.data?.error) {
                toast.error(error.response?.data?.error);
            } else {
                toast.error("An error occurred while sending the support request.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>UM - Support</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="LogiForm">
                <div className="headerLogin">
                    <div
                        onClick={() => (window.location.href = "/")}
                        style={{ cursor: "pointer" }}
                    >
                        <Logo style={{ width: '100px', height: '100px' }} />
                    </div>
                    <p className="p24 white center">UM - Support</p>
                </div>
                <div className="diver">
                </div>
                <div className="bodyLogin">
                    <form>
                        <div className="col_inp l_sp">
                            <label htmlFor="email">Accout Email</label>
                            <input
                                type="text"
                                id="email"
                                placeholder="example@example.com"
                                value={accountEmail}
                                onChange={(e) => setAccountEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="col_inp l_sp">
                            <label htmlFor="subject">Subject</label>
                            <input
                                type="text"
                                id="subject"
                                placeholder="eg: i have been banned"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="col_inp l_sp">
                            <label htmlFor="message">Message</label>
                            <textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={loading}
                                style={{ height: '200px', paddingTop: '10px' }}
                            />
                        </div>
                    </form>
                </div>
                <div className="footerLogin" style={{ gap: "15px" }}>
                    <button
                        className="btn-bleu l_sp"
                        disabled={loading}
                        onClick={sendSupportRequest}
                    >
                        Send
                    </button>
                </div>
            </div>
            <ToastContainer />
        </>
    );
};

export default SupportPage;
