'use client'

import Navbar from "./Navbar/navbar";
import { usePathname } from "next/navigation";

const AppShell = ({ children }) => {
    const pathname = usePathname();
    const disablePaths = ["/Auth", "/register"];
    const isNavbarHidden = disablePaths.includes(pathname) || pathname.startsWith("/chat/");

    return (
        <div className="flex flex-col min-h-screen">
            {!isNavbarHidden && <Navbar />}
            <main className="flex-grow">{children}</main>
        </div>
    );
};

export default AppShell;
