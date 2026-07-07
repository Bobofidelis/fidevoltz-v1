"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/store/cart-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FadeIn } from "@/components/ui/motion";
import { formatNaira } from "@/lib/utils/currency";
import { MapPin, CreditCard, CheckCircle2, ChevronRight, Check, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const addressSchema = z.object({
  name: z.string().min(2, "Name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  isDefault: z.boolean().default(false),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export function CheckoutForm() {
  const { items, selectedItems, clearCart, getSelectedTotal, getSelectedSubtotal, getSelectedTax, getSelectedShipping } = useCartStore();
  const router = useRouter();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [gateways, setGateways] = useState<any[]>([]);
  const [selectedGatewayId, setSelectedGatewayId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter only selected items for checkout
  const checkoutItems = items.filter(item => selectedItems.includes(item.productId));
  const subtotal = getSelectedSubtotal();
  const tax = getSelectedTax();
  const shipping = getSelectedShipping();
  const total = getSelectedTotal();

  const addressForm = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      phone: "",
      isDefault: false,
    },
  });

  useEffect(() => {
    if (checkoutItems.length === 0) {
      router.push('/cart');
      return;
    }
    
    // Fetch addresses and gateways
    Promise.all([
      fetch('/api/user/addresses').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/payment-gateways').then(r => r.json()).catch(() => ({ data: [] }))
    ]).then(([addressRes, gatewayRes]) => {
      if (addressRes?.data) {
        setAddresses(addressRes.data);
        const defaultAddr = addressRes.data.find((a: any) => a.isDefault);
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        else if (addressRes.data.length > 0) setSelectedAddressId(addressRes.data[0].id);
        else setIsAddingNewAddress(true);
      }
      
      if (gatewayRes?.data) {
        setGateways(gatewayRes.data);
        if (gatewayRes.data.length > 0) setSelectedGatewayId(gatewayRes.data[0].id);
      }
    });
  }, []);

  const onAddAddress = async (data: AddressFormValues) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      
      if (result.success) {
        toast.success("Address saved");
        setAddresses([...addresses, result.data]);
        setSelectedAddressId(result.data.id);
        setIsAddingNewAddress(false);
        addressForm.reset();
      } else {
        toast.error(result.error || "Failed to save address");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId || !selectedGatewayId) {
      toast.error("Please select an address and payment method");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkoutItems,
          shippingAddressId: selectedAddressId,
          paymentGatewayId: selectedGatewayId,
          subtotal,
          tax,
          shipping,
          total
        }),
      });
      
      const result = await res.json();
      
      if (result.success) {
        toast.success("Order placed successfully!");
        clearCart();
        router.push(`/orders/${result.data.orderId}`);
      } else {
        toast.error(result.error || "Failed to place order");
      }
    } catch (e) {
      toast.error("An error occurred while placing your order");
    } finally {
      setIsLoading(false);
    }
  };

  if (checkoutItems.length === 0) return null;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        
        {/* Step 1: Address */}
        <Card className={`transition-all duration-300 ${step === 1 ? 'ring-2 ring-blue-500 shadow-md' : 'opacity-70'}`}>
          <CardHeader className="flex flex-row items-center justify-between cursor-pointer" onClick={() => step > 1 && setStep(1)}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${step >= 1 ? 'bg-blue-600' : 'bg-slate-300'}`}>
                {step > 1 ? <Check className="w-5 h-5" /> : "1"}
              </div>
              <CardTitle>Shipping Address</CardTitle>
            </div>
            {step > 1 && selectedAddressId && (
              <span className="text-sm font-medium text-blue-600 hover:underline">Edit</span>
            )}
          </CardHeader>
          
          {step === 1 && (
            <CardContent className="space-y-4">
              {!isAddingNewAddress && addresses.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {addresses.map(addr => (
                    <div 
                      key={addr.id} 
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedAddressId === addr.id 
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-slate-900">{addr.name}</h4>
                        {addr.isDefault && <span className="bg-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Default</span>}
                      </div>
                      <p className="text-sm text-slate-600">{addr.address}</p>
                      <p className="text-sm text-slate-600">{addr.city}, {addr.state}</p>
                      <p className="text-sm text-slate-600 mt-2">{addr.phone}</p>
                    </div>
                  ))}
                  
                  <div 
                    onClick={() => setIsAddingNewAddress(true)}
                    className="p-4 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-slate-50 transition-colors h-full min-h-[120px]"
                  >
                    <Plus className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm font-medium text-slate-600">Add New Address</span>
                  </div>
                </div>
              )}

              {(isAddingNewAddress || addresses.length === 0) && (
                <form id="address-form" onSubmit={addressForm.handleSubmit(onAddAddress)} className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-slate-900">New Address</h4>
                    {addresses.length > 0 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingNewAddress(false)}>Cancel</Button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" {...addressForm.register("name")} />
                    {addressForm.formState.errors.name && <p className="text-xs text-red-500">{addressForm.formState.errors.name.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address line</Label>
                    <Input id="address" {...addressForm.register("address")} />
                    {addressForm.formState.errors.address && <p className="text-xs text-red-500">{addressForm.formState.errors.address.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" {...addressForm.register("city")} />
                      {addressForm.formState.errors.city && <p className="text-xs text-red-500">{addressForm.formState.errors.city.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" {...addressForm.register("state")} />
                      {addressForm.formState.errors.state && <p className="text-xs text-red-500">{addressForm.formState.errors.state.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" {...addressForm.register("phone")} />
                    {addressForm.formState.errors.phone && <p className="text-xs text-red-500">{addressForm.formState.errors.phone.message}</p>}
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id="isDefault" {...addressForm.register("isDefault")} />
                    <Label htmlFor="isDefault" className="font-normal cursor-pointer">Set as default address</Label>
                  </div>

                  <Button type="submit" disabled={isLoading} className="mt-4">
                    {isLoading ? "Saving..." : "Save Address"}
                  </Button>
                </form>
              )}
            </CardContent>
          )}
          
          {step === 1 && (
            <CardFooter className="bg-slate-50 border-t border-slate-100 p-4">
              <Button 
                className="ml-auto w-full sm:w-auto" 
                onClick={() => setStep(2)}
                disabled={!selectedAddressId || isAddingNewAddress}
              >
                Continue to Payment
                <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Step 2: Payment */}
        <Card className={`transition-all duration-300 ${step === 2 ? 'ring-2 ring-blue-500 shadow-md' : 'opacity-70'}`}>
          <CardHeader className="flex flex-row items-center justify-between cursor-pointer" onClick={() => (step > 2 || (step === 1 && selectedAddressId)) && setStep(2)}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${step >= 2 ? 'bg-blue-600' : 'bg-slate-300'}`}>
                {step > 2 ? <Check className="w-5 h-5" /> : "2"}
              </div>
              <CardTitle>Payment Method</CardTitle>
            </div>
            {step > 2 && selectedGatewayId && (
              <span className="text-sm font-medium text-blue-600 hover:underline">Edit</span>
            )}
          </CardHeader>
          
          {step === 2 && (
            <CardContent>
              {gateways.length === 0 ? (
                <div className="text-center py-6 text-slate-500 bg-slate-50 rounded-lg">
                  No active payment gateways available. Please contact support.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {gateways.map(gateway => (
                    <div 
                      key={gateway.id} 
                      onClick={() => setSelectedGatewayId(gateway.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedGatewayId === gateway.id 
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <CreditCard className={`w-6 h-6 ${selectedGatewayId === gateway.id ? 'text-blue-600' : 'text-slate-400'}`} />
                        <h4 className="font-semibold text-slate-900 capitalize">{gateway.name}</h4>
                      </div>
                      <p className="text-xs text-slate-500">{gateway.description || `Pay securely with ${gateway.name}`}</p>
                      {gateway.isTestMode && (
                        <div className="mt-2 inline-block bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                          Test Mode
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          )}

          {step === 2 && (
            <CardFooter className="bg-slate-50 border-t border-slate-100 p-4">
              <Button 
                variant="outline"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button 
                className="ml-auto" 
                onClick={() => setStep(3)}
                disabled={!selectedGatewayId}
              >
                Review Order
                <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Step 3: Review */}
        <Card className={`transition-all duration-300 ${step === 3 ? 'ring-2 ring-blue-500 shadow-md' : 'opacity-70'}`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${step === 3 ? 'bg-blue-600' : 'bg-slate-300'}`}>
                3
              </div>
              <CardTitle>Review & Place Order</CardTitle>
            </div>
          </CardHeader>
          
          {step === 3 && (
            <CardContent>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                <h4 className="font-medium text-slate-900 mb-2">Delivering to:</h4>
                {addresses.find(a => a.id === selectedAddressId)?.name && (
                  <p className="text-sm text-slate-600">
                    {addresses.find(a => a.id === selectedAddressId)?.name} <br/>
                    {addresses.find(a => a.id === selectedAddressId)?.address}, {addresses.find(a => a.id === selectedAddressId)?.city}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-slate-900">Order Items:</h4>
                {checkoutItems.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-md overflow-hidden bg-cover bg-center" style={{ backgroundImage: item.image ? `url('${item.image}')` : undefined }} />
                      <div>
                        <p className="font-medium text-sm text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-sm">{formatNaira(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          )}

          {step === 3 && (
            <CardFooter className="bg-slate-50 border-t border-slate-100 p-4">
              <Button 
                variant="outline"
                onClick={() => setStep(2)}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button 
                className="ml-auto bg-green-600 hover:bg-green-700" 
                onClick={handlePlaceOrder}
                disabled={isLoading || !selectedAddressId || !selectedGatewayId}
              >
                {isLoading ? "Processing..." : `Pay ${formatNaira(total)}`}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      <FadeIn delay={0.2} className="lg:col-span-1">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Items ({checkoutItems.length})</span>
                <span className="font-medium text-slate-900">{formatNaira(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax</span>
                <span className="font-medium text-slate-900">{formatNaira(tax)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? <span className="text-green-600">FREE</span> : <span className="text-slate-900">{formatNaira(shipping)}</span>}
                </span>
              </div>
            </div>
            
            <div className="border-t border-slate-200 pt-4">
              <div className="flex justify-between items-center font-bold text-lg text-slate-900">
                <span>Total</span>
                <span>{formatNaira(total)}</span>
              </div>
            </div>
            
            <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded flex gap-2 items-start">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <p>You're checking out securely. All transactions are encrypted.</p>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
