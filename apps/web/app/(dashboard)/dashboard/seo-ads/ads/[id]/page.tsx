"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAd, useUpdateAd, useDeleteAd } from "@/lib/hooks/use-ads";
import { MediaPicker } from "@/components/media/MediaPicker";
import { Loader2, ArrowLeft, Eye, Trash2, Save, Upload } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AdDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data: ad, isLoading } = useAd(id);
  const updateAd = useUpdateAd(id);
  const deleteAd = useDeleteAd();

  const [isEditing, setIsEditing] = useState(false);
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

  // Update form data when ad loads
  useEffect(() => {
    if (ad) {
      setFormData({
        name: ad.name || "",
        type: ad.type || "CUSTOM",
        format: ad.format || "BANNER",
        status: ad.status || "DRAFT",
        title: ad.title || "",
        description: ad.description || "",
        imageUrl: ad.imageUrl || "",
        customHtml: ad.customHtml || "",
        customCss: ad.customCss || "",
        linkUrl: ad.linkUrl || "",
        ctaText: ad.ctaText || "",
        targetPages: ad.targetPages || [],
        targetDevices: ad.targetDevices || ["desktop", "mobile", "tablet"],
      });
    }
  }, [ad]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    updateAd.mutate(formData, {
      onSuccess: () => {
        setIsEditing(false);
        toast.success("Ad updated successfully!");
      },
    });
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this ad?")) {
      await deleteAd.mutateAsync(id);
      router.push("/dashboard/seo-ads/ads");
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getStatusBadge = (status: string) => {
    const colors: any = {
      ACTIVE: "bg-green-600",
      DRAFT: "bg-gray-600",
      PAUSED: "bg-yellow-600",
      SCHEDULED: "bg-blue-600",
      EXPIRED: "bg-red-600",
    };

    return <Badge className={colors[status]}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Ad not found</p>
        <Link href="/dashboard/seo-ads/ads">
          <Button className="mt-4">Back to Ads</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "SEO & Ads", href: "/dashboard/seo" },
          { label: "Advertisements", href: "/dashboard/seo-ads/ads" },
          { label: ad.name },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/seo-ads/ads">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {ad.name}
            </h1>
            <p className="text-gray-500 mt-1">View and edit advertisement details</p>
          </div>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Ad
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={updateAd.isPending}>
                {updateAd.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {!isEditing ? (
        /* View Mode */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Type</Label>
                    <p className="font-medium">{ad.type}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Format</Label>
                    <p className="font-medium">{ad.format}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Status</Label>
                    <div className="mt-1">{getStatusBadge(ad.status)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            <Card>
              <CardHeader>
                <CardTitle>Ad Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ad.title && (
                  <div>
                    <Label className="text-gray-500">Title</Label>
                    <p className="font-medium">{ad.title}</p>
                  </div>
                )}
                {ad.description && (
                  <div>
                    <Label className="text-gray-500">Description</Label>
                    <p>{ad.description}</p>
                  </div>
                )}
                {ad.imageUrl && (
                  <div>
                    <Label className="text-gray-500">Image</Label>
                    <img
                      src={ad.imageUrl}
                      alt={ad.title || "Ad"}
                      className="mt-2 rounded border max-w-md"
                    />
                  </div>
                )}
                {ad.linkUrl && (
                  <div>
                    <Label className="text-gray-500">Link URL</Label>
                    <p className="text-blue-600">{ad.linkUrl}</p>
                  </div>
                )}
                {ad.ctaText && (
                  <div>
                    <Label className="text-gray-500">CTA Text</Label>
                    <p className="font-medium">{ad.ctaText}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label className="text-gray-500">Impressions</Label>
                    <p className="text-2xl font-bold">{ad.impressions.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Clicks</Label>
                    <p className="text-2xl font-bold">{ad.clicks.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">CTR</Label>
                    <p className="text-2xl font-bold">
                      {ad.impressions > 0
                        ? ((ad.clicks / ad.impressions) * 100).toFixed(2)
                        : 0}
                      %
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Revenue</Label>
                    <p className="text-2xl font-bold text-green-600">
                      ${ad.revenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
                  {ad.imageUrl && (
                    <img
                      src={ad.imageUrl}
                      alt="Ad preview"
                      className="w-full rounded shadow-sm"
                    />
                  )}
                  {ad.title && (
                    <h3 className="font-bold text-lg mt-3">{ad.title}</h3>
                  )}
                  {ad.description && (
                    <p className="text-sm text-gray-600 mt-1">{ad.description}</p>
                  )}
                  {ad.ctaText && (
                    <button className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium">
                      {ad.ctaText}
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Targeting */}
            <Card>
              <CardHeader>
                <CardTitle>Targeting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-gray-500">Target Pages</Label>
                  <p>
                    {ad.targetPages.length > 0
                      ? ad.targetPages.join(", ")
                      : "All pages"}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Target Devices</Label>
                  <p className="capitalize">
                    {ad.targetDevices.join(", ")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Edit Mode - Similar to create form */
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="type">Type</Label>
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
                      <Label htmlFor="format">Format</Label>
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

                    <div>
                      <Label htmlFor="status">Status</Label>
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
                          <SelectItem value="EXPIRED">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
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
                                  <ArrowLeft className="h-4 w-4 rotate-45" />
                               </button>
                            </>
                          ) : (
                            <>
                              <Eye className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                Click to select or upload ad image
                              </p>
                            </>
                          )}
                        </div>
                      </MediaPicker>
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
                      value={formData.linkUrl}
                      onChange={(e) => handleChange("linkUrl", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="ctaText">CTA Text</Label>
                    <Input
                      id="ctaText"
                      value={formData.ctaText}
                      onChange={(e) => handleChange("ctaText", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Preview */}
            <div>
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
                    {formData.imageUrl ? (
                      <div className="space-y-3">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-full rounded shadow-sm"
                        />
                        {formData.title && (
                          <h3 className="font-bold text-lg">{formData.title}</h3>
                        )}
                        {formData.description && (
                          <p className="text-sm text-gray-600">{formData.description}</p>
                        )}
                        {formData.ctaText && (
                          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium">
                            {formData.ctaText}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded flex flex-col items-center justify-center text-gray-400">
                        <Eye className="h-12 w-12 mb-2 opacity-50" />
                        <p className="text-sm font-medium">No image</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
