const FootballFieldBg = () => (
  <svg
    className="absolute inset-0 w-full h-full opacity-[0.04]"
    viewBox="0 0 800 500"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    {/* Outer field */}
    <rect x="50" y="30" width="700" height="440" stroke="currentColor" strokeWidth="2" />
    {/* Center line */}
    <line x1="400" y1="30" x2="400" y2="470" stroke="currentColor" strokeWidth="2" />
    {/* Center circle */}
    <circle cx="400" cy="250" r="73" stroke="currentColor" strokeWidth="2" />
    {/* Center dot */}
    <circle cx="400" cy="250" r="4" fill="currentColor" />
    {/* Left penalty box */}
    <rect x="50" y="120" width="132" height="260" stroke="currentColor" strokeWidth="2" />
    {/* Right penalty box */}
    <rect x="618" y="120" width="132" height="260" stroke="currentColor" strokeWidth="2" />
    {/* Left goal box */}
    <rect x="50" y="180" width="44" height="140" stroke="currentColor" strokeWidth="2" />
    {/* Right goal box */}
    <rect x="706" y="180" width="44" height="140" stroke="currentColor" strokeWidth="2" />
    {/* Left penalty arc */}
    <path d="M 182 210 A 73 73 0 0 1 182 290" stroke="currentColor" strokeWidth="2" />
    {/* Right penalty arc */}
    <path d="M 618 210 A 73 73 0 0 0 618 290" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export default FootballFieldBg;
