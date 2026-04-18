import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        slatebg: '#081520',
        slatecard: '#11283a',
        accent: '#4dd9ff',
        warm: '#ffba49'
      }
    }
  },
  plugins: []
};

export default config;
