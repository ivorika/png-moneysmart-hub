import { Button } from "@/components/ui/button";
import { Menu, DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <header className="bg-card border-b border-border shadow-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMenuToggle}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <DollarSign className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">{t('header.title')}</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {t('header.subtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden sm:flex"
            onClick={() => setLanguage(language === 'en' ? 'tpi' : 'en')}
          >
            {language === 'en' ? t('header.tokPisin') : t('header.english')}
          </Button>
          <Link to="/auth">
            <Button variant="hero" size="sm">
              {t('header.getStarted')}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}