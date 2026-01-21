'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Image as ImageIcon, Video, Music, Settings, FileText } from 'lucide-react';
import { MediaGrid } from '@/components/media/MediaGrid';
import { MediaUpload } from '@/components/media/MediaUpload';
import Link from 'next/link';

export default function MediaLibraryPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [showUpload, setShowUpload] = useState(false);

  const handleUploadSuccess = () => {
    setShowUpload(false);
    // Trigger grid refresh
    window.location.reload();
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Media Library</h1>
          <p className="text-muted-foreground mt-1">
            Manage your uploaded media files
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/media/config">
              <Settings className="w-4 h-4 mr-2" />
              Provider Settings
            </Link>
          </Button>
          <Button onClick={() => setShowUpload(!showUpload)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Media
          </Button>
        </div>
      </div>

      {/* Upload Section */}
      {showUpload && (
        <Card>
          <CardHeader>
            <CardTitle>Upload New Media</CardTitle>
            <CardDescription>
              Upload images, videos, or audio files to your media library
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MediaUpload
              mediaType="ALL"
              multiple
              onSuccess={handleUploadSuccess}
            />
          </CardContent>
        </Card>
      )}

      {/* Media Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Your Media</CardTitle>
          <CardDescription>
            Browse and manage your uploaded files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all">All Media</TabsTrigger>
              <TabsTrigger value="IMAGE" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Images
              </TabsTrigger>
              <TabsTrigger value="VIDEO" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="AUDIO" className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                Audio
              </TabsTrigger>
              <TabsTrigger value="DOCUMENT" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Documents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <MediaGrid onDelete={() => window.location.reload()} />
            </TabsContent>

            <TabsContent value="IMAGE">
              <MediaGrid mediaType="IMAGE" onDelete={() => window.location.reload()} />
            </TabsContent>

            <TabsContent value="VIDEO">
              <MediaGrid mediaType="VIDEO" onDelete={() => window.location.reload()} />
            </TabsContent>

            <TabsContent value="AUDIO">
              <MediaGrid mediaType="AUDIO" onDelete={() => window.location.reload()} />
            </TabsContent>
            <TabsContent value="AUDIO">
              <MediaGrid mediaType="AUDIO" onDelete={() => window.location.reload()} />
            </TabsContent>

            <TabsContent value="DOCUMENT">
              <MediaGrid mediaType="DOCUMENT" onDelete={() => window.location.reload()} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
