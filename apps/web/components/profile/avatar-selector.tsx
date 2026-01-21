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
import { Upload, Check, Shuffle, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AvatarSelectorProps {
  currentAvatar?: string | null;
  userEmail: string;
}

export function AvatarSelector({ currentAvatar, userEmail }: AvatarSelectorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || "");
  const [selectedStyle, setSelectedStyle] = useState<AvatarStyle>("avataaars");
  const [selectedBg, setSelectedBg] = useState("b6e3f4");
  const updateAvatar = useUpdateAvatar();
  
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>

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
            <div className="border-2 border-dashed rounded-lg p-8 text-center bg-slate-50">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="font-medium mb-2">Upload Your Own Image</h4>
              <p className="text-sm text-muted-foreground mb-4">
                To use a custom image, upload it to an image hosting service (like Imgur, Cloudinary, or your own server) and paste the URL below.
              </p>
              <div className="space-y-3">
                <input
                  type="url"
                  placeholder="https://example.com/your-avatar.jpg"
                  className="w-full px-4 py-2 border rounded-md"
                  onChange={(e) => {
                    const url = e.target.value;
                    if (url && url.startsWith('http')) {
                      setSelectedAvatar(url);
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  💡 Tip: Use services like <a href="https://imgur.com" target="_blank" className="text-blue-600 hover:underline">Imgur</a> or <a href="https://cloudinary.com" target="_blank" className="text-blue-600 hover:underline">Cloudinary</a> for free image hosting
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
