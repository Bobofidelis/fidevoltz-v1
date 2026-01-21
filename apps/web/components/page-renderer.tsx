"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WysiwygRenderer } from "@/components/wysiwyg-renderer";
import { ChevronDown, Lightbulb, Cpu, Globe, Briefcase, FileQuestion, MessageCircle, LifeBuoy, Send, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Block {
  type: string;
  [key: string]: any;
}

interface PageRendererProps {
  content: Block[];
}

export const IconMap: { [key: string]: any } = {
  Lightbulb,
  Cpu,
  Globe,
  Briefcase,
  FileQuestion,
  MessageCircle,
  LifeBuoy
};

function SupportForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    userEmail: '',
    subject: '',
    description: '',
    priority: 'MEDIUM'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/support/tickets/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        toast.success("Ticket created successfully!");
        setFormData({ userEmail: '', subject: '', description: '', priority: 'MEDIUM' });
      } else {
        toast.error(data.error || "Failed to create ticket");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-green-100 bg-green-50/30">
        <CardContent className="p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-900">Ticket Submitted!</CardTitle>
          <CardDescription className="text-green-700 max-w-sm mx-auto">
            Your support request has been received. Our team will review it and get back to you at <strong>{formData.userEmail}</strong>.
          </CardDescription>
          <Button 
            variant="outline" 
            className="mt-6 border-green-200 hover:bg-green-100 text-green-700"
            onClick={() => setSuccess(false)}
          >
            Submit Another Ticket
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-xl overflow-hidden">
      <CardHeader className="bg-slate-900 text-white p-8">
        <CardTitle className="text-2xl font-bold">Create Support Ticket</CardTitle>
        <CardDescription className="text-slate-400">
          Tell us more about your issue and we'll help you solve it.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="userEmail">Email Address</Label>
              <Input 
                id="userEmail"
                type="email"
                placeholder="your@email.com"
                required
                value={formData.userEmail}
                onChange={(e) => setFormData({...formData, userEmail: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Urgency Level</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(val) => setFormData({...formData, priority: val})}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low - General inquiry</SelectItem>
                  <SelectItem value="MEDIUM">Medium - Technical issue</SelectItem>
                  <SelectItem value="HIGH">High - Urgent help needed</SelectItem>
                  <SelectItem value="URGENT">Urgent - Mission critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input 
              id="subject"
              placeholder="Brief summary of the issue"
              required
              minLength={5}
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description</Label>
            <Textarea 
              id="description"
              placeholder="Please describe your problem in detail..."
              required
              rows={5}
              minLength={10}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Submit Ticket
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex justify-between items-center text-left hover:text-blue-600 transition-colors"
      >
        <span className="font-semibold text-slate-900">{question}</span>
        <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pb-4 text-slate-700 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

export function PageRenderer({ content }: PageRendererProps) {
  if (!content || !Array.isArray(content)) return null;

  return (
    <div className="space-y-0">
      {content.map((block, index) => {
        switch (block.type) {
          case 'hero':
            return (
              <section key={index} className="bg-slate-900 text-white py-20 md:py-32 relative overflow-hidden">
                {block.backgroundImage && (
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-10" 
                    style={{ backgroundImage: `url(${block.backgroundImage})` }}
                  />
                )}
                <div className="container px-4 md:px-6 relative z-10 text-center">
                  {block.badge && (
                    <Badge className="mb-6 bg-blue-600 hover:bg-blue-700 text-white border-none px-4 py-1 text-sm">
                      {block.badge}
                    </Badge>
                  )}
                  <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-4xl mx-auto leading-tight">
                    {block.title}
                  </h1>
                  {block.subtitle && (
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                      {block.subtitle}
                    </p>
                  )}
                </div>
              </section>
            );

          case 'text':
            return (
              <section key={index} className="py-20 bg-white">
                <div className="container px-4 md:px-6 max-w-4xl mx-auto">
                  <WysiwygRenderer content={block.content} />
                </div>
              </section>
            );

          case 'grid':
            return (
              <section key={index} className="py-20 bg-slate-50">
                <div className="container px-4 md:px-6">
                  <div className={`grid grid-cols-1 md:grid-cols-${block.columns || 3} gap-8`}>
                    {block.items?.map((item: any, i: number) => {
                      const Icon = IconMap[item.icon as keyof typeof IconMap] || Lightbulb;
                      return (
                        <Card key={i} className="border-none shadow-md hover:shadow-xl transition-all">
                          <CardContent className="p-8 text-center">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                              <Icon className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
                            <p className="text-slate-600">{item.content}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </section>
            );

          case 'faq':
            return (
              <section key={index} className="py-20">
                <div className="container px-4 md:px-6 max-w-4xl mx-auto space-y-12">
                  {block.categories?.map((section: any) => (
                    <div key={section.name}>
                      <h2 className="text-3xl font-bold text-slate-900 mb-6">{section.name}</h2>
                      <Card>
                        <CardContent className="p-6">
                          {section.questions?.map((faq: any, i: number) => (
                            <FAQItem key={i} question={faq.q} answer={faq.a} />
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'form':
            if (block.formType === 'support') {
              return (
                <section key={index} className="py-20 bg-slate-50">
                  <div className="container px-4 md:px-6 max-w-3xl mx-auto">
                    <SupportForm />
                  </div>
                </section>
              );
            }
            return (
              <section key={index} className="py-20 bg-white text-center">
                <div className="container px-4 md:px-6 max-w-2xl mx-auto">
                   <p className="text-slate-500 italic">Form block: {block.formType} (Not implemented yet)</p>
                </div>
              </section>
            );

          case 'sidebar_section':
            return (
              <section key={index} className="py-20 bg-white">
                <div className="container px-4 md:px-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    <div className="lg:col-span-3">
                      <WysiwygRenderer content={block.content} />
                    </div>
                    <aside className="lg:col-span-1 space-y-8">
                      {block.sidebar?.map((item: any, i: number) => (
                        <div key={i} className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                          <h4 className="font-bold text-slate-900 mb-4">{item.title}</h4>
                          {item.type === 'links' ? (
                            <ul className="space-y-2">
                              {item.links.map((link: any, li: number) => (
                                <li key={li}>
                                  <Link href={link.href} className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-2">
                                    {link.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-sm text-slate-600 leading-relaxed">
                              {item.content}
                            </div>
                          )}
                        </div>
                      ))}
                    </aside>
                  </div>
                </div>
              </section>
            );

          default:
            return <div key={index}>Unknown block type: {block.type}</div>;
        }
      })}
    </div>
  );
}
