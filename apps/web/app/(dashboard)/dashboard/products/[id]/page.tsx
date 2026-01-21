"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Plus, X, Save } from "lucide-react";
import { MediaPicker } from "@/components/media/MediaPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data fetch
const getProduct = (id: string) => ({
  id,
  name: "Arduino Uno R3",
  description: "The Arduino Uno is an open-source microcontroller board based on the Microchip ATmega328P microcontroller and developed by Arduino.cc.",
  price: 24.99,
  stock: 150,
  category: "microcontrollers",
  brand: "arduino",
  specs: [
    { key: "Microcontroller", value: "ATmega328P" },
    { key: "Operating Voltage", value: "5V" },
    { key: "Input Voltage", value: "7-12V" }
  ],
  images: [
    "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=800&q=80"
  ]
});

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);

  useEffect(() => {
    // Simulate fetch
    const data = getProduct(id);
    setProduct(data);
    setImages(data.images);
    setSpecs(data.specs);
  }, [id]);

  if (!product) return <div>Loading...</div>;



  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addSpec = () => {
    setSpecs([...specs, { key: "", value: "" }]);
  };

  const updateSpec = (index: number, field: "key" | "value", value: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  const removeSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
          <p className="text-muted-foreground">
            Update product details and inventory.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" defaultValue={product.name} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  defaultValue={product.description}
                  className="min-h-[150px]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input id="price" type="number" defaultValue={product.price} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input id="stock" type="number" defaultValue={product.stock} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {specs.map((spec, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <Input 
                    placeholder="Feature" 
                    value={spec.key}
                    onChange={(e) => updateSpec(index, "key", e.target.value)}
                  />
                  <Input 
                    placeholder="Value" 
                    value={spec.value}
                    onChange={(e) => updateSpec(index, "value", e.target.value)}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeSpec(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addSpec} className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Add Specification
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select defaultValue={product.category}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="microcontrollers">Microcontrollers</SelectItem>
                    <SelectItem value="sensors">Sensors</SelectItem>
                    <SelectItem value="components">Components</SelectItem>
                    <SelectItem value="tools">Tools</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Brand</Label>
                <Select defaultValue={product.brand}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="arduino">Arduino</SelectItem>
                    <SelectItem value="raspberry-pi">Raspberry Pi</SelectItem>
                    <SelectItem value="espressif">Espressif</SelectItem>
                    <SelectItem value="generic">Generic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

            <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MediaPicker
                value={images}
                onChange={(media) => {
                  if (Array.isArray(media)) {
                    // Start or end of array
                  } else if (media) {
                     setImages([...images, media.secureUrl || media.url]);
                  }
                }}
                mediaType="IMAGE"
                multiple={true}
              />
              <div className="grid grid-cols-2 gap-4 mt-4">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                    <img src={img} alt={`Product ${index + 1}`} className="object-cover w-full h-full" />
                    <button 
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Link href="/dashboard/products">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
