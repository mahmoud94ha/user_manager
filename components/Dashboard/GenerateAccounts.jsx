import React, { useState, useEffect } from "react";
import axios from "axios";
import GenerateAccountsTable from "./GenerateAccountsTable";
import Popup from "reactjs-popup";
import { toast, ToastContainer } from "react-toastify";

const GenerateAccount = ({isDarkMode}) => {
  const [generatedAccount, setGeneratedAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [apiData, setApiData] = useState([]);
  const [accountName, setAccountName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const handleAdminClick = () => {
    setIsAdmin(!isAdmin);
  };

  const handleCheckboxChange = () => {
    setIsAdmin(!isAdmin);
  };

  const handleCopyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        toast.success(`${text} copied to clipboard`, { autoClose: 500 });
      });
    }
  };

  const generateAccount = async () => {
    const requestingAccount = toast.loading(
      "Requesting account, please wait..."
    );
    try {
      setIsLoading(true);
      const response = await axios.post("/api/user/accountGenerator", {
        admin: isAdmin,
        name: accountName ? accountName : null,
      });
      const data = response.data;
      setGeneratedAccount(data.account);
      toast.dismiss(requestingAccount);
      navigator.clipboard.writeText(data.account);
      toast.success("Account generated successfully and Copied to clipboard", {
        autoClose: 1500,
      });
    } catch (error) {
      console.error("Error generating account:", error);
      toast.error("Error generating account");
    } finally {
      toast.dismiss(requestingAccount);
      setIsLoading(false);
    }
  };

  const viewGeneratedAccounts = async () => {
    try {
      const accountsResponse = await axios.post(
        "/api/user/getGeneratedAccounts"
      );
      setApiData(accountsResponse.data);
      setPopupOpen(true);
    } catch (error) {
      console.error("Error fetching generated accounts:", error);
      toast.error("Error fetching generated accounts");
    }
  };

  return (
    <div className="GenerateAccount">
      <h1 style={{ color: "#51459E", fontSize: "30px" }}>Account Generator</h1>
      <div className="generator">
        <button onClick={generateAccount} disabled={isLoading}>
          {isLoading ? "Generating..." : "Generate"}
        </button>
        <input
          id="nameInput"
          style={{ cursor: "text" }}
          type="text"
          placeholder="Name (optional)"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
        />
        <input
          id="generatedAccount"
          style={{ cursor: "text" }}
          type="text"
          value={generatedAccount}
          onClick={(e) => handleCopyToClipboard(e.target.value)}
          readOnly
        />
        <div id="checkbox">
          <span onClick={handleAdminClick} style={{ cursor: "pointer" }}>
            Admin?
          </span>
          <input
            className="adminCheckbox"
            style={{ cursor: "pointer" }}
            type="checkbox"
            checked={isAdmin}
            onChange={handleCheckboxChange}
          />
        </div>
        <button className="viewBtn" onClick={viewGeneratedAccounts}>
          View Accounts
        </button>
      </div>

      <Popup
      className={isDarkMode ? "dark-theme" : ""}
        trigger={null}
        position="left center"
        contentStyle={{
          width: "80vw",
          height: "90vh",
          position: "fixed",
          backgroundColor: "green !important",
          left: "10%",
          top: "5%",
          transform: "translate(-50%, -50%)",
        }}
        onClose={() => setPopupOpen(false)}
        open={popupOpen}
      >
        <div className="PopupContent">
          <GenerateAccountsTable data={apiData} toast={toast} />
        </div>
      </Popup>

      <ToastContainer />
    </div>
  );
};

export default GenerateAccount;
