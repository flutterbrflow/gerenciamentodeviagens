// Tailwind CSS Configuration for NativeWind
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./App.{js,jsx,ts,tsx}",
        "./src/**/*.{js,jsx,ts,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                primary: "#137fec",
                "background-light": "#f6f7f8",
                "background-dark": "#101922",
                "surface-light": "#ffffff",
                "surface-dark": "#1a242d",
            },
            fontFamily: {
                display: ["Plus Jakarta Sans", "sans-serif"],
                body: ["Noto Sans", "sans-serif"],
            },
        },
    },
    plugins: [],
}
