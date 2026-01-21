"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, HelpCircle, Mail, MessageSquare, FileText, ArrowRight } from "lucide-react";
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

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search logic here
    console.log("Searching for:", searchQuery);
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Support ticket submitted successfully. We'll get back to you soon.");
    setTicketSubject("");
    setTicketMessage("");
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
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/">
              <Button>Go to Store</Button>
            </Link>
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
          <form onSubmit={handleSearch} className="relative max-w-lg mx-auto">
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
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I track my order?</AccordionTrigger>
                <AccordionContent>
                  You can track your order by logging into your account and visiting the "Orders" section. 
                  Alternatively, check the shipping confirmation email for a tracking link.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>What is your return policy?</AccordionTrigger>
                <AccordionContent>
                  We accept returns within 30 days of purchase for unused items in original packaging. 
                  Please visit our Returns page to initiate a return request.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Do you ship internationally?</AccordionTrigger>
                <AccordionContent>
                  Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location 
                  and will be calculated at checkout.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Where can I find datasheets for components?</AccordionTrigger>
                <AccordionContent>
                  Datasheets are available on the product page for each component. Look for the "Documents" 
                  or "Datasheet" tab in the product description.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>Can I request a custom order?</AccordionTrigger>
                <AccordionContent>
                  For bulk orders or specific components not listed on our site, please contact our sales team 
                  directly using the form on this page.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <FileText className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle>Documentation</CardTitle>
                <CardDescription>Detailed guides and API references.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="link" className="px-0">
                  View Docs <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <MessageSquare className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle>Community Forum</CardTitle>
                <CardDescription>Join the discussion with other makers.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="link" className="px-0">
                  Visit Forum <ArrowRight className="ml-2 h-4 w-4" />
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
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject" 
                    placeholder="Brief summary of issue" 
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Describe your issue in detail..." 
                    className="min-h-[150px]"
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Submit Ticket
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
