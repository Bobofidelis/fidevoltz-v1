"use client";

import { useCartStore } from "@/store/cart-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatNaira } from "@/lib/utils/currency";

export default function CartPage() {
  const { 
    items, 
    removeItem, 
    incrementQuantity, 
    decrementQuantity,
    getSubtotal,
    getTax,
    getShipping,
    getTotal,
    getItemCount 
  } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 mb-6">
            <ShoppingBag className="h-12 w-12 text-slate-400" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Your Cart is Empty</h1>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
          </p>
          <Link href="/store">
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800">
              Browse Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const tax = getTax();
  const shipping = getShipping();
  const total = getTotal();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container px-4 md:px-6 py-8">
          <h1 className="text-4xl font-bold text-slate-900">Shopping Cart</h1>
          <p className="text-slate-600 mt-2">{getItemCount()} items in your cart</p>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    {/* Product Image */}
                    <div className="relative h-32 w-32 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
                      {item.image ? (
                        <div 
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url('${item.image}')` }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-400">
                          <ShoppingBag className="h-12 w-12" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Link href={`/store/product/${item.slug}`}>
                          <h3 className="font-bold text-lg text-slate-900 hover:text-blue-600 transition-colors">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-slate-500 mt-1">
                          {item.inStock ? (
                            <span className="text-green-600">In Stock ({item.stockQuantity} available)</span>
                          ) : (
                            <span className="text-red-600">Out of Stock</span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => decrementQuantity(item.productId)}
                            disabled={item.quantity <= 1}
                            className="h-9 w-9 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-semibold text-slate-900">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => incrementQuantity(item.productId)}
                            disabled={item.quantity >= item.stockQuantity}
                            className="h-9 w-9 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Price and Remove */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-slate-900">
                              {formatNaira(item.price * item.quantity)}
                            </p>
                            <p className="text-sm text-slate-500">
                              {formatNaira(item.price)} each
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => removeItem(item.productId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-slate-700">
                    <span>Subtotal</span>
                    <span className="font-semibold">{formatNaira(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Tax (8%)</span>
                    <span className="font-semibold">{formatNaira(tax)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Shipping</span>
                    <span className="font-semibold">
                      {typeof shipping === 'number' && shipping === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        formatNaira(typeof shipping === 'number' ? shipping : 0)
                      )}
                    </span>
                  </div>
                  
                  {shipping > 0 && (
                    <div className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg">
                      Add {formatNaira(50 - subtotal)} more for free shipping!
                    </div>
                  )}
                  
                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex justify-between text-lg font-bold text-slate-900">
                      <span>Total</span>
                      <span>{formatNaira(total)}</span>
                    </div>
                  </div>
                </div>

                <Link href="/checkout">
                  <Button size="lg" className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/store">
                  <Button variant="outline" size="lg" className="w-full mt-3">
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
