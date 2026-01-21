"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Eye, Trash2, Play, Pause, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAds, useDeleteAd, useUpdateAd } from "@/lib/hooks/use-ads";
import { formatDistanceToNow } from "date-fns";

export default function AdsManagementPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data, isLoading } = useAds({ status: statusFilter });
  const deleteAd = useDeleteAd();

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this ad?")) {
      await deleteAd.mutateAsync(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      ACTIVE: "default",
      DRAFT: "secondary",
      PAUSED: "outline",
      SCHEDULED: "default",
      EXPIRED: "destructive",
    };

    const colors: any = {
      ACTIVE: "bg-green-600",
      DRAFT: "bg-gray-600",
      PAUSED: "bg-yellow-600",
      SCHEDULED: "bg-blue-600",
      EXPIRED: "bg-red-600",
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status}
      </Badge>
    );
  };

  const filteredAds = data?.ads?.filter((ad: any) =>
    ad.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "SEO & Ads", href: "/dashboard/seo" },
          { label: "Advertisements" },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/seo">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ad Management
            </h1>
            <p className="text-gray-500 mt-1">Create and manage your advertisements</p>
          </div>
        </div>
        <Link href="/dashboard/seo-ads/ads/new">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Ad
          </Button>
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Total Ads</div>
            <div className="text-2xl font-bold">{data?.stats?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Active</div>
            <div className="text-2xl font-bold text-green-600">
              {data?.stats?.active || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Draft</div>
            <div className="text-2xl font-bold text-gray-600">
              {data?.stats?.draft || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Paused</div>
            <div className="text-2xl font-bold text-yellow-600">
              {data?.stats?.paused || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Advertisements</CardTitle>
            <div className="flex gap-3">
              <Input
                placeholder="Search ads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="PAUSED">Paused</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No ads found</p>
              <Link href="/dashboard/seo-ads/ads/new">
                <Button className="mt-4">Create Your First Ad</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Impressions</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>CTR</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAds.map((ad: any) => {
                  const ctr = ad.impressions > 0
                    ? ((ad.clicks / ad.impressions) * 100).toFixed(2)
                    : 0;

                  return (
                    <TableRow key={ad.id}>
                      <TableCell className="font-medium">{ad.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{ad.type}</Badge>
                      </TableCell>
                      <TableCell>{ad.format}</TableCell>
                      <TableCell>{getStatusBadge(ad.status)}</TableCell>
                      <TableCell>{ad.impressions.toLocaleString()}</TableCell>
                      <TableCell>{ad.clicks.toLocaleString()}</TableCell>
                      <TableCell>{ctr}%</TableCell>
                      <TableCell>${ad.revenue.toFixed(2)}</TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(ad.createdAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/dashboard/seo-ads/ads/${ad.id}`}>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem
                              onClick={() => handleDelete(ad.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
