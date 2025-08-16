import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, X, RotateCcw, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: 'price_sharing' | 'overcharging';
}

export function CameraCapture({ isOpen, onClose, reportType }: CameraCaptureProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [storeName, setStoreName] = useState("");
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const { user } = useAuth();

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera if available
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageDataUrl);
    stopCamera();

    // Immediately upload and notify
    const url = await uploadImageToSupabase(imageDataUrl);
    if (url) {
      setUploadedImageUrl(url);
      toast({
        title: reportType === 'overcharging' ? 'Successfully reported' : 'Successfully stored',
        description: 'Your photo has been uploaded.',
      });
    } else {
      toast({
        title: 'Upload failed',
        description: 'Could not store the photo. You can try submitting again.',
        variant: 'destructive',
      });
    }
  }, [stopCamera, toast, reportType]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setUploadedImageUrl(null);
    startCamera();
  }, [startCamera]);

  const uploadImageToSupabase = async (imageDataUrl: string): Promise<string | null> => {
    if (!user) return null;

    try {
      // Convert data URL to blob
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();

      // Create unique filename
      const fileName = `${user.id}/${Date.now()}.jpg`;

      // Upload to Supabase storage
      const { error } = await supabase.storage
        .from('price-reports')
        .upload(fileName, blob);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('price-reports')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const uploadFileToSupabase = async (file: File): Promise<string | null> => {
    if (!user) return null;
    try {
      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from('price-reports')
        .upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage
        .from('price-reports')
        .getPublicUrl(fileName);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const handleOpenFilePicker = () => {
    if (isStreaming) stopCamera();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = () => setCapturedImage(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    const url = await uploadFileToSupabase(file);
    if (url) {
      setUploadedImageUrl(url);
      toast({
        title: reportType === 'overcharging' ? 'Successfully reported' : 'Successfully stored',
        description: 'Your photo has been uploaded.',
      });
    } else {
      toast({
        title: 'Upload failed',
        description: 'Could not store the photo. You can try again.',
        variant: 'destructive',
      });
    }
  };
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user || !capturedImage) return;

    if (!storeName || !itemName || !price) {
      toast({
        title: "Missing Information",
        description: "Please fill in store name, item name, and price.",
        variant: "destructive",
      });
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure image is uploaded (supports both camera and gallery)
      let imageUrl = uploadedImageUrl;
      if (!imageUrl && capturedImage) {
        imageUrl = await uploadImageToSupabase(capturedImage);
      }

      // Save report to database
      const { error } = await supabase
        .from('price_reports')
        .insert({
          user_id: user.id,
          store_name: storeName,
          item_name: itemName,
          price: priceNum,
          location: location || null,
          description: description || null,
          image_url: imageUrl,
          report_type: reportType
        });

      if (error) throw error;

      toast({
        title: "Report Submitted!",
        description: reportType === 'overcharging' 
          ? "Your overcharging report has been submitted to authorities."
          : "Thank you for sharing price information with the community!",
      });

      // Reset form and close
      setStoreName("");
      setItemName("");
      setPrice("");
      setLocation("");
      setDescription("");
      setCapturedImage(null);
      onClose();

    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setUploadedImageUrl(null);
    setStoreName("");
    setItemName("");
    setPrice("");
    setLocation("");
    setDescription("");
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {reportType === 'overcharging' ? 'Report Overcharging' : 'Share Price Information'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!capturedImage ? (
            <div className="space-y-4">
              {isStreaming ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg"
                  />
                  <div className="flex justify-center gap-2 mt-4">
                    <Button onClick={capturePhoto} size="lg" className="flex-1">
                      <Camera className="h-4 w-4 mr-2" />
                      Capture
                    </Button>
                    <Button onClick={stopCamera} variant="outline" size="lg">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-muted rounded-lg p-8">
                    <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Take a photo of the price tag or receipt
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button onClick={startCamera} size="lg" className="w-full">
                      <Camera className="h-4 w-4 mr-2" />
                      Start Camera
                    </Button>
                    <Button onClick={handleOpenFilePicker} variant="outline" size="lg" className="w-full">
                      Choose from gallery
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={capturedImage} 
                  alt="Captured" 
                  className="w-full rounded-lg"
                />
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                <div>
                  <Label htmlFor="storeName">Store Name *</Label>
                  <Input
                    id="storeName"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g., Stop & Shop"
                  />
                </div>

                <div>
                  <Label htmlFor="itemName">Item Name *</Label>
                  <Input
                    id="itemName"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g., Rice 1kg"
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price (Kina) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g., 4.50"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Port Moresby"
                  />
                </div>

                {reportType === 'overcharging' && (
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the overcharging issue..."
                      rows={3}
                    />
                  </div>
                )}
              </div>

                <div className="flex gap-2 sticky bottom-0 bg-background py-2">
                  <Button onClick={retakePhoto} variant="outline" className="flex-1">
                    Retake
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Submit
                      </>
                    )}
                  </Button>
                </div>
              </form>
              </div>
           )}
        </div>
      </DialogContent>
    </Dialog>
  );
}