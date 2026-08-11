import { createUniqueId, type ComponentProps } from "solid-js"

// OPM wordmark. Block letterforms on a 24px grid, matching the pixel style of
// the brand mark. Drawn in currentColor so callers control the colour through
// text-* classes, and kept on the original 720x129 viewBox so the layout around
// it is unchanged.
export function WordmarkV2(props: Pick<ComponentProps<"svg">, "class">) {
  const mask = createUniqueId()
  const maskGradient = createUniqueId()

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 720 129"
      fill="none"
      role="img"
      aria-label="OPM"
      classList={{ [props.class ?? ""]: !!props.class }}
    >
      <g opacity="0.6">
        <g mask={`url(#${mask})`}>
          <g opacity="0.16">
            {/* O */}
            <rect x="156" y="4" width="120" height="24" fill="currentColor" />
            <rect x="156" y="28" width="24" height="24" fill="currentColor" />
            <rect x="252" y="28" width="24" height="24" fill="currentColor" />
            <rect x="156" y="52" width="24" height="24" fill="currentColor" />
            <rect x="252" y="52" width="24" height="24" fill="currentColor" />
            <rect x="156" y="76" width="24" height="24" fill="currentColor" />
            <rect x="252" y="76" width="24" height="24" fill="currentColor" />
            <rect x="156" y="100" width="120" height="24" fill="currentColor" />
            {/* P */}
            <rect x="300" y="4" width="120" height="24" fill="currentColor" />
            <rect x="300" y="28" width="24" height="24" fill="currentColor" />
            <rect x="396" y="28" width="24" height="24" fill="currentColor" />
            <rect x="300" y="52" width="120" height="24" fill="currentColor" />
            <rect x="300" y="76" width="24" height="24" fill="currentColor" />
            <rect x="300" y="100" width="24" height="24" fill="currentColor" />
            {/* M */}
            <rect x="444" y="4" width="24" height="24" fill="currentColor" />
            <rect x="540" y="4" width="24" height="24" fill="currentColor" />
            <rect x="444" y="28" width="48" height="24" fill="currentColor" />
            <rect x="516" y="28" width="48" height="24" fill="currentColor" />
            <rect x="444" y="52" width="24" height="24" fill="currentColor" />
            <rect x="492" y="52" width="24" height="24" fill="currentColor" />
            <rect x="540" y="52" width="24" height="24" fill="currentColor" />
            <rect x="444" y="76" width="24" height="24" fill="currentColor" />
            <rect x="540" y="76" width="24" height="24" fill="currentColor" />
            <rect x="444" y="100" width="24" height="24" fill="currentColor" />
            <rect x="540" y="100" width="24" height="24" fill="currentColor" />
          </g>
        </g>
      </g>
      <defs>
        <mask id={mask} style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="720" height="129">
          <rect width="720" height="129" fill={`url(#${maskGradient})`} />
        </mask>
        <linearGradient id={maskGradient} x1="360" y1="68" x2="360" y2="129" gradientUnits="userSpaceOnUse">
          <stop stop-color="white" stop-opacity="0.7" />
          <stop offset="1" stop-color="white" stop-opacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
