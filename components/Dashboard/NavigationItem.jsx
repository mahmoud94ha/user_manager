import React from "react";

const NavigationItem = ({ active, onClick, icon, label }) => {
  return (
    <div className={`navItem ${active ? "active_tab" : ""}`} onClick={onClick}>
      {icon}
      <p>{label}</p>
    </div>
  );
};

export default NavigationItem;
