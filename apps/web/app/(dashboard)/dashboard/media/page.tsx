'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Image as ImageIcon, Video, Music, Settings, FileText, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { MediaGrid } from '@/components/media/MediaGrid';
import { MediaUpload } from '@/components/media/MediaUpload';
import Link from 'next/link';

export default function MediaLibraryPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    try {
      setSyncing(true);
      const response = await fetch('/api/admin/media/sync', { method: 'POST' });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to sync media');
      }
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['media'] });
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to sync media');
    } finally {
      setSyncing(false);
    }
  };

  const handleUploadSuccess = () => {
    setShowUpload(false);
    queryClient.invalidateQueries({ queryKey: ['media'] });
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Media Library</h1>
          <p className="text-muted-foreground mt-1">
            Manage your uploaded media files
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleSync} disabled={syncing} title="Import assets that exist in Cloudinary but are missing from this library">
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync from Cloudinary'}
          </Button>
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
            <TabsList className="grid w-full grid-cols-5 mb-6">
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
              <MediaGrid
                key={`all-${refreshKey}`}
                onDelete={() => queryClient.invalidateQueries({ queryKey: ['media'] })}
              />
            </TabsContent>

            <TabsContent value="IMAGE">
              <MediaGrid
                key={`IMAGE-${refreshKey}`}
                mediaType="IMAGE"
                onDelete={() => queryClient.invalidateQueries({ queryKey: ['media'] })}
              />
            </TabsContent>

            <TabsContent value="VIDEO">
              <MediaGrid
                key={`VIDEO-${refreshKey}`}
                mediaType="VIDEO"
                onDelete={() => queryClient.invalidateQueries({ queryKey: ['media'] })}
              />
            </TabsContent>

            <TabsContent value="AUDIO">
              <MediaGrid
                key={`AUDIO-${refreshKey}`}
                mediaType="AUDIO"
                onDelete={() => queryClient.invalidateQueries({ queryKey: ['media'] })}
              />
            </TabsContent>

            <TabsContent value="DOCUMENT">
              <MediaGrid
                key={`DOCUMENT-${refreshKey}`}
                mediaType="DOCUMENT"
                onDelete={() => queryClient.invalidateQueries({ queryKey: ['media'] })}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
