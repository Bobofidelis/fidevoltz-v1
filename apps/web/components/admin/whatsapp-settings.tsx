"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useWhatsAppSettings, useUpdateWhatsAppSettings } from '@/lib/hooks/use-conversations';
import { Phone, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

export function WhatsAppSettings() {
  const { data: settings, isLoading } = useWhatsAppSettings();
  const updateSettings = useUpdateWhatsAppSettings();

  const [phoneNumber, setPhoneNumber] = useState(settings?.phoneNumber || '');
  const [enabled, setEnabled] = useState(settings?.enabled || false);

  // Update local state when settings load
  useEffect(() => {
    if (settings) {
      setPhoneNumber(settings.phoneNumber || '');
      setEnabled(settings.enabled || false);
    }
  }, [settings]);

  const handleSave = () => {
    if (enabled && !phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }

    updateSettings.mutate({ phoneNumber, enabled });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          WhatsApp Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="whatsapp-enabled" className="text-base font-medium">
              Enable WhatsApp
            </Label>
            <p className="text-sm text-gray-500 mt-1">
              Allow users to contact you via WhatsApp
            </p>
          </div>
          <Switch
            id="whatsapp-enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>

        {enabled && (
          <div className="space-y-2">
            <Label htmlFor="phone-number">
              WhatsApp Phone Number *
            </Label>
            <Input
              id="phone-number"
              type="tel"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="max-w-md"
            />
            <p className="text-sm text-gray-500">
              Include country code (e.g., +1 for US, +234 for Nigeria)
            </p>
          </div>
        )}

        <div className="pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={updateSettings.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {updateSettings.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>

        {enabled && phoneNumber && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Preview</h4>
            <p className="text-sm text-green-700 mb-3">
              Users will see a WhatsApp button in their messages that opens:
            </p>
            <code className="block bg-white px-3 py-2 rounded border text-sm">
              https://wa.me/{phoneNumber.replace(/\D/g, '')}
            </code>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
