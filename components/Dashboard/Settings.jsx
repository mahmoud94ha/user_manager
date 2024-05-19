import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";

function Settings() {
  const [maxHeight, setMaxHeight] = useState();
  const [downLink, setDownLink] = useState("");
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [summaryEnabled, setSummaryEnabled] = useState(false);
  const [notificationEmail, setnotificationEmail] = useState(false);
  const [backupTimeout, setBackupTimeout] = useState(0);
  const [loading, setLoading] = useState(false);
  const [savingInProgress, setsavingInProgress] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/settings/getSettings", {
        params: { setting: "all" },
      });

      const { autoBackupEnabled, backupTimeout, summaryEnabled, userNotificationEnabled, notificationEmail } =
        response.data;
      setBackupTimeout(backupTimeout);
      setAutoBackupEnabled(autoBackupEnabled);
      setnotificationEmail(notificationEmail);
      setSummaryEnabled(summaryEnabled || false);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateFileNameWithTimestamp = (baseName) => {
    const currentDatetime = new Date();
    const timestamp = `${currentDatetime.getFullYear()}${(
      currentDatetime.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}${currentDatetime
        .getDate()
        .toString()
        .padStart(2, "0")}_${currentDatetime
          .getHours()
          .toString()
          .padStart(2, "0")}${currentDatetime
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;

    return `${baseName}_${timestamp}.sql`;
  };

  const handleBackupDatabase = async () => {
    const backRequestLoading = toast.loading(
      "Requesting database backup, please wait..."
    );
    try {
      const response = await axios.post("/api/settings/backup-database");

      if (response.status === 200) {
        const downloadLink = response.data;
        toast.dismiss(backRequestLoading);
        toast.success(
          "Database backup successful! Click 'Download' to get the backup."
        );
        setDownLink(downloadLink);
      } else {
        toast.dismiss(backRequestLoading);
        toast.error("Error backing up the database.");
      }
    } catch (error) {
      console.error("Error backing up database:", error);
      toast.dismiss(backRequestLoading);
      toast.error("An error occurred while backing up the database.");
    }
  };

  const handleDownloadDatabase = async () => {
    let resLink = null;
    if (!downLink) {
      const checkingToast = toast.loading(
        "Checking if there is a download link available, please wait..."
      );
      try {
        const last = await axios.get("/api/settings/get-database-path");
        if (last.status !== 200 || !last.data.link) {
          toast.error(
            "No download link available, please backup the database first."
          );
          toast.dismiss(checkingToast);
          return;
        }
        resLink = last.data.link;
        setDownLink(resLink);
        toast.dismiss(checkingToast);
      } catch (error) {
        toast.error(
          "No download link available, please backup the database first."
        );
        toast.dismiss(checkingToast);
        return;
      }
    }
    try {
      const response = await axios.get("/api/settings/download-database", {
        params: { path: downLink ? downLink : resLink },
        responseType: "blob",
      });

      if (response.status === 200) {
        const blob = new Blob([response.data]);

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = generateFileNameWithTimestamp("database_backup");
        link.click();

        toast.success("Database download successful!");
      } else {
        toast.error("Error downloading the database.");
      }
    } catch (error) {
      if (error.response.status === 404) {
        console.error("Error backing up database:", error);
        toast.error("File not found, try to backup again.");
      } else {
        console.error("Error backing up database:", error);
        toast.error("An error occurred while backing up the database.");
      }
    }
  };

  const handleSaveSettings = async () => {
    setsavingInProgress(true);
    try {
      const response = await axios.post("/api/settings/setSettings", {
        autoBackup: {
          autoBackupEnabled,
          backupTimeout,
        },
        summaryEnabled: summaryEnabled,
        notificationEmail: notificationEmail,
      });

      if (response.status === 200) {
        toast.success("Settings saved successfully!");
      } else {
        toast.error("Error saving settings.");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(error.response.data.error);
    } finally {
      setsavingInProgress(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setMaxHeight(window.innerHeight * 0.7);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="WebkitScroll" style={{ overflowY: "auto", maxHeight: `78vh`, }}>
      <div className="settings">
        {/* <h1 style={{ marginBottom: "0px", color: "#51459E", fontSize: "25px" }}>
          Settings
        </h1> */}
        <div className="col-1">
          <h2 style={{ marginBottom: "15px", color: "#51459E" }}>Database</h2>
          <div className="fl_row">
            <button
              className="Backup-db-btn btn"
              onClick={handleBackupDatabase}
            >
              Backup Database
            </button>
            <button
              className="down-db-btn btn"
              onClick={handleDownloadDatabase}
            >
              Download Database
            </button>
          </div>
        </div>
        <div className="col-3">
          <h2 style={{ marginBottom: "5px", color: "#51459E" }}>Notification Email</h2>
          <div className="fl_row">
            <div className="col">
              <p>Notification email :</p>
              <input
                type="text"
                value={notificationEmail}
                //disabled={loading}
                placeholder={
                  loading
                    ? "Loading..."
                    : "Enter you email here"
                }
                onChange={(e) => setnotificationEmail(e.target.value)}
              />
            </div>
          </div>
          <h2 style={{ marginBottom: "-20px", color: "#51459E" }}>
            Auto Backup
          </h2>
          <div className="fl_row">
            <div className="col colCheckbox">
              <div id="checkbox">
                <span>Enabled :</span>
                <input
                  type="checkbox"
                  disabled={loading}
                  checked={autoBackupEnabled}
                  onChange={(e) => setAutoBackupEnabled(e.target.checked)}
                />
              </div>
            </div>
            <div className="col colTimeout">
              <p>Timeout (hours) :</p>
              <input
                type="number"
                value={backupTimeout}
                placeholder={loading ? "Loading..." : ""}
                disabled={!autoBackupEnabled || loading}
                onChange={(e) => setBackupTimeout(Number(e.target.value))}
              />
            </div>
          </div>
          <h2 style={{ marginBottom: "-20px", color: "#51459E" }}>
            24 Hours Summary (Email)
          </h2>
          <div className="fl_row">
            <div className="col colCheckbox">
              <div id="checkbox">
                <span>Enabled :</span>
                <input
                  type="checkbox"
                  disabled={loading}
                  checked={summaryEnabled}
                  onChange={(e) => setSummaryEnabled(e.target.checked)}
                />
              </div>
            </div>
          </div>
          <button
            className="btn"
            onClick={handleSaveSettings}
            disabled={loading || savingInProgress}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
