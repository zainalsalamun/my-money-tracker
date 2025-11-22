import { NavLink } from "@/components/NavLink";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  Target, 
  Settings,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export const Navbar = () => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const navItems = [
    { to: "/", label: t("nav.dashboard"), icon: LayoutDashboard },
    { to: "/transactions", label: t("nav.transactions"), icon: Receipt },
    { to: "/budget", label: t("nav.budget"), icon: Wallet },
    { to: "/goals", label: t("nav.goals"), icon: Target },
    { to: "/settings", label: t("nav.settings"), icon: Settings },
  ];

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end
          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-secondary/80"
          activeClassName="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => mobile && setOpen(false)}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </>
  );

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex-col p-4 gap-2">
        <div className="mb-6 px-4">
          <h1 className="text-2xl font-bold text-primary">MoneyTrack</h1>
          <p className="text-sm text-muted-foreground">Web</p>
        </div>
        <NavItems />
      </nav>

      {/* Mobile Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-primary">MoneyTrack</h1>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-4">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-primary">MoneyTrack</h1>
                <p className="text-sm text-muted-foreground">Web</p>
              </div>
              <div className="flex flex-col gap-2">
                <NavItems mobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
};
