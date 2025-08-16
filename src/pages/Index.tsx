import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { HeroSection } from "@/components/sections/HeroSection";
import { BudgetSection } from "@/components/sections/BudgetSection";
import { MarketSection } from "@/components/sections/MarketSection";
import { RightsSection } from "@/components/sections/RightsSection";
import { LearnSection } from "@/components/sections/LearnSection";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user && activeSection !== "home") {
      navigate("/auth");
    }
  }, [user, loading, activeSection, navigate]);

  const renderSection = () => {
    switch (activeSection) {
      case "budget":
        return <BudgetSection />;
      case "market":
        return <MarketSection />;
      case "rights":
        return <RightsSection />;
      case "learn":
        return <LearnSection />;
      default:
        return <HeroSection onSectionChange={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        {/* Only show sidebar if user is authenticated */}
        {user && (
          <>
            <div className="hidden md:block w-72 flex-shrink-0">
              <Sidebar 
                isOpen={true} 
                onClose={() => {}} 
                activeSection={activeSection}
                onSectionChange={setActiveSection}
              />
            </div>
            
            {/* Mobile sidebar overlay */}
            <div className="md:hidden">
              <Sidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
                activeSection={activeSection}
                onSectionChange={setActiveSection}
              />
            </div>
          </>
        )}
        
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;