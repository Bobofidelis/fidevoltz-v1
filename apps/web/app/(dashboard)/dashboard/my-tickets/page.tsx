"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, MessageSquare, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useUserTickets, useCreateTicket, useReplyToTicket } from '@/lib/hooks/use-support';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function MyTicketsPage() {
  const { data: session } = useSession();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState('');

  // Form state
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  const { data: tickets, isLoading } = useUserTickets();
  const createTicket = useCreateTicket();
  const replyToTicket = useReplyToTicket();

  const handleCreateTicket = () => {
    if (!subject.trim() || !description.trim()) return;

    createTicket.mutate(
      { subject, description, priority },
      {
        onSuccess: () => {
          setShowCreateModal(false);
          setSubject('');
          setDescription('');
          setPriority('MEDIUM');
        },
      }
    );
  };

  const handleReply = () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    replyToTicket.mutate(
      { ticketId: selectedTicket.id, message: replyMessage },
      {
        onSuccess: () => {
          setReplyMessage('');
        },
      }
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any; label: string }> = {
      OPEN: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Clock, label: 'Open' },
      IN_PROGRESS: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock, label: 'In Progress' },
      RESOLVED: { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle2, label: 'Resolved' },
      CLOSED: { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: XCircle, label: 'Closed' },
    };

    const variant = variants[status] || variants.OPEN;
    const Icon = variant.icon;

    return (
      <Badge className={cn('text-xs', variant.color)} variant="outline">
        <Icon className="h-3 w-3 mr-1" />
        {variant.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={cn('text-xs', colors[priority] || colors.MEDIUM)} variant="outline">
        {priority}
      </Badge>
    );
  };

  const stats = {
    total: tickets?.length || 0,
    open: tickets?.filter((t: any) => t.status === 'OPEN').length || 0,
    inProgress: tickets?.filter((t: any) => t.status === 'IN_PROGRESS').length || 0,
    resolved: tickets?.filter((t: any) => t.status === 'RESOLVED').length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            My Support Tickets
          </h1>
          <p className="text-gray-600 mt-1">Create and manage your support requests</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-gray-600">Total Tickets</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-800">{stats.open}</div>
            <p className="text-sm text-blue-700">Open</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-yellow-800">{stats.inProgress}</div>
            <p className="text-sm text-yellow-700">In Progress</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-800">{stats.resolved}</div>
            <p className="text-sm text-green-700">Resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : !tickets || tickets.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No tickets yet</p>
              <p className="text-sm text-gray-400 mt-1">Create your first support ticket</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket: any) => (
                <div
                  key={ticket.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setShowDetailsModal(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {ticket.description}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                    <span>Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
                    {ticket.messages && ticket.messages.length > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {ticket.messages.length} {ticket.messages.length === 1 ? 'reply' : 'replies'}
                      </span>
                    )}
                    {ticket.assignedAdmin && (
                      <span>Assigned to {ticket.assignedAdmin.name}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Ticket Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject *</label>
              <Input
                placeholder="Brief description of your issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                placeholder="Provide detailed information about your issue"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTicket}
              disabled={!subject.trim() || !description.trim() || createTicket.isPending}
            >
              {createTicket.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Ticket'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTicket.subject}</DialogTitle>
              <div className="flex gap-2 mt-2">
                {getStatusBadge(selectedTicket.status)}
                {getPriorityBadge(selectedTicket.priority)}
              </div>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Original Message */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {formatDistanceToNow(new Date(selectedTicket.createdAt), { addSuffix: true })}
                </p>
              </div>

              {/* Messages */}
              {selectedTicket.messages && selectedTicket.messages.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Conversation</h4>
                  {selectedTicket.messages.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'p-4 rounded-lg',
                        msg.isAdmin ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-sm">
                          {msg.isAdmin ? '👨‍💼 Admin' : '👤 You'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              {selectedTicket.status !== 'CLOSED' && (
                <div className="space-y-2 pt-4 border-t">
                  <label className="text-sm font-medium">Add Reply</label>
                  <Textarea
                    placeholder="Type your message here..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <Button
                    onClick={handleReply}
                    disabled={!replyMessage.trim() || replyToTicket.isPending}
                    className="w-full"
                  >
                    {replyToTicket.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reply'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
