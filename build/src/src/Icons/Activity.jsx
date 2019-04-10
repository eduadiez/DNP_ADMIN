import React from "react";

// MdAssessment

export default function(props) {
  const scale = props.scale || 1;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24 * scale}
      height={24 * scale}
      viewBox="3 3 18 18"
      preserveAspectRatio="xMidYMin slice"
    >
      <path fill="none" d="M0 0h24v24H0V0z" />
      <path
        fill="currentColor"
        d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"
      />
    </svg>
  );
}
