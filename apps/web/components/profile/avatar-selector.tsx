"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  generatePresetAvatars, 
  generateAvatar, 
  generateRandomAvatar,
  AVATAR_STYLES,
  AVATAR_BACKGROUNDS,
  type AvatarStyle 
} from "@/lib/utils/avatar-presets";
import { useUpdateAvatar } from "@/lib/hooks/use-profile";
import { useMediaUpload } from "@/lib/hooks/use-media";
import { Upload, Check, Shuffle, Sparkles, Image as ImageIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { MediaGrid } from "@/components/media/MediaGrid";

interface AvatarSelectorProps {
  currentAvatar?: string | null;
  userEmail: string;
}

export function AvatarSelector({ currentAvatar, userEmail }: AvatarSelectorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || "");
  const [selectedStyle, setSelectedStyle] = useState<AvatarStyle>("avataaars");
  const [selectedBg, setSelectedBg] = useState("b6e3f4");
  const [isDragging, setIsDragging] = useState(false);
  
  const updateAvatar = useUpdateAvatar();
  const uploadMutation = useMediaUpload();
  
  const handleFileUpload = async (file: File) => {
    try {
      const result = await uploadMutation.mutateAsync({
        files: [file],
        folder: "avatars",
      });
      
      if (result.success && result.media?.[0]?.url) {
        const uploadedUrl = result.media[0].url;
        setSelectedAvatar(uploadedUrl);
      } else {
        throw new Error(result.error || "Failed to get upload URL");
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };
  
  const presetAvatars = generatePresetAvatars(userEmail, 24);

  const handleSave = () => {
    if (selectedAvatar) {
      updateAvatar.mutate(selectedAvatar);
    }
  };

  const handleRandomize = () => {
    const randomAvatar = generateRandomAvatar();
    setSelectedAvatar(randomAvatar);
  };

  const handleCustomGenerate = () => {
    const customAvatar = generateAvatar({
      style: selectedStyle,
      seed: userEmail + Date.now(),
      backgroundColor: selectedBg,
    });
    setSelectedAvatar(customAvatar);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Avatar Settings</CardTitle>
            <CardDescription>Choose or create your profile avatar</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRandomize}
            className="gap-2"
          >
            <Shuffle className="h-4 w-4" />
            Random
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Avatar Preview */}
        <div className="flex items-center gap-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border-2 border-slate-200">
          <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg">
            <AvatarImage src={selectedAvatar} />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="font-semibold text-lg mb-1">Preview</h4>
            <p className="text-sm text-muted-foreground mb-3">
              {selectedAvatar === currentAvatar ? "Current avatar" : "New avatar preview"}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={selectedAvatar === currentAvatar || updateAvatar.isPending}
                size="sm"
              >
                {updateAvatar.isPending ? "Saving..." : "Save Avatar"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedAvatar(currentAvatar || "")}
                disabled={selectedAvatar === currentAvatar}
                size="sm"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="presets" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
          </TabsList>

          {/* Media Library */}
          <TabsContent value="library" className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="py-2">
              <h4 className="font-medium mb-3 flex items-center gap-2 sticky top-0 bg-white z-10 py-2">
                <ImageIcon className="h-4 w-4 text-blue-600" />
                Select from your media library
              </h4>
              <MediaGrid 
                mediaType="IMAGE"
                selectable
                onMediaClick={(media) => setSelectedAvatar(media.secureUrl || media.url)}
                selectedIds={[]} // We don't need persistent selection here since we update state on click
              />
            </div>
          </TabsContent>

          {/* Preset Avatars */}
          <TabsContent value="presets" className="space-y-4">
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                Choose from 24 unique avatars
              </h4>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {presetAvatars.map((avatar, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`relative rounded-full border-2 transition-all hover:scale-110 ${
                      selectedAvatar === avatar
                        ? "border-blue-600 ring-2 ring-blue-600 ring-offset-2"
                        : "border-slate-200 hover:border-blue-400"
                    }`}
                  >
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={avatar} />
                      <AvatarFallback>{index + 1}</AvatarFallback>
                    </Avatar>
                    {selectedAvatar === avatar && (
                      <div className="absolute -top-1 -right-1 bg-blue-600 rounded-full p-1">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Custom Generator */}
          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Avatar Style</Label>
                <Select value={selectedStyle} onValueChange={(v) => setSelectedStyle(v as AvatarStyle)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {AVATAR_STYLES.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_BACKGROUNDS.map((bg) => (
                    <button
                      key={bg}
                      onClick={() => setSelectedBg(bg)}
                      className={`h-10 rounded-md border-2 transition-all ${
                        selectedBg === bg
                          ? "border-blue-600 ring-2 ring-blue-600 ring-offset-1"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                      style={{ 
                        backgroundColor: bg === 'transparent' ? 'white' : `#${bg}`,
                        backgroundImage: bg === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)' : undefined,
                        backgroundSize: bg === 'transparent' ? '10px 10px' : undefined,
                        backgroundPosition: bg === 'transparent' ? '0 0, 5px 5px' : undefined,
                      }}
                    />
                  ))}
                </div>
              </div>

              <Button onClick={handleCustomGenerate} className="w-full gap-2">
                <Sparkles className="h-4 w-4" />
                Generate Custom Avatar
              </Button>
            </div>
          </TabsContent>

          {/* Upload Custom Image */}
          <TabsContent value="upload" className="space-y-4">
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileUpload(file);
              }}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer",
                isDragging ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"
              )}
              onClick={() => document.getElementById('avatar-upload')?.click()}
            >
              <Upload className={cn(
                "h-12 w-12 mx-auto mb-4 transition-colors",
                isDragging ? "text-blue-600" : "text-muted-foreground"
              )} />
              <h4 className="font-medium mb-2">Upload Your Own Image</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop or click to select a profile picture
              </p>
              
              <input
                id="avatar-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />

              {uploadMutation.isPending && (
                <div className="mt-4 space-y-2">
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 animate-pulse w-full"></div>
                  </div>
                  <p className="text-xs text-blue-600 font-medium interior-shadow">Uploading to Cloudinary...</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Sparkles className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="url"
                  placeholder="Or paste an image URL directly..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={selectedAvatar.startsWith('http') && !selectedAvatar.includes('res.cloudinary.com') ? selectedAvatar : ''}
                  onChange={(e) => {
                    const url = e.target.value;
                    if (url) {
                      setSelectedAvatar(url);
                    }
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Supported formats: JPG, PNG, WEBP, GIF (Max 10MB)
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
