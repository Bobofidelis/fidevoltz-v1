"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CreditCard, Plus, Save, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PaymentSettingsPage() {
  const [gateways, setGateways] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const [newGateway, setNewGateway] = useState({
    name: "",
    type: "",
    description: "",
    publicKey: "",
    secretKey: "",
    webhookKey: "",
    isActive: false,
    isTestMode: true,
  });

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    try {
      const res = await fetch("/api/admin/payment-gateways");
      const data = await res.json();
      if (data.success) {
        setGateways(data.data);
      }
    } catch (e) {
      toast.error("Failed to load payment gateways");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (id: string, updates: any) => {
    try {
      const res = await fetch(`/api/admin/payment-gateways/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Gateway updated");
        setGateways(gateways.map(g => g.id === id ? { ...g, ...updates } : g));
      } else {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error("Error updating gateway");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment method?")) return;
    try {
      const res = await fetch(`/api/admin/payment-gateways/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Gateway deleted");
        setGateways(gateways.filter(g => g.id !== id));
      } else {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error("Error deleting gateway");
    }
  };

  const handleCreate = async () => {
    if (!newGateway.name || !newGateway.type) {
      toast.error("Name and type are required");
      return;
    }
    
    try {
      const res = await fetch("/api/admin/payment-gateways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGateway),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Gateway created");
        setGateways([data.data, ...gateways]);
        setIsAdding(false);
        setNewGateway({
          name: "", type: "", description: "", publicKey: "", secretKey: "", webhookKey: "", isActive: false, isTestMode: true
        });
      } else {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error("Error creating gateway");
    }
  };

  if (isLoading) return <div className="p-10 text-center">Loading payment settings...</div>;

  return (
    <div className="container mx-auto py-10 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground mt-1">Configure payment gateways and methods for checkout.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="w-4 h-4 mr-2" />
          Add Gateway
        </Button>
      </div>

      <div className="space-y-6">
        {isAdding && (
          <Card className="border-blue-200 shadow-md ring-1 ring-blue-500">
            <CardHeader>
              <CardTitle>New Payment Gateway</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gateway Name</Label>
                  <Input 
                    value={newGateway.name} 
                    onChange={e => setNewGateway({...newGateway, name: e.target.value})} 
                    placeholder="e.g. Paystack, Bank Transfer" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type / Provider</Label>
                  <Select value={newGateway.type} onValueChange={v => setNewGateway({...newGateway, type: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paystack">Paystack</SelectItem>
                      <SelectItem value="flutterwave">Flutterwave</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="manual">Manual / Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description (shown to customers)</Label>
                <Input 
                  value={newGateway.description} 
                  onChange={e => setNewGateway({...newGateway, description: e.target.value})} 
                  placeholder="e.g. Pay securely with your debit card" 
                />
              </div>

              {newGateway.type !== 'manual' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Public Key</Label>
                    <Input 
                      value={newGateway.publicKey} 
                      onChange={e => setNewGateway({...newGateway, publicKey: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Secret Key</Label>
                    <Input 
                      type="password"
                      value={newGateway.secretKey} 
                      onChange={e => setNewGateway({...newGateway, secretKey: e.target.value})} 
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-6 mt-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={newGateway.isActive}
                    onCheckedChange={c => setNewGateway({...newGateway, isActive: c})}
                  />
                  <Label>Active (Visible at checkout)</Label>
                </div>
                {newGateway.type !== 'manual' && (
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={newGateway.isTestMode}
                      onCheckedChange={c => setNewGateway({...newGateway, isTestMode: c})}
                    />
                    <Label>Test Mode (Sandbox)</Label>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 bg-slate-50 border-t">
              <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Save Gateway</Button>
            </CardFooter>
          </Card>
        )}

        {gateways.map(gateway => (
          <Card key={gateway.id} className={`transition-all ${!gateway.isActive ? 'opacity-70 bg-slate-50' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      {gateway.name}
                      {gateway.isTestMode && gateway.type !== 'manual' && (
                        <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                          Test Mode
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="uppercase tracking-wider text-xs font-semibold mt-1">
                      PROVIDER: {gateway.type}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Label className="text-xs text-muted-foreground">{gateway.isActive ? 'Active' : 'Inactive'}</Label>
                    <Switch 
                      checked={gateway.isActive}
                      onCheckedChange={c => handleSave(gateway.id, { isActive: c })}
                    />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(gateway.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid gap-4 mt-2">
                <div className="space-y-1">
                  <Label className="text-xs">Customer Description</Label>
                  <div className="flex gap-2">
                    <Input 
                      defaultValue={gateway.description} 
                      onBlur={e => e.target.value !== gateway.description && handleSave(gateway.id, { description: e.target.value })}
                    />
                  </div>
                </div>

                {gateway.type !== 'manual' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Public Key</Label>
                      <Input 
                        defaultValue={gateway.publicKey} 
                        onBlur={e => e.target.value !== gateway.publicKey && handleSave(gateway.id, { publicKey: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Secret Key</Label>
                      <Input 
                        type="password"
                        placeholder="••••••••••••••••"
                        defaultValue={gateway.secretKey} 
                        onBlur={e => e.target.value !== gateway.secretKey && handleSave(gateway.id, { secretKey: e.target.value })}
                      />
                    </div>
                  </div>
                )}
                
                {gateway.type !== 'manual' && (
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch 
                      checked={gateway.isTestMode}
                      onCheckedChange={c => handleSave(gateway.id, { isTestMode: c })}
                    />
                    <Label className="text-sm">Use Test/Sandbox API Keys</Label>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
