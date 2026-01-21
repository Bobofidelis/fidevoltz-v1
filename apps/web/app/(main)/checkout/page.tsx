import { CheckoutForm } from "@/components/checkout/checkout-form";

export default function CheckoutPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
