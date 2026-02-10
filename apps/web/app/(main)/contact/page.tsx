"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MapPin, Phone, Send, MessageSquare, Cpu, Handshake } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { usePublicSettings } from "@/lib/hooks/use-public-settings";
import { SocialMediaLinks } from "@/components/social-media-links";

function ContactForm() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const [activeTab, setActiveTab] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [generalForm, setGeneralForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [serviceForm, setServiceForm] = useState({ name: "", email: "", projectType: "", budget: "", description: "" });
  const [partnerForm, setPartnerForm] = useState({ name: "", organization: "", email: "", interestType: "", message: "" });

  useEffect(() => {
    if (type === "service") setActiveTab("service");
    else if (type === "partnership" || type === "donation") setActiveTab("partnership");
    else setActiveTab("general");
  }, [type]);

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/email/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generalForm),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Message sent successfully!", {
          description: "We'll get back to you soon. Check your email for confirmation.",
        });
        setGeneralForm({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error("Failed to send message", {
          description: data.error || "Please try again.",
        });
      }
    } catch (error) {
      toast.error("An error occurred", {
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/email/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: serviceForm.name,
          email: serviceForm.email,
          subject: `Build Service Request - ${serviceForm.projectType}`,
          message: `Project Type: ${serviceForm.projectType}\nBudget: ${serviceForm.budget}\n\nDescription:\n${serviceForm.description}`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Quote request sent successfully!", {
          description: "We'll review your project and get back to you within 24-48 hours.",
          duration: 5000,
        });
        setServiceForm({ name: "", email: "", projectType: "", budget: "", description: "" });
      } else {
        toast.error("Failed to send request", {
          description: data.error || "Please try again.",
        });
      }
    } catch (error) {
      toast.error("An error occurred", {
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/email/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: partnerForm.name,
          email: partnerForm.email,
          subject: `Partnership Inquiry - ${partnerForm.interestType}`,
          message: `Organization: ${partnerForm.organization}\nInterest Type: ${partnerForm.interestType}\n\nProposal:\n${partnerForm.message}`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Proposal submitted successfully!", {
          description: "We'll review it and reach out to discuss next steps.",
          duration: 5000,
        });
        setPartnerForm({ name: "", organization: "", email: "", interestType: "", message: "" });
      } else {
        toast.error("Failed to submit proposal", {
          description: data.error || "Please try again.",
        });
      }
    } catch (error) {
      toast.error("An error occurred", {
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8">
        <TabsTrigger value="general" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">General</span>
        </TabsTrigger>
        <TabsTrigger value="service" className="flex items-center gap-2">
          <Cpu className="h-4 w-4" />
          <span className="hidden sm:inline">Build Service</span>
        </TabsTrigger>
        <TabsTrigger value="partnership" className="flex items-center gap-2">
          <Handshake className="h-4 w-4" />
          <span className="hidden sm:inline">Partnership</span>
        </TabsTrigger>
      </TabsList>

      {/* General Inquiry Form */}
      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>General Inquiry</CardTitle>
            <CardDescription>
              Questions about tutorials, products, or general feedback.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGeneralSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="general-name">Name</Label>
                  <Input 
                    id="general-name" 
                    placeholder="Your name" 
                    value={generalForm.name}
                    onChange={(e) => setGeneralForm({ ...generalForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="general-email">Email</Label>
                  <Input 
                    id="general-email" 
                    type="email" 
                    placeholder="your@email.com" 
                    value={generalForm.email}
                    onChange={(e) => setGeneralForm({ ...generalForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="general-subject">Subject</Label>
                <Input 
                  id="general-subject" 
                  placeholder="What is this regarding?" 
                  value={generalForm.subject}
                  onChange={(e) => setGeneralForm({ ...generalForm, subject: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="general-message">Message</Label>
                <Textarea 
                  id="general-message" 
                  placeholder="Type your message here..." 
                  className="min-h-[150px]" 
                  value={generalForm.message}
                  onChange={(e) => setGeneralForm({ ...generalForm, message: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <Send className="mr-2 h-4 w-4" /> {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Build Service Form */}
      <TabsContent value="service">
        <Card>
          <CardHeader>
            <CardTitle>Project Build Service</CardTitle>
            <CardDescription>
              Tell us about the project you want us to build for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleServiceSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service-name">Name</Label>
                  <Input 
                    id="service-name" 
                    placeholder="Your name" 
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service-email">Email</Label>
                  <Input 
                    id="service-email" 
                    type="email" 
                    placeholder="your@email.com" 
                    value={serviceForm.email}
                    onChange={(e) => setServiceForm({ ...serviceForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service-type">Project Type</Label>
                  <Select value={serviceForm.projectType} onValueChange={(value) => setServiceForm({ ...serviceForm, projectType: value })} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iot">IoT & Automation</SelectItem>
                      <SelectItem value="robotics">Robotics</SelectItem>
                      <SelectItem value="ai">AI & Computer Vision</SelectItem>
                      <SelectItem value="embedded">Embedded Systems</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service-budget">Estimated Budget</Label>
                  <Select value={serviceForm.budget} onValueChange={(value) => setServiceForm({ ...serviceForm, budget: value })} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">₦50,000 - ₦200,000</SelectItem>
                      <SelectItem value="medium">₦200,000 - ₦1,000,000</SelectItem>
                      <SelectItem value="large">₦1,000,000 - ₦5,000,000</SelectItem>
                      <SelectItem value="enterprise">₦5,000,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-desc">Project Description</Label>
                <Textarea 
                  id="service-desc" 
                  placeholder="Describe your project idea, requirements, and goals in detail..." 
                  className="min-h-[150px]" 
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <Cpu className="mr-2 h-4 w-4" /> {isSubmitting ? "Sending..." : "Request Quote"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Partnership Form */}
      <TabsContent value="partnership">
        <Card>
          <CardHeader>
            <CardTitle>Partnership & Sponsorship</CardTitle>
            <CardDescription>
              Interested in collaborating, sponsoring, or donating?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePartnerSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="partner-name">Name</Label>
                  <Input 
                    id="partner-name" 
                    placeholder="Your name" 
                    value={partnerForm.name}
                    onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partner-org">Organization / Company</Label>
                  <Input 
                    id="partner-org" 
                    placeholder="Company name" 
                    value={partnerForm.organization}
                    onChange={(e) => setPartnerForm({ ...partnerForm, organization: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="partner-email">Email</Label>
                  <Input 
                    id="partner-email" 
                    type="email" 
                    placeholder="your@email.com" 
                    value={partnerForm.email}
                    onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partner-type">Interest Type</Label>
                  <Select value={partnerForm.interestType} onValueChange={(value) => setPartnerForm({ ...partnerForm, interestType: value })} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select interest" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sponsorship">Sponsorship</SelectItem>
                      <SelectItem value="collaboration">Content Collaboration</SelectItem>
                      <SelectItem value="donation">Donation / Grant</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="partner-message">Proposal / Message</Label>
                <Textarea 
                  id="partner-message" 
                  placeholder="Tell us about your proposal or how you'd like to collaborate..." 
                  className="min-h-[150px]" 
                  value={partnerForm.message}
                  onChange={(e) => setPartnerForm({ ...partnerForm, message: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
                <Handshake className="mr-2 h-4 w-4" /> {isSubmitting ? "Sending..." : "Submit Proposal"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default function ContactPage() {
  // Fetch site settings for contact info
  const { data: siteSettings } = usePublicSettings('contact');
  
  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-20">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Have a question, want to build a project, or interested in partnering? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Reach out to us directly.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-slate-900">Email</p>
                    <a href={`mailto:${siteSettings?.grouped?.contact?.['contact.email'] || 'hello@fidevoltz.com'}`} className="text-slate-600 hover:text-primary">
                      {siteSettings?.grouped?.contact?.['contact.email'] || 'hello@fidevoltz.com'}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-slate-900">Phone</p>
                    <a href={`tel:${siteSettings?.grouped?.contact?.['contact.phone'] || '+1 (234) 567-890'}`} className="text-slate-600 hover:text-primary">
                      {siteSettings?.grouped?.contact?.['contact.phone'] || '+1 (234) 567-890'}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-slate-900">Office</p>
                    <p className="text-slate-600">
                      {siteSettings?.grouped?.contact?.['contact.address'] || '123 Tech Avenue, Innovation City, TC 90210'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary to-purple-600">
              <CardHeader>
                <CardTitle className="text-white">Join Our Community</CardTitle>
                <CardDescription className="text-blue-100">
                  Follow us on social media for updates and tutorials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SocialMediaLinks className="flex-wrap" iconSize={20} />
              </CardContent>
            </Card>
          </div>

          {/* Contact Forms */}
          <div className="lg:col-span-2">
            <Suspense fallback={<div>Loading form...</div>}>
              <ContactForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
