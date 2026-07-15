tailwind.config = {
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FBF7EC', 100: '#F5ECD5', 200: '#E9D5A8', 300: '#DDBD7B',
          400: '#C9A84C', 500: '#B8953A', 600: '#9A7A2E', 700: '#7D6224',
          800: '#5E4A1C', 900: '#3F3214'
        },
        ink: {
          50: '#f7f7f7', 100: '#e8e8e8', 200: '#d1d1d1', 300: '#b0b0b0',
          400: '#888888', 500: '#6d6d6d', 600: '#5d5d5d', 700: '#4f4f4f',
          800: '#3d3d3d', 900: '#1c1c1c', 950: '#0a0a0a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif']
      },
      letterSpacing: {
        luxury: '0.22em',
        wide2: '0.12em'
      },
      maxWidth: { '8xl': '88rem' },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.16, 1, 0.3, 1)'
      }
    }
  }
};
