"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { useQuery } from "@tanstack/react-query";
import {
  useUpdateContactSubmission,
  useReplyToSubmission,
  useDeleteContactSubmission,
} from "@/lib/hooks/use-contact-submissions";
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  Cpu,
  Handshake,
  Reply,
  Trash2,
  Loader2,
  CheckCircle2,
  Clock,
  Archive,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default function ContactSubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [notes, setNotes] = useState("");

  const { data: submission, isLoading } = useQuery({
    queryKey: ['contact-submission', id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/contact-submissions/${id}`);
      if (!response.ok) throw new Error('Failed to fetch submission');
      const result = await response.json();
      return result.data;
    },
  });

  const updateSubmission = useUpdateContactSubmission(id);
  const replyToSubmission = useReplyToSubmission(id);
  const deleteSubmission = useDeleteContactSubmission();

  useState(() => {
    if (submission) {
      setNotes(submission.notes || "");
    }
  });

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

  const handleSendReply = async () => {
    if (!replyMessage.trim()) return;
    await replyToSubmission.mutateAsync(replyMessage);
    setShowReplyModal(false);
  };

  const handleUpdateStatus = async (status: string) => {
    await updateSubmission.mutateAsync({ status });
  };

  const handleUpdateNotes = async () => {
    await updateSubmission.mutateAsync({ notes });
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this submission?")) {
      await deleteSubmission.mutateAsync(id);
      router.push("/dashboard/contact-submissions");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Submission Not Found</h1>
        <p className="text-slate-600 mb-4">The submission you're looking for doesn't exist.</p>
        <Link href="/dashboard/contact-submissions">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Submissions
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/contact-submissions">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Submissions
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Submission Details</h1>
          <p className="text-slate-600 mt-1">Reference ID: {submission.id}</p>
        </div>
        <div className="flex gap-2">
          {getTypeBadge(submission.type)}
          {getStatusBadge(submission.status)}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Submission Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600">Name</Label>
                  <p className="mt-1">{submission.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">Email</Label>
                  <p className="mt-1">{submission.email}</p>
                </div>
                {submission.organization && (
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-slate-600">Organization</Label>
                    <p className="mt-1">{submission.organization}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Message */}
          <Card>
            <CardHeader>
              <CardTitle>Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-600">Subject</Label>
                <p className="mt-1 font-medium">{submission.subject}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-600">Message</Label>
                <p className="mt-1 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg">
                  {submission.message}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Service/Partnership Specific Fields */}
          {(submission.type === "SERVICE" || submission.type === "PARTNERSHIP") && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {submission.projectType && (
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Project Type</Label>
                      <p className="mt-1">{submission.projectType}</p>
                    </div>
                  )}
                  {submission.budget && (
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Budget</Label>
                      <p className="mt-1">{submission.budget}</p>
                    </div>
                  )}
                  {submission.interestType && (
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Interest Type</Label>
                      <p className="mt-1">{submission.interestType}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin Reply */}
          {submission.adminReply && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Reply</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap bg-green-50 p-4 rounded-lg border border-green-200">
                  {submission.adminReply}
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Replied on {format(new Date(submission.repliedAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Actions & Management */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Update Status</Label>
                <Select value={submission.status} onValueChange={handleUpdateStatus}>
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
              <div className="text-sm text-slate-600">
                <p>Created: {format(new Date(submission.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
                <p>Updated: {format(new Date(submission.updatedAt), "MMM d, yyyy 'at' h:mm a")}</p>
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal notes..."
                rows={4}
              />
              <Button
                size="sm"
                className="w-full"
                onClick={handleUpdateNotes}
                disabled={updateSubmission.isPending}
              >
                {updateSubmission.isPending ? "Saving..." : "Save Notes"}
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                onClick={() => setShowReplyModal(true)}
              >
                <Reply className="h-4 w-4 mr-2" />
                Reply via Email
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Submission
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reply Modal */}
      <Dialog open={showReplyModal} onOpenChange={setShowReplyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to {submission.name}</DialogTitle>
            <DialogDescription>
              Send a reply to {submission.email}
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
