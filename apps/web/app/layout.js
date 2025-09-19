import { jsx as _jsx } from "react/jsx-runtime";
import "./globals.css";
import Providers from "./providers";
export const metadata = { title: "LifeMtrics", description: "Modern, smooth UI" };
export default function RootLayout({ children }) {
    return (_jsx("html", { lang: "en", children: _jsx("body", { className: "min-h-screen bg-white text-slate-900 dark:bg-[#0F172A] dark:text-slate-100", children: _jsx(Providers, { children: children }) }) }));
}
