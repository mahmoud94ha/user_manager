import DataTable from "./dataTable";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { ToastContainer } from "react-toastify";

function AccountsList({ setSearchUserId, MainSetActiveTab }) {
  const { data: session } = useSession();
  const [selectedData, setSelectedData] = useState([]);
  const [tableData, setTableData] = useState([]);

  const handleSelectedData = (selectedRows) => {
    const selectedDataIds = Object.keys(selectedRows)
      .filter((rowId) => selectedRows[rowId])
      .map((rowId) => parseInt(rowId, 10));

    console.log(selectedDataIds);
    setSelectedData(selectedDataIds);
  };

  const apiEndpoint =
    session && session.user.role === "admin"
      ? "/api/admin/getAdminAccounts"
      : "/api/admin/getUserAccounts";

  return (
    <div>
      <DataTable
        apiEndpoint={apiEndpoint}
        onSelectedDataChange={handleSelectedData}
        tableData={tableData}
        setTableData={setTableData}
        currentPage={"accounts"}
        setSearchUserId={setSearchUserId}
        MainSetActiveTab={MainSetActiveTab}
      />
      <ToastContainer pauseOnFocusLoss draggable autoClose={700} />
    </div>
  );
}

export default AccountsList;
