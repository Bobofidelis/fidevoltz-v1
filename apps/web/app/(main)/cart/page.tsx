"use client";

import { useCartStore } from "@/store/cart-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckSquare, Square, Tag } from "lucide-react";
import Link from "next/link";
import { formatNaira } from "@/lib/utils/currency";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";

export default function CartPage() {
  const { 
    items, 
    removeItem, 
    updateQuantity,
    incrementQuantity, 
    decrementQuantity,
    getItemCount,
    
    // Selection state
    selectedItems,
    toggleItemSelection,
    selectAllItems,
    clearSelection,
    removeSelectedItems,
    getSelectedSubtotal,
    getSelectedTax,
    getSelectedShipping,
    getSelectedTotal,
    clearCart
  } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center px-4 animate-in fade-in zoom-in duration-500">
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

  const subtotal = getSelectedSubtotal();
  const tax = getSelectedTax();
  const shipping = getSelectedShipping();
  const total = getSelectedTotal();
  const allSelected = items.length > 0 && selectedItems.length === items.length;
  const hasSelection = selectedItems.length > 0;
  
  const FREE_SHIPPING_THRESHOLD = 50;
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAllItems();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container px-4 md:px-6 py-8">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Shopping Cart</h1>
              <p className="text-slate-600 mt-2">{getItemCount()} items in your cart</p>
            </div>
            <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600" onClick={clearCart}>
              Empty Cart
            </Button>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Bulk Actions Header */}
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={allSelected} 
                  onCheckedChange={handleSelectAll}
                  id="select-all"
                />
                <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                  Select All ({items.length})
                </label>
              </div>
              
              {hasSelection && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={removeSelectedItems}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedItems.length})
                </Button>
              )}
            </div>

            {items.map((item) => {
              const isSelected = selectedItems.includes(item.productId);
              
              return (
                <Card key={item.id} className={`overflow-hidden transition-all ${isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-md'}`}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex gap-4">
                      {/* Checkbox */}
                      <div className="pt-2">
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => toggleItemSelection(item.productId)}
                        />
                      </div>
                      
                      <div className="flex-1 flex flex-col sm:flex-row gap-4 sm:gap-6">
                        {/* Product Image */}
                        <div className="relative h-28 w-28 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                          {item.image ? (
                            <div 
                              className="absolute inset-0 bg-cover bg-center"
                              style={{ backgroundImage: `url('${item.image}')` }}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">
                              <ShoppingBag className="h-10 w-10" />
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <Link href={`/store/product/${item.slug}`}>
                                <h3 className="font-bold text-lg text-slate-900 hover:text-blue-600 transition-colors line-clamp-2">
                                  {item.name}
                                </h3>
                              </Link>
                              <p className="text-sm text-slate-500 mt-1">
                                {item.inStock ? (
                                  <span className="text-emerald-600 font-medium">In Stock ({item.stockQuantity} available)</span>
                                ) : (
                                  <span className="text-red-600 font-medium">Out of Stock</span>
                                )}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-400 hover:text-red-500 -mt-2 -mr-2"
                              onClick={() => removeItem(item.productId)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>

                          <div className="flex items-end justify-between mt-4">
                            {/* Quantity Controls */}
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-slate-500 font-medium">Quantity</span>
                              <div className="flex items-center gap-1 border border-slate-200 rounded-md p-0.5">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => decrementQuantity(item.productId)}
                                  disabled={item.quantity <= 1}
                                  className="h-8 w-8 p-0 text-slate-600 hover:bg-slate-100"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <Input 
                                  type="number"
                                  min="1"
                                  max={item.stockQuantity}
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val)) updateQuantity(item.productId, val);
                                  }}
                                  className="w-12 h-8 text-center border-none shadow-none focus-visible:ring-0 p-0 font-medium text-slate-900 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => incrementQuantity(item.productId)}
                                  disabled={item.quantity >= item.stockQuantity}
                                  className="h-8 w-8 p-0 text-slate-600 hover:bg-slate-100"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <p className="text-xl font-bold text-slate-900">
                                {formatNaira(item.price * item.quantity)}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {formatNaira(item.price)} each
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-sm border-slate-200">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
                
                {!hasSelection ? (
                  <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <CheckSquare className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">Select items to checkout</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-slate-600 text-sm">
                        <span>Selected Items ({selectedItems.length})</span>
                        <span className="font-medium text-slate-900">{formatNaira(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 text-sm">
                        <span>Tax (8%)</span>
                        <span className="font-medium text-slate-900">{formatNaira(tax)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 text-sm">
                        <span>Shipping</span>
                        <span className="font-medium">
                          {shipping === 0 ? (
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold">FREE</span>
                          ) : (
                            <span className="text-slate-900">{formatNaira(shipping)}</span>
                          )}
                        </span>
                      </div>
                      
                      {shippingProgress < 100 && (
                        <div className="pt-2">
                          <div className="flex justify-between text-xs mb-2">
                            <span className="text-slate-500">Add <strong className="text-slate-900">{formatNaira(FREE_SHIPPING_THRESHOLD - subtotal)}</strong> for free shipping</span>
                          </div>
                          <Progress value={shippingProgress} className="h-2 bg-slate-100" />
                        </div>
                      )}
                      
                      <div className="border-t border-slate-200 pt-4 mt-4">
                        <div className="flex justify-between items-center text-lg font-bold text-slate-900">
                          <span>Total</span>
                          <span className="text-2xl">{formatNaira(total)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input placeholder="Coupon code" className="pl-9 h-10 text-sm" />
                        </div>
                        <Button variant="secondary" className="h-10">Apply</Button>
                      </div>
                    </div>

                    <Link href="/checkout">
                      <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                        Proceed to Checkout
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </>
                )}

                <Link href="/store" className="block mt-4">
                  <Button variant="ghost" className="w-full text-slate-600 hover:text-slate-900 hover:bg-slate-50">
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
