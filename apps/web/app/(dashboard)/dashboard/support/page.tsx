"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Loader2,
  Eye,
  Trash2,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import {
  useAdminTickets,
  useUpdateTicket,
  useDeleteTicket,
  useReplyToTicket,
} from '@/lib/hooks/use-support';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function AdminSupportPage() {
  const { data: session } = useSession();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  const { data, isLoading } = useAdminTickets({
    status: statusFilter,
    priority: priorityFilter,
  });
  const updateTicket = useUpdateTicket();
  const deleteTicket = useDeleteTicket();
  const replyToTicket = useReplyToTicket();

  const tickets = data?.tickets || [];
  const stats = data?.stats || { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 };

  // Filter by search
  const filteredTickets = tickets.filter((ticket: any) => {
    const search = searchQuery.toLowerCase();
    return (
      ticket.subject.toLowerCase().includes(search) ||
      ticket.description.toLowerCase().includes(search) ||
      ticket.user?.name?.toLowerCase().includes(search) ||
      ticket.userEmail.toLowerCase().includes(search)
    );
  });

  const handleStatusChange = (ticketId: string, status: string) => {
    updateTicket.mutate({ ticketId, status });
  };

  const handlePriorityChange = (ticketId: string, priority: string) => {
    updateTicket.mutate({ ticketId, priority });
  };

  const handleDelete = (ticketId: string) => {
    if (confirm('Are you sure you want to delete this ticket?')) {
      deleteTicket.mutate(ticketId);
    }
  };

  const handleReply = () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    if (replyMessage.trim().length < 5) {
      toast.error('Message must be at least 5 characters');
      return;
    }

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
    const variants: Record<string, { color: string; icon: any }> = {
      OPEN: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      IN_PROGRESS: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      RESOLVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      CLOSED: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
    };

    const variant = variants[status] || variants.OPEN;
    const Icon = variant.icon;

    return (
      <Badge className={cn('text-xs', variant.color)} variant="outline">
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ')}
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
      <Badge className={cn('text-xs', colors[priority])} variant="outline">
        {priority}
      </Badge>
    );
  };

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Unauthorized</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Support Tickets Management
        </h1>
        <p className="text-gray-600 mt-1">Manage and respond to customer support requests</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-gray-600">Total</p>
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
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-800">{stats.closed}</div>
            <p className="text-sm text-gray-700">Closed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('ALL')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'OPEN' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('OPEN')}
                className={statusFilter === 'OPEN' ? 'bg-blue-600' : ''}
              >
                Open ({stats.open})
              </Button>
              <Button
                variant={statusFilter === 'IN_PROGRESS' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('IN_PROGRESS')}
                className={statusFilter === 'IN_PROGRESS' ? 'bg-yellow-600' : ''}
              >
                In Progress
              </Button>
              <Button
                variant={statusFilter === 'RESOLVED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('RESOLVED')}
                className={statusFilter === 'RESOLVED' ? 'bg-green-600' : ''}
              >
                Resolved
              </Button>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Priority</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No tickets found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket: any) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{ticket.user?.name || 'Guest'}</p>
                          <p className="text-xs text-gray-500">{ticket.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-semibold text-sm">{ticket.subject}</p>
                          <p className="text-xs text-gray-600 line-clamp-1">{ticket.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setShowDetailsModal(true);
                            }}
                            className="h-8 w-8 p-0"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(ticket.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

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
              {/* User Info */}
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm">
                  <span className="font-semibold">From:</span> {selectedTicket.user?.name || 'Guest'} ({selectedTicket.userEmail})
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Created {formatDistanceToNow(new Date(selectedTicket.createdAt), { addSuffix: true })}
                </p>
              </div>

              {/* Status & Priority Controls */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(value) => handleStatusChange(selectedTicket.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={selectedTicket.priority}
                    onValueChange={(value) => handlePriorityChange(selectedTicket.id, value)}
                  >
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
              </div>

              {/* Original Message */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-semibold mb-2">Original Request:</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {selectedTicket.description}
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
                        msg.isAdmin ? 'bg-purple-50 border-l-4 border-purple-500' : 'bg-blue-50 border-l-4 border-blue-500'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-sm">
                          {msg.isAdmin ? '👨‍💼 Admin' : '👤 User'}
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
                  <label className="text-sm font-medium">Admin Reply</label>
                  <Textarea
                    placeholder="Type your response here..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <Button
                    onClick={handleReply}
                    disabled={replyMessage.trim().length < 5 || replyToTicket.isPending}
                    className="w-full"
                  >
                    {replyToTicket.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Reply
                      </>
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
