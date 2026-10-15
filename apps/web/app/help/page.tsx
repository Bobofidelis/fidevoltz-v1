"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Search, HelpCircle, Mail, MessageSquare, FileText, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "item-1",
    question: "How do I track my order?",
    answer: "You can track your order by logging into your account and visiting the \"Orders\" section. Alternatively, check the shipping confirmation email for a tracking link.",
  },
  {
    id: "item-2",
    question: "What is your return policy?",
    answer: "We accept returns within 30 days of purchase for unused items in original packaging. Please visit our Returns page to initiate a return request.",
  },
  {
    id: "item-3",
    question: "Do you ship internationally?",
    answer: "Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location and will be calculated at checkout.",
  },
  {
    id: "item-4",
    question: "Where can I find datasheets for components?",
    answer: "Datasheets are available on the product page for each component. Look for the \"Documents\" or \"Datasheet\" tab in the product description.",
  },
  {
    id: "item-5",
    question: "Can I request a custom order?",
    answer: "For bulk orders or specific components not listed on our site, please contact our sales team directly using the form on this page.",
  },
];

export default function HelpCenterPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketEmail, setTicketEmail] = useState("");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.question.toLowerCase().includes(q) ||
      item.answer.toLowerCase().includes(q)
    );
  });

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailToSend = session?.user?.email || ticketEmail.trim();
    if (!emailToSend || !emailToSend.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (ticketSubject.trim().length < 5) {
      toast.error("Subject must be at least 5 characters.");
      return;
    }

    if (ticketMessage.trim().length < 10) {
      toast.error("Message must be at least 10 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = session?.user ? "/api/support/tickets" : "/api/support/tickets/public";
      const payload = session?.user
        ? {
            subject: ticketSubject.trim(),
            description: ticketMessage.trim(),
            priority: "MEDIUM",
          }
        : {
            userEmail: emailToSend,
            subject: ticketSubject.trim(),
            description: ticketMessage.trim(),
            priority: "MEDIUM",
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit ticket");
      }

      toast.success(data.message || "Support ticket submitted successfully. We'll get back to you soon.");
      setTicketSubject("");
      setTicketMessage("");
      if (!session?.user) {
        setTicketEmail("");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit support ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 bg-black rounded-full flex items-center justify-center text-white">F</div>
            FideVoltz
          </Link>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/">Go to Store</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight mb-4">How can we help you?</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Search our knowledge base or get in touch with our support team.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              className="pl-10 h-12 text-lg" 
              placeholder="Search for answers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 grid gap-12 lg:grid-cols-3">
        {/* FAQs */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
              {searchQuery && (
                <span className="text-sm text-muted-foreground">
                  {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'}
                </span>
              )}
            </div>

            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-lg border border-slate-200">
                <HelpCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="font-medium text-slate-700">No matching questions found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try searching with different keywords or submit a support ticket.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {filteredFaqs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <FileText className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle>Documentation</CardTitle>
                <CardDescription>Detailed guides, tutorials, and references.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="link" className="px-0" asChild>
                  <Link href="/projects">
                    View Guides & Docs <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <MessageSquare className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle>Community & Contact</CardTitle>
                <CardDescription>Join the discussion or talk to our team.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="link" className="px-0" asChild>
                  <Link href="/contact">
                    Contact Us <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>
                Can't find what you're looking for? Send us a message.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                {!session?.user ? (
                  <div className="space-y-2">
                    <Label htmlFor="email">Your Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      placeholder="you@example.com" 
                      value={ticketEmail}
                      onChange={(e) => setTicketEmail(e.target.value)}
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-1 p-2.5 rounded-md bg-slate-50 border border-slate-200">
                    <Label className="text-xs text-muted-foreground">Submitting as</Label>
                    <p className="text-sm font-medium text-slate-800">{session.user.email}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject" 
                    placeholder="Brief summary of issue (min 5 characters)" 
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    required
                    minLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Describe your issue in detail (min 10 characters)..." 
                    className="min-h-[150px]"
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    required
                    minLength={10}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Submit Ticket
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
