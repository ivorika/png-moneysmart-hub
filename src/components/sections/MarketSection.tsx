import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Camera, TrendingUp, AlertCircle, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { CameraCapture } from "@/components/camera/CameraCapture";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
type PriceData = {
  item: string;
  prices: Array<{
    store: string;
    price: string;
    location: string;
  }>;
  avgPrice: string;
  trend: "up" | "down" | "stable";
};

export function MarketSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string>('All');
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const provinces = ['All', 'National Capital District', 'Morobe', 'Southern Highlands', ' West Sepik', 'East New Britain', 'Madang', 'Western Highlands', 'Eastern Highlands', 'Enga', 'Hela', 'Simbu', 'Jiwaka', 'West New Britain', 'New Ireland', 'Autonomous Region of Bougainville', 'Gulf', 'Oro', 'Manus', 'Milne Bay', 'Western', 'East Sepik'];
  
  const locationToProvince: Record<string, string> = {
    'Port Moresby': 'National Capital District',
    'Lae': 'Morobe',
    'Mendi': 'Southern Highlands',
    'Vanimo': 'West Sepik',
    'Kokopo': 'East New Britain',
    'Madang': 'Madang', 
    'Mount Hagen': 'Western Highlands',
    'Goroka': 'Eastern Highlands',
    'Wabag': 'Enga',
    'Tari': 'Hela',
    'Kundiawa': 'Simbu',
    'Banz': 'Jiwaka',
    'Kimbe': 'West New Britain',
    'Kavieng': 'New Ireland',
    'Buka': 'Autonomous Region of Bougainville',
    'Kerema': 'Gulf',
    'Popondetta': 'Oro',
    'Lorengau': 'Manus',
    'Alotau': 'Milne Bay',
    'Tabubil': 'Western',
    'Wewak': 'East Sepik',
  };

  // Fetch market prices from Supabase
  const fetchMarketPrices = async () => {
    try {
      const { data: marketPrices, error: marketError } = await supabase
        .from('market_prices')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: priceReports, error: reportsError } = await supabase
        .from('price_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (marketError) throw marketError;
      if (reportsError) throw reportsError;

      // Combine and process data
      const combinedData: Record<string, any[]> = {};
      
      // Process market_prices
      marketPrices?.forEach(price => {
        const key = price.product_name;
        if (!combinedData[key]) combinedData[key] = [];
        combinedData[key].push({
          store: price.store_name || 'Unknown Store',
          price: `K ${Number(price.price).toFixed(2)}`,
          location: price.location,
        });
      });

      // Process price_reports
      priceReports?.forEach(report => {
        const key = report.item_name;
        if (!combinedData[key]) combinedData[key] = [];
        combinedData[key].push({
          store: report.store_name,
          price: `K ${Number(report.price).toFixed(2)}`,
          location: report.location || 'Unknown Location',
        });
      });

      // Convert to required format
      const processedData: PriceData[] = Object.entries(combinedData).map(([item, prices]) => {
        const avgPrice = prices.reduce((sum, p) => sum + parseFloat(p.price.replace('K ', '')), 0) / prices.length;
        return {
          item,
          prices,
          avgPrice: `K ${avgPrice.toFixed(2)}`,
          trend: "stable" as const, // You can implement trend calculation logic here
        };
      });

      setPriceData(processedData);
    } catch (error) {
      console.error('Error fetching market prices:', error);
      toast({
        title: "Error",
        description: "Failed to load market prices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketPrices();

    // Set up real-time subscription
    const channel = supabase
      .channel('market-prices-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_prices'
        },
        () => {
          fetchMarketPrices();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'price_reports'
        },
        () => {
          fetchMarketPrices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter data based on search and province
  const filteredData = priceData.filter(product => {
    const matchesSearch = product.item.toLowerCase().includes(searchTerm.toLowerCase());
    const filteredPrices = product.prices.filter(price =>
      selectedProvince === 'All' || locationToProvince[price.location] === selectedProvince
    );
    return matchesSearch && filteredPrices.length > 0;
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">{t('market.title')}</h2>
        <p className="text-muted-foreground">
          {t('market.subtitle')}
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3 flex-col md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t('market.search.placeholder')} 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedProvince} onValueChange={setSelectedProvince}>
              <SelectTrigger className="w-full md:w-[260px]">
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="hero">
              {t('market.search.button')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Price Comparison Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading market prices...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {priceData.length === 0 ? "No market data available yet." : "No items match your search criteria."}
            </p>
          </div>
        ) : (
          filteredData.map((product, index) => {
            const filteredPrices = product.prices.filter((price) =>
              selectedProvince === 'All' || locationToProvince[price.location] === selectedProvince
            );
            return (
              <Card key={index} className="hover:shadow-card transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{product.item}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Avg: {product.avgPrice}</Badge>
                      <div className={`flex items-center gap-1 ${
                        product.trend === "up" ? "text-destructive" : 
                        product.trend === "down" ? "text-success" : "text-muted-foreground"
                      }`}>
                        <TrendingUp className={`h-4 w-4 ${
                          product.trend === "down" ? "rotate-180" : ""
                        }`} />
                        <span className="text-sm capitalize">{t(`market.trend.${product.trend}`)}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredPrices.map((price, priceIndex) => (
                      <div key={priceIndex} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{price.store}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {price.location}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">{price.price}</p>
                          <p className="text-xs text-muted-foreground">per unit</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Price Card - Show sign-in prompt if not authenticated */}
      {!user ? (
        <Card className="bg-gradient-primary text-primary-foreground">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="bg-white/20 p-3 rounded-full w-fit mx-auto">
                <Lock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">{t('market.signIn.title')}</h3>
              <p className="text-primary-foreground/90">
                {t('market.signIn.description')}
              </p>
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => navigate("/auth")}
              >
                {t('market.signIn.button')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-secondary">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="bg-accent p-3 rounded-full w-fit mx-auto">
                <Camera className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold text-accent">{t('market.contribute.title')}</h3>
              <p className="text-accent/90">
                {t('market.contribute.description')}
              </p>
              <Button 
                variant="hero" 
                size="lg"
                onClick={() => setIsCameraOpen(true)}
              >
                {t('market.contribute.button')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Alert */}
      <Card className="border-destructive bg-destructive/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <h4 className="font-medium text-destructive mb-1">{t('market.alert.title')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('market.alert.description')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Camera Capture Component */}
      <CameraCapture 
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        reportType="price_sharing"
      />
    </div>
  );
}