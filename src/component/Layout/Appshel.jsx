'use client' 

import Navbar from "./Navbar/navbar";
import { usePathname } from "next/navigation";

const AppShell = ({ children }) => {
    const pathname = usePathname();
    const disablePaths = ["/Auth", "/register"];
    
    return (
        <div className="flex flex-col min-h-screen">
            {!disablePaths.includes(pathname) && <Navbar />}
            <main className="flex-grow">{children}</main>
        </div>
    );
};

export default AppShell;
