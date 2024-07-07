const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter var", "Inter", ...defaultTheme.fontFamily.sans],
            },
            colors: {
                primary: {
                    500: "#3d7af5",
                    400: "#6194f9",
                    300: "#92b5fc"
                }
            }
        },
    },
    plugins: [],
};
