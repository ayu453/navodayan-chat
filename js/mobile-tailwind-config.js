
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            cinzel: ['"Cinzel"', 'serif'],
          },
          colors: {
            midnight: '#030813',
            surface: {
              900: '#061325',
              800: '#091c36',
              700: '#0f294d',
              card: '#0a1d37',
              pill: '#0c2344'
            },
            cyanGlow: '#00F0FF',
            goldAccent: '#E5A93C',
            emeraldOnline: '#22c55e',
          },
          boxShadow: {
            'glow-cyan': '0 0 15px -2px rgba(0, 240, 255, 0.45)',
            'glow-card': '0 4px 20px -2px rgba(0, 0, 0, 0.65)',
            'glow-cyan-sm': '0 0 8px rgba(0, 240, 255, 0.4)',
          }
        }
      }
    }
