export default function Dotsicon() {
  return (
    <svg
      style={{
        fill: '#231f20',
        stroke: '#231f20',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: '2px'
      }}
      className="dotsicon_black"
      width="35px"
      height="35px"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="more">
        <circle cx={16} cy={16} r={2} />
        <circle cx={6} cy={16} r={2} />
        <circle cx={26} cy={16} r={2} />
      </g>
    </svg>
  );
}
