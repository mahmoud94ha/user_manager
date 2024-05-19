import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import Logo from "@UI/icons/userLogo";
import Head from "next/head";

const newPassword = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState(null);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const newPasswordReq = async () => {
    if (token) {
      try {
        setLoading(true);
        const res = await axios.post("/api/auth/newPassword", {
          token,
          password,
        });
        if (res.data.success) {
          toast.success(
            "Password reset successful, redirecting to login page...",
            {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: true,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
          setTimeout(() => {
            router.push("/login");
          }, 4000);
        }
      } catch (error) {
        console.log(error);
        if (error.response?.data?.error) {
          toast.error(error.response?.data?.error);
        }
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Verification token not found, redirecting to login page...");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
  };

  return (
    <>
      <Head>
        <title>UM - New Password</title>
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
          <p className="p24 white center">New Password</p>
        </div>
        <div className="diver">
        </div>
        <div className="bodyLogin">
          <form action="">
            <div
              className="col_inp l_sp"
              // style={{width: "5px" }}
            >
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                placeholder="Your password here"
                name="password"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Repeart your password"
                name="password"
                id="password"
                // onChange={(e) => setPassword(e.target.value)}
              />
            </div>

          </form>
        </div>
        <div className="footerLogin" style={{ gap: "15px" }}>
          <button
            className="btn-bleu l_sp"
            disabled={loading} onClick={newPasswordReq}
          >
            Confirm
          </button>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default newPassword;
