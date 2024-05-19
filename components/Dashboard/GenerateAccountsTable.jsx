import React, { useState, useMemo, useEffect } from "react";
import SearchIcon from "../UI/icons/search";

function GenerateAccountsTable({ data, toast }) {
  const [activeColumn, setActiveColumn] = useState(null);
  const [sortAscending, setSortAscending] = useState(true);
  const [searchInput, setSearchInput] = useState("");

  const handleCopyToClipboard = (item) => {
    const textToCopy = `${item.email}:${item.plainPassword}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast.success(`${textToCopy} copied to clipboard`, { autoClose: 500 });
    });
  };

  const handleSort = (column) => {
    if (activeColumn === column) {
      setSortAscending((prevSortAscending) => !prevSortAscending);
    } else {
      setActiveColumn(column);
      setSortAscending(true);
    }
  };

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.filter((item) => {
      return (
        item.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.email.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.role.toLowerCase().includes(searchInput.toLowerCase())
      );
    });
  }, [data, searchInput]);

  const sortedData = useMemo(() => {
    if (!Array.isArray(filteredData) || filteredData.length === 0) {
      return filteredData;
    }

    const sortedData = [...filteredData];

    if (activeColumn) {
      sortedData.sort((a, b) => {
        let aValue = a[activeColumn];
        let bValue = b[activeColumn];

        if (activeColumn === "createdAt") {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          if (activeColumn === "password") {
            aValue = aValue.split("").reverse().join("");
            bValue = bValue.split("").reverse().join("");
          } else {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }
        }

        const sortOrder = activeColumn === "createdAt" ? -1 : 1;

        if (aValue < bValue) return sortAscending ? -sortOrder : sortOrder;
        if (aValue > bValue) return sortAscending ? sortOrder : -sortOrder;
        return 0;
      });
    }

    return sortedData;
  }, [filteredData, activeColumn, sortAscending]);

  useEffect(() => {
    handleSort("createdAt");
  }, []);

  return (
    <div id="generateAccountTable">
      <div className="ToolsBar fl_row jc_s ai_c">
        <div className="SearchTable fl_row jc_s ai_c">
          <div className="fl_row search__">
            <SearchIcon></SearchIcon>
            <input
              type="text"
              placeholder={`Search Users (${data?.length})`}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="Table">
        <div className="TableContent fl_col">
          {sortedData.length > 0 ? (
            <>
              <div className="table_titles fl_row ai_c">
                <div
                  id="id_col"
                  className={activeColumn === "id" ? "active" : ""}
                  onClick={() => handleSort("id")}
                >
                  <p>ID</p>
                  {activeColumn === "id" && (
                    <i
                      className={`icon-sort ${
                        sortAscending ? "icon-sort-asc" : "icon-sort-desc"
                      }`}
                    ></i>
                  )}
                </div>
                <div
                  id="name_col"
                  className={activeColumn === "name" ? "active" : ""}
                  onClick={() => handleSort("name")}
                >
                  <p>Name</p>
                  {activeColumn === "name" && (
                    <i
                      className={`icon-sort ${
                        sortAscending ? "icon-sort-asc" : "icon-sort-desc"
                      }`}
                    ></i>
                  )}
                </div>
                <div
                  id="email_col"
                  className={activeColumn === "email" ? "active" : ""}
                  onClick={() => handleSort("email")}
                >
                  <p>Email</p>
                  {activeColumn === "email" && (
                    <i
                      className={`icon-sort ${
                        sortAscending ? "icon-sort-asc" : "icon-sort-desc"
                      }`}
                    ></i>
                  )}
                </div>
                <div
                  id="password_col"
                  className={activeColumn === "password" ? "active" : ""}
                  onClick={() => handleSort("password")}
                >
                  <p>Password</p>
                  {activeColumn === "password" && (
                    <i
                      className={`icon-sort ${
                        sortAscending ? "icon-sort-asc" : "icon-sort-desc"
                      }`}
                    ></i>
                  )}
                </div>
                <div
                  id="date_col"
                  className={activeColumn === "createdAt" ? "active" : ""}
                  onClick={() => handleSort("createdAt")}
                >
                  <p>createdAt</p>
                  {activeColumn === "createdAt" && (
                    <i
                      className={`icon-sort ${
                        sortAscending ? "icon-sort-asc" : "icon-sort-desc"
                      }`}
                    ></i>
                  )}
                </div>
                <div
                  id="role_col"
                  className={activeColumn === "role" ? "active" : ""}
                  onClick={() => handleSort("role")}
                >
                  <p>Role</p>
                  {activeColumn === "role" && (
                    <i
                      className={`icon-sort ${
                        sortAscending ? "icon-sort-asc" : "icon-sort-desc"
                      }`}
                    ></i>
                  )}
                </div>
              </div>
              {sortedData.map((item) => (
                <div
                  className={`table_data fl_row ai_c`}
                  key={item.id}
                  onClick={() => handleCopyToClipboard(item)}
                >
                  <div id="id_col">
                    <p>{item.id}</p>
                  </div>
                  <div id="name_col">
                    <p>{item.name}</p>
                  </div>
                  <div id="email_col">
                    <p>{item.email}</p>
                  </div>
                  <div id="password_col">
                    <p>{item.plainPassword}</p>
                  </div>
                  <div id="date_col">
                    <p>{item.createdAt}</p>
                  </div>
                  <div id="role_col">
                    <p>{item.role}</p>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <p>No results found</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default GenerateAccountsTable;
