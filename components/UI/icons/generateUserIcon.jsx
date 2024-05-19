import React from "react";

function GenerateUserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="dark_theme_circle"
        cx="9"
        cy="7"
        r="4"
        stroke="#000000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      ></circle>
      <path
        stroke="#000000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M2 21v-4a2 2 0 012-2h10a2 2 0 012 2v4M19 8v6m-3-3h6"
      ></path>
    </svg>
  );
}

export default GenerateUserIcon;