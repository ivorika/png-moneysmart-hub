import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Shield, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeroSectionProps {
  onSectionChange?: (section: string) => void;
}

export function HeroSection({ onSectionChange }: HeroSectionProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleStartBudgetJourney = () => {
    if (!user) {
      navigate("/auth");
    } else if (onSectionChange) {
      onSectionChange("budget");
    }
  };

  const handleExploreMarketPrices = () => {
    if (onSectionChange) {
      onSectionChange("market");
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <div className="text-center py-12 bg-gradient-primary rounded-xl text-primary-foreground shadow-primary">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          {t('header.title')}
        </h1>
        <p className="text-xl md:text-2xl mb-6 opacity-90">
          {t('hero.subtitle')}
        </p>
        <p className="text-lg mb-8 opacity-80 max-w-2xl mx-auto px-4">
          {t('hero.description')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-lg px-8"
            onClick={handleStartBudgetJourney}
          >
            {t('hero.startBudgeting')}
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-8 border-white/30 text-white hover:bg-white/10"
            onClick={handleExploreMarketPrices}
          >
            {t('hero.checkPrices')}
          </Button>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center p-6 hover:shadow-card transition-shadow">
          <CardContent className="space-y-4">
            <div className="bg-gradient-primary p-3 rounded-full w-fit mx-auto">
              <TrendingUp className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="font-bold text-lg">{t('hero.featuresTitle.budget')}</h3>
            <p className="text-muted-foreground">
              {t('hero.featuresDesc.budget')}
            </p>
          </CardContent>
        </Card>

        <Card className="text-center p-6 hover:shadow-card transition-shadow">
          <CardContent className="space-y-4">
            <div className="bg-gradient-success p-3 rounded-full w-fit mx-auto">
              <Users className="h-8 w-8 text-success-foreground" />
            </div>
            <h3 className="font-bold text-lg">{t('hero.featuresTitle.market')}</h3>
            <p className="text-muted-foreground">
              {t('hero.featuresDesc.market')}
            </p>
          </CardContent>
        </Card>

        <Card className="text-center p-6 hover:shadow-card transition-shadow">
          <CardContent className="space-y-4">
            <div className="bg-gradient-secondary p-3 rounded-full w-fit mx-auto">
              <Shield className="h-8 w-8 text-accent" />
            </div>
            <h3 className="font-bold text-lg">{t('hero.featuresTitle.rights')}</h3>
            <p className="text-muted-foreground">
              {t('hero.featuresDesc.rights')}
            </p>
          </CardContent>
        </Card>

        <Card className="text-center p-6 hover:shadow-card transition-shadow">
          <CardContent className="space-y-4">
            <div className="bg-accent p-3 rounded-full w-fit mx-auto">
              <BookOpen className="h-8 w-8 text-accent-foreground" />
            </div>
            <h3 className="font-bold text-lg">{t('hero.featuresTitle.learn')}</h3>
            <p className="text-muted-foreground">
              {t('hero.featuresDesc.learn')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mission Statement */}
      <Card className="bg-gradient-secondary p-8 text-center">
        <CardContent>
          <h2 className="text-2xl font-bold text-accent mb-4">
            {t('hero.mission.title')}
          </h2>
          <p className="text-lg text-accent/90 max-w-3xl mx-auto leading-relaxed">
            {t('hero.mission.description')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}