import AppShell from "@/component/Layout/Appshel";
import "./globals.css";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppShell >
        {children}
      </AppShell>
      </body>
    </html>
  );
}
