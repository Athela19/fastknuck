'use client' 

import Navbar from "./Navbar/navbar";
import Footer from "./Footer/footer";
import { usePathname } from "next/navigation";

const AppShell = ({ children }) => {
    const pathname = usePathname();
    const disablePaths = ["/Auth", "/register"];
    
    return (
        <div className="flex flex-col min-h-screen">
            {!disablePaths.includes(pathname) && <Navbar />}
            <main className="flex-grow">{children}</main>
            {!disablePaths.includes(pathname) && <Footer />}
        </div>
    );
};

export default AppShell;
