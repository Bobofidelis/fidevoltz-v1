'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Image as ImageIcon, Video, FileText } from 'lucide-react';
import { MediaUpload } from './MediaUpload';
import { MediaGrid } from './MediaGrid';

interface MediaPickerProps {
  value?: string | string[];
  onChange: (media: any | any[]) => void;
  mediaType?: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  multiple?: boolean;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MediaPicker({
  value,
  onChange,
  mediaType = 'IMAGE',
  multiple = false,
  open: controlledOpen,
  onOpenChange,
  children,
}: MediaPickerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any[]>([]);
  const [providerConfigured, setProviderConfigured] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState('upload');

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Check if provider is configured
  useEffect(() => {
    checkProviderStatus();
  }, []);

  const checkProviderStatus = async () => {
    try {
      const response = await fetch('/api/media/config');
      const data = await response.json();
      setProviderConfigured(!!data.config);
    } catch (error) {
      console.error('Error checking provider status:', error);
      setProviderConfigured(false);
    }
  };

  const handleSelect = () => {
    if (multiple) {
      onChange(selectedMedia);
    } else {
      onChange(selectedMedia[0] || null);
    }
    setOpen(false);
    setSelectedMedia([]);
  };

  const handleMediaClick = (media: any) => {
    if (multiple) {
      const isSelected = selectedMedia.some((m) => m.id === media.id);
      if (isSelected) {
        setSelectedMedia(selectedMedia.filter((m) => m.id !== media.id));
      } else {
        setSelectedMedia([...selectedMedia, media]);
      }
    } else {
      setSelectedMedia([media]);
    }
  };

  const handleUploadSuccess = (uploadedMedia: any[]) => {
    if (multiple) {
      onChange(uploadedMedia);
    } else {
      onChange(uploadedMedia[0] || null);
    }
    setOpen(false);
  };

  if (providerConfigured === null) {
    return (
      <Button variant="outline" disabled>
        Loading...
      </Button>
    );
  }

  return (
    <>
      <div onClick={() => setOpen(true)} className="inline-block cursor-pointer">
        {children || (
          <Button type="button" variant="outline" className="gap-2">
            {mediaType === 'VIDEO' ? <Video className="w-4 h-4" /> : mediaType === 'DOCUMENT' ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
            Select Media
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select or Upload Media</DialogTitle>
        </DialogHeader>

        {!providerConfigured ? (
          <Alert>
            <AlertDescription>
              No media provider configured. Please configure a provider in{' '}
              <a href="/dashboard/media/config" className="underline font-medium">
                settings
              </a>{' '}
              before uploading media.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload New
                </TabsTrigger>
                <TabsTrigger value="library" className="flex items-center gap-2">
                  {mediaType === 'VIDEO' ? (
                    <Video className="w-4 h-4" />
                  ) : mediaType === 'DOCUMENT' ? (
                    <FileText className="w-4 h-4" />
                  ) : (
                    <ImageIcon className="w-4 h-4" />
                  )}
                  Select Existing
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="flex-1 overflow-auto mt-4">
                <MediaUpload
                  mediaType={mediaType}
                  multiple={multiple}
                  onSuccess={handleUploadSuccess}
                />
              </TabsContent>

              <TabsContent value="library" className="flex-1 overflow-auto mt-4">
                <div className="space-y-4">
                  <MediaGrid
                    mediaType={mediaType}
                    selectedIds={selectedMedia.map((m) => m.id)}
                    onMediaClick={handleMediaClick}
                    selectable
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Sticky Footer for Selection Actions */}
            {activeTab === 'library' && selectedMedia.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg border-t mt-4 shrink-0">
                <span className="text-sm text-muted-foreground">
                  {selectedMedia.length} {multiple ? 'items' : 'item'} selected
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedMedia([])}>
                    Clear
                  </Button>
                  <Button onClick={handleSelect}>
                    Select {multiple && selectedMedia.length > 1 ? `${selectedMedia.length} items` : ''}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
