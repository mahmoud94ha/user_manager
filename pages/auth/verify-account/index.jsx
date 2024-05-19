import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSearchParams } from "next/navigation";
import Logo from "@UI/icons/userLogo";
import axios from "axios";
import Head from "next/head";

const verifyAccount = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const newVerification = async () => {
    if (token) {
      try {
        setLoading(true);
        const res = await axios.post("/api/auth/newVerification", { token });
        if (res.data.success) {
          toast.success(
            "Verification successful, redirecting to login page...",
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
        <title>UM - Verify Account</title>
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
          <p className="p24 white center">Verify your Account</p>
        </div>
        <div className="diver">
        </div>
        <div className="bodyLogin">
          <form action="">
            <div
              className="col_inp l_sp"
              // style={{width: "5px" }}
            >
              <label htmlFor="email">Press the button bellow to verify your account</label>
            </div>

          </form>
        </div>
        <div className="footerLogin" style={{ gap: "15px" }}>
          <button
            className="btn-bleu l_sp"
            disabled={loading} onClick={newVerification}
          >
            Verify account
          </button>
        </div>
      </div>
      <ToastContainer />
    </>
  );

};

export default verifyAccount;
