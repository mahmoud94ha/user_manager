import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSearchParams } from "next/navigation";
import Head from "next/head";
import Logo from "@UI/icons/userLogo";
import axios from "axios";

const resetPassword = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [email, setEmail] = useState(null);

  const resetPasswordReq = async () => {
    if (email) {
      try {
        setLoading(true);
        const res = await axios.post("/api/auth/resetPassword", {
          email,
        });
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
      toast.info("If your request is valid, an email will be sent", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setTimeout(() => {
        router.push("/login");
      }, 4000);
    } else {
      toast.error("Please enter a valid email address");
    }
  };

  return (
    <>
      <Head>
        <title>UM - Reset Password</title>
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
          <p className="p24 white center">Reset Password</p>
        </div>
        <div className="diver">
        </div>
        <div className="bodyLogin">
          <form action="">
            <div
              className="col_inp l_sp"
              style={{ display: "flex" }}
            >
              <label htmlFor="email">Type your email here</label>
              <input
                type="email"
                placeholder="example@example.com"
                name="email"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

          </form>
        </div>
        <div className="footerLogin" style={{ gap: "15px" }}>
          <button
            className="btn-bleu l_sp"
            disabled={loading}
            onClick={resetPasswordReq}
          >
            Request
          </button>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default resetPassword;
