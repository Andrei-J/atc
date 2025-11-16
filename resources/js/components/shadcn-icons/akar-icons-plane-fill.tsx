import * as React from "react";
export function PlaneFillIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  className,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="m4 11l-2 4l3.408 1.363a4 4 0 0 1 2.229 2.229L9 22l4-2l-1.21-2.42a2 2 0 0 1 .679-2.56L14 14l4 7l3-4l-2.29-7.469l.715-.714c1.412-1.412 2.71-3.682 1.075-5.317s-3.91-.34-5.316 1.077l-.72.708L7 3L3 6l7 4l-1.02 1.531a2 2 0 0 1-2.56.68z"/>
    </svg>
  );
}
