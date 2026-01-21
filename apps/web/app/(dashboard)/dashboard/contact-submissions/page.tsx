"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useContactSubmissions,
  useUpdateContactSubmission,
  useReplyToSubmission,
  useDeleteContactSubmission,
} from "@/lib/hooks/use-contact-submissions";
import {
  Search,
  Mail,
  MessageSquare,
  Cpu,
  Handshake,
  Eye,
  Trash2,
  Reply,
  Loader2,
  CheckCircle2,
  Clock,
  Archive,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

export default function ContactSubmissionsPage() {
  const [filters, setFilters] = useState({
    type: "ALL",
    status: "ALL",
    search: "",
    page: 1,
    limit: 20,
  });

  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [notes, setNotes] = useState("");

  const { data, isLoading } = useContactSubmissions(filters);
  const updateSubmission = useUpdateContactSubmission(selectedSubmission?.id || "");
  const replyToSubmission = useReplyToSubmission(selectedSubmission?.id || "");
  const deleteSubmission = useDeleteContactSubmission();

  const submissions = data?.submissions || [];
  const stats = data?.stats || {};
  const pagination = data?.pagination || {};

  const getTypeBadge = (type: string) => {
    const config = {
      GENERAL: { icon: MessageSquare, color: "bg-blue-100 text-blue-700" },
      SERVICE: { icon: Cpu, color: "bg-purple-100 text-purple-700" },
      PARTNERSHIP: { icon: Handshake, color: "bg-green-100 text-green-700" },
    };
    const { icon: Icon, color } = config[type as keyof typeof config] || config.GENERAL;
    return (
      <Badge className={`${color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {type}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const config = {
      NEW: { icon: AlertCircle, color: "bg-yellow-100 text-yellow-700" },
      IN_PROGRESS: { icon: Clock, color: "bg-blue-100 text-blue-700" },
      RESOLVED: { icon: CheckCircle2, color: "bg-green-100 text-green-700" },
      ARCHIVED: { icon: Archive, color: "bg-gray-100 text-gray-700" },
    };
    const { icon: Icon, color } = config[status as keyof typeof config] || config.NEW;
    return (
      <Badge className={`${color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const handleViewDetails = (submission: any) => {
    setSelectedSubmission(submission);
    setNotes(submission.notes || "");
    setShowDetailModal(true);
  };

  const handleReply = (submission: any) => {
    setSelectedSubmission(submission);
    setReplyMessage("");
    setShowReplyModal(true);
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) return;
    await replyToSubmission.mutateAsync(replyMessage);
    setShowReplyModal(false);
    setShowDetailModal(false);
  };

  const handleUpdateStatus = async (status: string) => {
    await updateSubmission.mutateAsync({ status });
  };

  const handleUpdateNotes = async () => {
    await updateSubmission.mutateAsync({ notes });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this submission?")) {
      await deleteSubmission.mutateAsync(id);
      setShowDetailModal(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Contact Submissions</h1>
        <p className="text-slate-600 mt-1">Manage and respond to contact form submissions</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">New</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.new || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              />
            </div>
            <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value, page: 1 })}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="GENERAL">General</SelectItem>
                <SelectItem value="SERVICE">Build Service</SelectItem>
                <SelectItem value="PARTNERSHIP">Partnership</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value, page: 1 })}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setFilters({ type: "ALL", status: "ALL", search: "", page: 1, limit: 20 })}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>
            {pagination.total || 0} total submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No submissions found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission: any) => (
                    <TableRow key={submission.id}>
                      <TableCell>{getTypeBadge(submission.type)}</TableCell>
                      <TableCell className="font-medium">{submission.name}</TableCell>
                      <TableCell>{submission.email}</TableCell>
                      <TableCell className="max-w-xs truncate">{submission.subject}</TableCell>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell>{format(new Date(submission.createdAt), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDetails(submission)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReply(submission)}
                          >
                            <Reply className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(submission.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-slate-600">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>
              Reference ID: {selectedSubmission?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              {/* Type and Status */}
              <div className="flex items-center gap-4">
                {getTypeBadge(selectedSubmission.type)}
                {getStatusBadge(selectedSubmission.status)}
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600">Name</Label>
                  <p className="mt-1">{selectedSubmission.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">Email</Label>
                  <p className="mt-1">{selectedSubmission.email}</p>
                </div>
                {selectedSubmission.organization && (
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-slate-600">Organization</Label>
                    <p className="mt-1">{selectedSubmission.organization}</p>
                  </div>
                )}
              </div>

              {/* Subject and Message */}
              <div>
                <Label className="text-sm font-medium text-slate-600">Subject</Label>
                <p className="mt-1">{selectedSubmission.subject}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-600">Message</Label>
                <p className="mt-1 whitespace-pre-wrap">{selectedSubmission.message}</p>
              </div>

              {/* Service-specific fields */}
              {selectedSubmission.type === "SERVICE" && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedSubmission.projectType && (
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Project Type</Label>
                      <p className="mt-1">{selectedSubmission.projectType}</p>
                    </div>
                  )}
                  {selectedSubmission.budget && (
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Budget</Label>
                      <p className="mt-1">{selectedSubmission.budget}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Partnership-specific fields */}
              {selectedSubmission.type === "PARTNERSHIP" && selectedSubmission.interestType && (
                <div>
                  <Label className="text-sm font-medium text-slate-600">Interest Type</Label>
                  <p className="mt-1">{selectedSubmission.interestType}</p>
                </div>
              )}

              {/* Status Update */}
              <div>
                <Label>Update Status</Label>
                <Select
                  value={selectedSubmission.status}
                  onValueChange={handleUpdateStatus}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Admin Notes */}
              <div>
                <Label>Admin Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes..."
                  className="mt-1"
                  rows={3}
                />
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={handleUpdateNotes}
                  disabled={updateSubmission.isPending}
                >
                  {updateSubmission.isPending ? "Saving..." : "Save Notes"}
                </Button>
              </div>

              {/* Admin Reply */}
              {selectedSubmission.adminReply && (
                <div>
                  <Label className="text-sm font-medium text-slate-600">Admin Reply</Label>
                  <p className="mt-1 whitespace-pre-wrap bg-slate-50 p-3 rounded">
                    {selectedSubmission.adminReply}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Replied on {format(new Date(selectedSubmission.repliedAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button onClick={() => handleReply(selectedSubmission)}>
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedSubmission.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reply Modal */}
      <Dialog open={showReplyModal} onOpenChange={setShowReplyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to {selectedSubmission?.name}</DialogTitle>
            <DialogDescription>
              Send a reply to {selectedSubmission?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Your Reply</Label>
              <Textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply message..."
                className="mt-1"
                rows={6}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowReplyModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSendReply}
                disabled={!replyMessage.trim() || replyToSubmission.isPending}
              >
                {replyToSubmission.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Reply
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
