import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, FileText, Camera, Phone, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CameraCapture } from "@/components/camera/CameraCapture";

export function RightsSection() {
  const { t } = useLanguage();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const regulatedItems = [
    { item: "Fuel (Petrol)", maxPrice: "K 5.89/L", authority: "ICCC", status: "Regulated" },
    { item: "Electricity", rate: "K 0.89/kWh", authority: "ICCC", status: "Regulated" },
    { item: "Water Services", rate: "K 2.15/kL", authority: "ICCC", status: "Regulated" },
    { item: "Public Transport", maxPrice: "K 1.00", authority: "NCD", status: "Fixed Rate" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">{t('rights.title')}</h2>
        <p className="text-muted-foreground">
          {t('rights.subtitle')}
        </p>
      </div>

      {/* Quick Action Alert */}
      <Alert className="border-primary bg-primary/5">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>{t('rights.alert.title')}</strong> {t('rights.alert.description')}
        </AlertDescription>
      </Alert>

      {/* Regulated Prices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('rights.regulated.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {regulatedItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{item.item}</p>
                  <p className="text-sm text-muted-foreground">Regulated by {item.authority}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{item.maxPrice || item.rate}</p>
                  <Badge variant="secondary" className="text-xs">{item.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Overcharging */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              {t('rights.report.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm opacity-90">
              {t('rights.report.description')}
            </p>
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => setIsCameraOpen(true)}
            >
              {t('rights.report.button')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              {t('rights.contact.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="font-medium">ICCC (Utilities & Fuel)</p>
              <p className="text-sm text-muted-foreground">Phone: 321 3222</p>
              <p className="text-sm text-muted-foreground">Email: iccc@iccc.gov.pg</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Consumer Protection</p>
              <p className="text-sm text-muted-foreground">Phone: 323 4532</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Your Rights */}
      <Card>
        <CardHeader>
          <CardTitle>{t('rights.consumerRights.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                {t('rights.fairPricing.title')}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t('rights.fairPricing.description')}
              </p>
              
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                {t('rights.information.title')}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t('rights.information.description')}
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                {t('rights.quality.title')}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t('rights.quality.description')}
              </p>
              
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                {t('rights.complain.title')}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t('rights.complain.description')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning */}
      <Alert className="border-destructive bg-destructive/5">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>{t('rights.warning.title')}</strong> {t('rights.warning.description')}
        </AlertDescription>
      </Alert>

      {/* Camera Capture Component */}
      <CameraCapture 
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        reportType="overcharging"
      />
    </div>
  );
}