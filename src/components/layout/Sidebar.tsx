import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  TrendingUp, 
  Shield, 
  GraduationCap, 
  Home,
  X
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const getNavItems = (t: (key: string) => string) => [
  { id: "home", label: t('nav.home'), icon: Home },
  { id: "budget", label: t('nav.budget'), icon: Wallet },
  { id: "market", label: t('nav.market'), icon: TrendingUp },
  { id: "rights", label: t('nav.rights'), icon: Shield },
  { id: "learn", label: t('nav.learn'), icon: GraduationCap },
];

export function Sidebar({ isOpen, onClose, activeSection, onSectionChange }: SidebarProps) {
  const { t } = useLanguage();
  const navItems = getNavItems(t);
  
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full w-72 bg-card border-r border-border z-50 transform transition-transform duration-300 md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-b border-border md:hidden">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Navigation</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 text-left h-12",
                  isActive && "bg-gradient-primary shadow-primary"
                )}
                onClick={() => {
                  onSectionChange(item.id);
                  onClose();
                }}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
        </nav>

      </aside>
    </>
  );
}