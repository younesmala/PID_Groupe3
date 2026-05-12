import { Link } from 'react-router-dom'
import { useState } from 'react'

function NavbarGuestLogo({ to = '/' }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link
      to={to}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="inline-flex items-baseline gap-1.5 px-4 py-1.5 no-underline"
      style={{
        textDecoration: 'none',
        color: '#ffffff',
        marginLeft: '10px',
        borderRadius: '10px',
        transform: isHovered ? 'translateY(-2px) scale(1.01)' : 'translateY(0) scale(1)',
        boxShadow: isHovered
          ? '0 10px 22px rgba(217, 145, 29, 0.30)'
          : '0 4px 10px rgba(0, 0, 0, 0.18)',
        background: isHovered
          ? 'linear-gradient(90deg, rgba(217, 145, 29, 0.14), rgba(241, 181, 63, 0.08))'
          : 'transparent',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease',
      }}
    >
      <span
        className="font-extrabold tracking-tight"
        style={{
          color: isHovered ? '#ffe3b4' : '#ffffff',
          textTransform: 'uppercase',
          fontWeight: 900,
          fontSize: 'clamp(2.3rem, 5.5vw, 3.8rem)',
          lineHeight: 0.92,
          textShadow: isHovered ? '0 0 10px rgba(241, 181, 63, 0.28)' : 'none',
          transition: 'color 0.18s ease, text-shadow 0.18s ease',
        }}
      >
        BRUSSELS SHOW
      </span>
    </Link>
  )
}

export default NavbarGuestLogo
