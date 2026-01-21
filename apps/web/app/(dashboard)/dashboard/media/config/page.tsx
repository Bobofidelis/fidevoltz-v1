'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, AlertCircle, Loader2, Cloud } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function MediaConfigPage() {
  const [provider, setProvider] = useState<'CLOUDINARY' | 'AWS_S3'>('CLOUDINARY');
  const [config, setConfig] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [activeProvider, setActiveProvider] = useState<any>(null);
  const [savedConfigId, setSavedConfigId] = useState<string | null>(null);

  useEffect(() => {
    loadActiveProvider();
  }, []);

  const loadActiveProvider = async () => {
    try {
      console.log('[CONFIG] Loading active provider...');
      const response = await fetch('/api/media/config');
      const data = await response.json();
      console.log('[CONFIG] Loaded provider data:', data);
      
      if (data.success && data.config) {
        setActiveProvider(data.config);
        
        // Populate form with existing config
        if (data.config.config) {
          console.log('[CONFIG] Populating form with existing config');
          setProvider(data.config.provider);
          setConfig(data.config.config);
          setSavedConfigId(data.config.id);
        }
      }
    } catch (error) {
      console.error('[CONFIG] Error loading active provider:', error);
    }
  };

  const handleSave = async () => {
    console.log('[CONFIG] Save button clicked');
    console.log('[CONFIG] Provider:', provider);
    console.log('[CONFIG] Config:', config);
    
    setLoading(true);
    try {
      console.log('[CONFIG] Sending POST request to /api/media/config');
      const response = await fetch('/api/media/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, config }),
      });

      console.log('[CONFIG] Response status:', response.status);
      const data = await response.json();
      console.log('[CONFIG] Response data:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save configuration');
      }

      console.log('[CONFIG] Configuration saved successfully!');
      toast.success('Configuration saved successfully!');
      setSavedConfigId(data.config.id);
      console.log('[CONFIG] Saved config ID:', data.config.id);
    } catch (error) {
      console.error('[CONFIG] Error saving configuration:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save configuration';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!savedConfigId) {
      toast.error('Please save the configuration first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/media/config/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId: savedConfigId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to activate provider');
      }

      toast.success(data.message || 'Provider activated successfully!');
      await loadActiveProvider();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to activate provider';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Media Provider Configuration</h1>
        <p className="text-muted-foreground mt-1">
          Configure your cloud storage provider for media uploads
        </p>
      </div>

      {/* Active Provider Status */}
      {activeProvider && (
        <Alert>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <strong>{activeProvider.provider}</strong> is currently active and ready for uploads.
          </AlertDescription>
        </Alert>
      )}

      {/* Provider Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Provider</CardTitle>
          <CardDescription>
            Choose your preferred cloud storage provider
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Provider</Label>
            <Select value={provider} onValueChange={(value: any) => setProvider(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CLOUDINARY">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4" />
                    Cloudinary
                  </div>
                </SelectItem>
                <SelectItem value="AWS_S3" disabled>
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4" />
                    AWS S3 (Coming Soon)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cloudinary Configuration */}
      {provider === 'CLOUDINARY' && (
        <Card>
          <CardHeader>
            <CardTitle>Cloudinary Configuration</CardTitle>
            <CardDescription>
              Enter your Cloudinary account credentials. You can find these in your{' '}
              <a
                href="https://cloudinary.com/console"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                Cloudinary Dashboard
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cloudName">Cloud Name *</Label>
              <Input
                id="cloudName"
                placeholder="my-cloud-name"
                value={config.cloudName || ''}
                onChange={(e) => setConfig({ ...config, cloudName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key *</Label>
              <Input
                id="apiKey"
                placeholder="123456789012345"
                value={config.apiKey || ''}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiSecret">API Secret *</Label>
              <Input
                id="apiSecret"
                type="password"
                placeholder="••••••••••••••••••••"
                value={config.apiSecret || ''}
                onChange={(e) => setConfig({ ...config, apiSecret: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="folder">Default Folder (Optional)</Label>
              <Input
                id="folder"
                placeholder="media"
                value={config.folder || ''}
                onChange={(e) => setConfig({ ...config, folder: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Organize uploads in a specific folder
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Configuration'
          )}
        </Button>
        {savedConfigId && (
          <Button onClick={handleActivate} disabled={loading} variant="default">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Activating...
              </>
            ) : (
              'Activate Provider'
            )}
          </Button>
        )}
      </div>

      {/* Help Text */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> Your API credentials are stored securely in the database.
          After saving and activating, you can start uploading media from the{' '}
          <Link href="/dashboard/media" className="underline font-medium">
            Media Library
          </Link>
          .
        </AlertDescription>
      </Alert>
    </div>
  );
}
