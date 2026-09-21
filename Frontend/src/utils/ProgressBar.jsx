import React from "react";
import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const ProgressBar = ({ timeLeft, TotalTime }) => {
  const percentage = (timeLeft / TotalTime) * 100;
const getProgressColor = (percentage) => {
  if (percentage >= 70) {
    return "#22c55e"; 
  }

  if (percentage >= 35) {
    return "#f59e0b"; 
  }

  return "#ef4444"; 
};
  return (
    <>
      <CircularProgressbar
        value={percentage}
        text={`${Math.round(percentage)}s`}
        styles={buildStyles({
          rotation: 0,

          strokeLinecap: "round",

          textSize: "18px",

          pathTransitionDuration: 1.5,

          pathColor:getProgressColor(percentage),

          textColor: getProgressColor(percentage),

          trailColor: "#1e293b",
        })}
      />

      <svg style={{ height: 0 }}>
        <defs>
          <linearGradient
            id="gradientColor"
            gradientTransform="rotate(90)"
          >
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    </>
  );
};

export default ProgressBar;