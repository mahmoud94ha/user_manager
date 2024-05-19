import React from "react";

const LoadingAnimation = ({ className }) => {
  return (
    <div className={`loaderContainer ${className}`}>
      <div className="loader"></div>
    </div>
  );
};

export default LoadingAnimation;
