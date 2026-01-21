"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Plus, X, FileCode, FileText, Image as ImageIcon, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data fetch
const getProject = (id: string) => ({
  id,
  title: "Getting Started with Arduino",
  content: "This is a tutorial on how to get started with Arduino...",
  difficulty: "beginner",
  category: "programming",
  tags: ["arduino", "basics", "coding"],
  files: [
    { name: "blink.ino", size: "1.2 KB" }
  ]
});

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<any>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [files, setFiles] = useState<{ name: string; size: string }[]>([]);

  useEffect(() => {
    const data = getProject(id);
    setProject(data);
    setTags(data.tags);
    setFiles(data.files);
  }, [id]);

  if (!project) return <div>Loading...</div>;

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (uploadedFiles) {
      const newFiles = Array.from(uploadedFiles).map(file => ({
        name: file.name,
        size: (file.size / 1024).toFixed(2) + " KB"
      }));
      setFiles([...files, ...newFiles]);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Project</h2>
          <p className="text-muted-foreground">
            Update tutorial content and settings.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input id="title" defaultValue={project.title} />
              </div>
              
              <div className="space-y-2">
                <Label>Content Editor</Label>
                <div className="min-h-[400px] border rounded-md p-4 bg-slate-50">
                  <div className="flex gap-2 mb-4 border-b pb-2">
                    <Button variant="ghost" size="sm"><FileText className="h-4 w-4 mr-2" /> Text</Button>
                    <Button variant="ghost" size="sm"><ImageIcon className="h-4 w-4 mr-2" /> Image</Button>
                    <Button variant="ghost" size="sm"><FileCode className="h-4 w-4 mr-2" /> Code Block</Button>
                  </div>
                  <Textarea 
                    className="min-h-[300px] border-0 focus-visible:ring-0 bg-transparent resize-none" 
                    defaultValue={project.content}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Code & Firmware</Label>
                <div className="border-2 border-dashed rounded-md p-6 text-center hover:bg-slate-50 transition-colors">
                  <FileCode className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload code files (.ino, .py, .cpp) or zip archives
                  </p>
                  <Input type="file" className="hidden" id="code-upload" multiple onChange={handleFileUpload} />
                  <Button variant="outline" size="sm" onClick={() => document.getElementById('code-upload')?.click()}>
                    Select Files
                  </Button>
                </div>
                {files.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-slate-100 rounded-md text-sm">
                        <span className="flex items-center gap-2">
                          <FileCode className="h-4 w-4 text-blue-500" />
                          {file.name}
                        </span>
                        <span className="text-slate-500">{file.size}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <Select defaultValue={project.difficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select defaultValue={project.category}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iot">IoT</SelectItem>
                    <SelectItem value="robotics">Robotics</SelectItem>
                    <SelectItem value="automation">Automation</SelectItem>
                    <SelectItem value="programming">Programming</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <Input 
                  placeholder="Type and press Enter..." 
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleAddTag}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map(tag => (
                    <span key={tag} className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs flex items-center gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Featured Image</Label>
                <div className="aspect-video bg-slate-100 rounded-md flex items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-500 cursor-pointer transition-colors">
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                    <span className="text-xs text-slate-500">Change Cover</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Link href="/dashboard/projects">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Update Project
        </Button>
      </div>
    </div>
  );
}
