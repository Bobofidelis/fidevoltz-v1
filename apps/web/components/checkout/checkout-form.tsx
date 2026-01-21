"use client";

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

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address is too short"),
  city: z.string().min(2, "City is too short"),
  zipCode: z.string().min(3, "Zip code is too short"),
  cardNumber: z.string().min(16, "Invalid card number").max(16, "Invalid card number"),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "Invalid expiry date (MM/YY)"),
  cvv: z.string().min(3, "Invalid CVV").max(3, "Invalid CVV"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export function CheckoutForm() {
  const { items, clearCart, getTotal, getSubtotal, getTax, getShipping } = useCartStore();
  const router = useRouter();
  
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      email: "",
      address: "",
      city: "",
      zipCode: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    console.log("Order placed:", { ...data, items, total: getTotal() });
    
    toast.success("Order placed successfully!");
    clearCart();
    router.push("/orders/12345"); // Redirect to dummy order tracking
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Button onClick={() => router.push("/store")}>Go to Store</Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <FadeIn delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle>Shipping & Payment</CardTitle>
            <CardDescription>Enter your details to complete the purchase.</CardDescription>
          </CardHeader>
          <CardContent>
            <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" {...form.register("fullName")} />
                {form.formState.errors.fullName && (
                  <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...form.register("email")} />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...form.register("address")} />
                {form.formState.errors.address && (
                  <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...form.register("city")} />
                  {form.formState.errors.city && (
                    <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input id="zipCode" {...form.register("zipCode")} />
                  {form.formState.errors.zipCode && (
                    <p className="text-sm text-destructive">{form.formState.errors.zipCode.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input id="cardNumber" placeholder="1234 5678 9012 3456" {...form.register("cardNumber")} />
                {form.formState.errors.cardNumber && (
                  <p className="text-sm text-destructive">{form.formState.errors.cardNumber.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input id="expiryDate" placeholder="MM/YY" {...form.register("expiryDate")} />
                  {form.formState.errors.expiryDate && (
                    <p className="text-sm text-destructive">{form.formState.errors.expiryDate.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="123" {...form.register("cvv")} />
                  {form.formState.errors.cvv && (
                    <p className="text-sm text-destructive">{form.formState.errors.cvv.message}</p>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 bg-muted rounded flex items-center justify-center text-xs">Img</div>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p>{formatNaira(item.price * item.quantity)}</p>
              </div>
            ))}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-slate-700">
                <span>Subtotal</span>
                <span>{formatNaira(getSubtotal())}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Tax (8%)</span>
                <span>{formatNaira(getTax())}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Shipping</span>
                <span>{getShipping() === 0 ? 'FREE' : formatNaira(getShipping())}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatNaira(getTotal())}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              size="lg" 
              type="submit" 
              form="checkout-form"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Processing..." : "Place Order"}
            </Button>
          </CardFooter>
        </Card>
      </FadeIn>
    </div>
  );
}
