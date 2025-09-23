import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

export const metadata = {
  title: "Raamya Admin Panel",
  description: "Manage your Raamya store",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-black">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}