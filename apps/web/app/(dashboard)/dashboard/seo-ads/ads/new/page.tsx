"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateAd } from "@/lib/hooks/use-ads";
import { MediaPicker } from "@/components/media/MediaPicker";
import { PlacementManager } from "@/components/ads/PlacementManager";
import { Loader2, ArrowLeft, Eye, Upload } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CreateAdPage() {
  const router = useRouter();
  const createAd = useCreateAd();

  const [formData, setFormData] = useState({
    name: "",
    type: "CUSTOM",
    format: "BANNER",
    status: "DRAFT",
    title: "",
    description: "",
    imageUrl: "",
    customHtml: "",
    customCss: "",
    linkUrl: "",
    ctaText: "",
    targetPages: [] as string[],
    targetDevices: ["desktop", "mobile", "tablet"],
  });

  const [placements, setPlacements] = useState<Array<{
    page: string;
    zone: string;
    isActive: boolean;
  }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (placements.length === 0) {
      toast.error('Please add at least one placement for your ad');
      return;
    }

    createAd.mutate({ ...formData, placements }, {
      onSuccess: (data) => {
        router.push('/dashboard/seo-ads/ads');
      },
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "SEO & Ads", href: "/dashboard/seo" },
          { label: "Advertisements", href: "/dashboard/seo-ads/ads" },
          { label: "Create New Ad" },
        ]}
      />

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/seo-ads/ads">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Advertisement
          </h1>
          <p className="text-gray-500 mt-1">Design and configure your new ad</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Ad Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g., Homepage Banner - Summer Sale"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Ad Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleChange("type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CUSTOM">Custom</SelectItem>
                        <SelectItem value="GOOGLE_ADS">Google Ads</SelectItem>
                        <SelectItem value="AFFILIATE">Affiliate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="format">Format *</Label>
                    <Select
                      value={formData.format}
                      onValueChange={(value) => handleChange("format", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BANNER">Banner</SelectItem>
                        <SelectItem value="SIDEBAR">Sidebar</SelectItem>
                        <SelectItem value="POPUP">Popup</SelectItem>
                        <SelectItem value="INLINE">Inline</SelectItem>
                        <SelectItem value="STICKY">Sticky</SelectItem>
                        <SelectItem value="INTERSTITIAL">Interstitial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="PAUSED">Paused</SelectItem>
                      <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Draft ads won't appear on the website. Set to Active to publish.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Ad Content */}
            <Card>
              <CardHeader>
                <CardTitle>Ad Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Ad headline"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Ad description or body text"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Image</Label>
                  <div className="space-y-3 mt-2">
                    <MediaPicker
                      mediaType="IMAGE"
                      onChange={(media: any) => {
                        if (media) handleChange("imageUrl", media.secureUrl || media.url);
                      }}
                    >
                      <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-accent/50 cursor-pointer transition-colors relative overflow-hidden group min-h-[200px] flex flex-col items-center justify-center">
                        {formData.imageUrl ? (
                          <>
                            <img 
                              src={formData.imageUrl} 
                              alt="Ad creative" 
                              className="absolute inset-0 w-full h-full object-contain p-2" 
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                              <p className="text-white font-medium flex items-center gap-2">
                                <Upload className="h-4 w-4" /> Change Image
                              </p>
                            </div>
                            <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleChange("imageUrl", "");
                               }}
                               className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-2 hover:bg-red-500 z-10"
                             >
                                <ArrowLeft className="h-4 w-4 rotate-45" /> {/* Using generic icon for close as X is not imported, or I can import X */}
                             </button>
                          </>
                        ) : (
                          <>
                            <Eye className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Click to select or upload ad image
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Supports JPG, PNG, GIF, WebP
                            </p>
                          </>
                        )}
                      </div>
                    </MediaPicker>
                    
                    {/* Manual URL Input fallback */}
                    <div className="pt-2">
                        <Label htmlFor="imageUrl" className="text-xs text-gray-500">Or use external URL</Label>
                        <Input
                          id="imageUrl"
                          className="mt-1 h-8 text-sm"
                          placeholder="https://..."
                          value={formData.imageUrl}
                          onChange={(e) => handleChange('imageUrl', e.target.value)}
                        />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="linkUrl">Link URL</Label>
                  <Input
                    id="linkUrl"
                    type="url"
                    value={formData.linkUrl}
                    onChange={(e) => handleChange("linkUrl", e.target.value)}
                    placeholder="https://example.com/landing-page"
                  />
                </div>

                <div>
                  <Label htmlFor="ctaText">Call-to-Action Text</Label>
                  <Input
                    id="ctaText"
                    value={formData.ctaText}
                    onChange={(e) => handleChange("ctaText", e.target.value)}
                    placeholder="e.g., Learn More, Shop Now"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Custom Code */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Code (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customHtml">Custom HTML</Label>
                  <Textarea
                    id="customHtml"
                    value={formData.customHtml}
                    onChange={(e) => handleChange("customHtml", e.target.value)}
                    placeholder="<div>Your custom HTML here</div>"
                    rows={5}
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="customCss">Custom CSS</Label>
                  <Textarea
                    id="customCss"
                    value={formData.customCss}
                    onChange={(e) => handleChange("customCss", e.target.value)}
                    placeholder=".my-ad { color: red; }"
                    rows={5}
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Live Preview
                </CardTitle>
                <p className="text-xs text-gray-500">How your ad will appear</p>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
                  {formData.imageUrl ? (
                    <div className="space-y-3">
                      <img
                        src={formData.imageUrl}
                        alt="Ad preview"
                        className="w-full rounded shadow-sm"
                        onError={(e) => {
                          e.currentTarget.src = '';
                          e.currentTarget.alt = 'Failed to load image';
                        }}
                      />
                      {formData.title && (
                        <h3 className="font-bold text-lg">{formData.title}</h3>
                      )}
                      {formData.description && (
                        <p className="text-sm text-gray-600">
                          {formData.description}
                        </p>
                      )}
                      {formData.ctaText && (
                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium">
                          {formData.ctaText}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded flex flex-col items-center justify-center text-gray-400">
                      <Eye className="h-12 w-12 mb-2 opacity-50" />
                      <p className="text-sm font-medium">No image uploaded yet</p>
                      <p className="text-xs mt-1">Upload or enter URL to preview</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Placements */}
            <Card>
              <CardHeader>
                <CardTitle>Ad Placements *</CardTitle>
                <p className="text-sm text-gray-500">Choose where this ad will appear</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <PlacementManager placements={placements} setPlacements={setPlacements} />
              </CardContent>
            </Card>

            {/* Targeting */}
            <Card>
              <CardHeader>
                <CardTitle>Advanced Targeting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Target Devices</Label>
                  <div className="space-y-2 mt-2">
                    {["desktop", "mobile", "tablet"].map((device) => (
                      <label key={device} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.targetDevices.includes(device)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleChange("targetDevices", [
                                ...formData.targetDevices,
                                device,
                              ]);
                            } else {
                              handleChange(
                                "targetDevices",
                                formData.targetDevices.filter((d) => d !== device)
                              );
                            }
                          }}
                        />
                        <span className="capitalize">{device}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createAd.isPending || !formData.name || !formData.format}
                >
                  {createAd.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Advertisement"
                  )}
                </Button>
                <Link href="/dashboard/seo-ads/ads">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
