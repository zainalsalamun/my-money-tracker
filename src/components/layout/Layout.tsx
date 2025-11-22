import { Navbar } from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="md:ml-64 pt-16 md:pt-0 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
};
