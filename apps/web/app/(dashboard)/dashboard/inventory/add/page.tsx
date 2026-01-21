"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Package, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function AddInventoryItemPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/inventory">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add Inventory Item</h2>
          <p className="text-muted-foreground">
            Manually add stock or register a new SKU.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
          <CardDescription>
            Link stock to an existing product or create a standalone inventory item.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="product">Product</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select existing product..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prod-1">Arduino Uno R3</SelectItem>
                <SelectItem value="prod-2">Raspberry Pi 4</SelectItem>
                <SelectItem value="prod-3">ESP32 Dev Board</SelectItem>
                <SelectItem value="new">+ Create New Product</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
            <Input id="sku" placeholder="e.g. ARD-UNO-R3" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stock">Current Stock</Label>
              <Input id="stock" type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">Low Stock Threshold</Label>
              <Input id="minStock" type="number" placeholder="10" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Warehouse Location</Label>
            <Input id="location" placeholder="e.g. Aisle 4, Shelf B" />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Auto-Reorder</Label>
              <p className="text-sm text-muted-foreground">
                Automatically notify supplier when stock is low.
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Link href="/dashboard/inventory">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Save Item
        </Button>
      </div>
    </div>
  );
}
