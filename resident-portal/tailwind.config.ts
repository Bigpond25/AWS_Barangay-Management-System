// tailwind.config.ts
import type { Config } from "tailwindcss";

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#F3F8FB",
          100: "#E6F0F7",
          200: "#C2DBEC",
          300: "#9DC6E1",
          400: "#6FA7CF",
          500: "#4887B7", // base
          600: "#35648A",
          700: "#284B67",
          800: "#1D364B",
          900: "#12212E",
        },
      },
    },
  },
};
