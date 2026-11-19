export function ProductMark({ shape, color = "currentColor" }) {
  const paths = {
    circle: (
      <>
        <circle cx="40" cy="40" r="25" />
        <path d="M29 40h22M40 29v22" />
      </>
    ),
    bib: (
      <>
        <path d="M19 20h42v40H19z" />
        <path d="M29 31h22M29 41h16M29 51h11" />
      </>
    ),
    board: (
      <>
        <path d="M14 29q0-9 9-9h34q9 0 9 9l-4 31H18z" />
        <circle cx="25" cy="29" r="3" />
        <circle cx="55" cy="29" r="3" />
        <path d="M31 42h18" />
      </>
    ),
    stamp: (
      <>
        <path d="M27 35h26l7 22H20z" />
        <path d="M32 35V20h16v15M17 60h46" />
      </>
    ),
    trophy: (
      <>
        <path d="M28 18h24v13q0 17-12 17T28 31zM33 48v9h14v-9M27 60h26" />
        <path d="M28 23H18q0 14 11 14M52 23h10q0 14-11 14" />
      </>
    ),
    laser: (
      <>
        <path d="M18 55l13-33h31L49 55z" />
        <path d="M38 31h12M34 40h12M30 49h12" />
      </>
    ),
  };
  return (
    <svg
      className="product-mark"
      viewBox="0 0 80 80"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[shape]}
    </svg>
  );
}
