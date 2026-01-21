"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  User, Lock, Bell, Eye, Globe, Settings as SettingsIcon,
  Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin,
  Youtube, MessageCircle, Send, Palette
} from "lucide-react";
import { WhatsAppSettings } from "@/components/admin/whatsapp-settings";
import { 
  useUserSettings, 
  useUpdateUserSettings, 
  useUpdateProfile,
  useChangePassword,
  useSiteSettings,
  useUpdateSiteSettings,
  useInitializeSiteSettings
} from "@/lib/hooks/use-settings";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const router = useRouter();
  
  // User settings hooks
  const { data: userSettingsData, isLoading: loadingUserSettings } = useUserSettings();
  const updateSettings = useUpdateUserSettings();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  
  // Admin settings hooks
  const { data: siteSettingsData, isLoading: loadingSiteSettings } = useSiteSettings();
  const updateSiteSettings = useUpdateSiteSettings();
  const initializeSettings = useInitializeSiteSettings();
  
  // User profile state
  const [profileData, setProfileData] = useState({
    name: "",
    phoneNumber: "",
    bio: "",
  });
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderNotifications: true,
    messageNotifications: true,
    marketingEmails: false,
  });
  
  // Site settings state (admin)
  const [contactInfo, setContactInfo] = useState({
    email: "",
    phone: "",
    address: "",
  });
  
  const [socialMedia, setSocialMedia] = useState({
    facebook: { url: "", show: true },
    twitter: { url: "", show: true },
    instagram: { url: "", show: true },
    linkedin: { url: "", show: true },
    youtube: { url: "", show: true },
    tiktok: { url: "", show: true },
    whatsapp: { url: "", show: true },
    reddit: { url: "", show: true },
  });
  
  const [branding, setBranding] = useState({
    siteName: "",
    tagline: "",
    logo: "",
    favicon: "",
    primaryColor: "",
  });
  
  const [emailSettings, setEmailSettings] = useState({
    fromName: "",
    fromEmail: "",
    replyTo: "",
  });
  
  const [generalSettings, setGeneralSettings] = useState({
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
  });


  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?returnUrl=/dashboard/settings");
    }
  }, [status, router]);

  useEffect(() => {
    if (userSettingsData) {
      setProfileData({
        name: userSettingsData.profile?.name || "",
        phoneNumber: userSettingsData.profile?.phoneNumber || "",
        bio: userSettingsData.profile?.bio || "",
      });
      setNotificationSettings({
        emailNotifications: userSettingsData.settings?.emailNotifications ?? true,
        orderNotifications: userSettingsData.settings?.orderNotifications ?? true,
        messageNotifications: userSettingsData.settings?.messageNotifications ?? true,
        marketingEmails: userSettingsData.settings?.marketingEmails ?? false,
      });
    }
  }, [userSettingsData]);

  useEffect(() => {
    if (siteSettingsData?.grouped) {
      const { contact, social, branding: brandingData, email, general } = siteSettingsData.grouped;
      
      if (contact) {
        setContactInfo({
          email: contact['contact.email'] || "",
          phone: contact['contact.phone'] || "",
          address: contact['contact.address'] || "",
        });
      }
      
      if (social) {
        setSocialMedia({
          facebook: { 
            url: social['social.facebook'] || "", 
            show: social['social.show.facebook'] ?? true 
          },
          twitter: { 
            url: social['social.twitter'] || "", 
            show: social['social.show.twitter'] ?? true 
          },
          instagram: { 
            url: social['social.instagram'] || "", 
            show: social['social.show.instagram'] ?? true 
          },
          linkedin: { 
            url: social['social.linkedin'] || "", 
            show: social['social.show.linkedin'] ?? true 
          },
          youtube: { 
            url: social['social.youtube'] || "", 
            show: social['social.show.youtube'] ?? true 
          },
          tiktok: { 
            url: social['social.tiktok'] || "", 
            show: social['social.show.tiktok'] ?? true 
          },
          whatsapp: { 
            url: social['social.whatsapp'] || "", 
            show: social['social.show.whatsapp'] ?? true 
          },
          reddit: { 
            url: social['social.reddit'] || "", 
            show: social['social.show.reddit'] ?? true 
          },
        });
      }
      
      if (brandingData) {
        setBranding({
          siteName: brandingData['branding.siteName'] || "",
          tagline: brandingData['branding.tagline'] || "",
          logo: brandingData['branding.logo'] || "",
          favicon: brandingData['branding.favicon'] || "",
          primaryColor: brandingData['branding.primaryColor'] || "",
        });
      }
      
      if (email) {
        setEmailSettings({
          fromName: email['email.fromName'] || "",
          fromEmail: email['email.fromEmail'] || "",
          replyTo: email['email.replyTo'] || "",
        });
      }
      
      if (general) {
        setGeneralSettings({
          maintenanceMode: general['general.maintenanceMode'] ?? false,
          allowRegistration: general['general.allowRegistration'] ?? true,
          requireEmailVerification: general['general.requireEmailVerification'] ?? true,
        });
      }
    }
  }, [siteSettingsData]);


  const handleProfileUpdate = async () => {
    await updateProfile.mutateAsync(profileData);
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    await changePassword.mutateAsync({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleNotificationUpdate = async () => {
    await updateSettings.mutateAsync(notificationSettings);
  };

  const handleContactInfoUpdate = async () => {
    const settings = [
      { key: 'contact.email', value: contactInfo.email, category: 'contact' },
      { key: 'contact.phone', value: contactInfo.phone, category: 'contact' },
      { key: 'contact.address', value: contactInfo.address, category: 'contact' },
    ];
    await updateSiteSettings.mutateAsync(settings);
  };

  const handleSocialMediaUpdate = async () => {
    const settings = Object.entries(socialMedia).flatMap(([platform, data]) => [
      { key: `social.${platform}`, value: data.url, category: 'social' },
      { key: `social.show.${platform}`, value: data.show, category: 'social' },
    ]);
    await updateSiteSettings.mutateAsync(settings);
  };
  
  const handleBrandingUpdate = async () => {
    const settings = [
      { key: 'branding.siteName', value: branding.siteName, category: 'branding' },
      { key: 'branding.tagline', value: branding.tagline, category: 'branding' },
      { key: 'branding.logo', value: branding.logo, category: 'branding' },
      { key: 'branding.favicon', value: branding.favicon, category: 'branding' },
      { key: 'branding.primaryColor', value: branding.primaryColor, category: 'branding' },
    ];
    await updateSiteSettings.mutateAsync(settings);
  };
  
  const handleEmailSettingsUpdate = async () => {
    const settings = [
      { key: 'email.fromName', value: emailSettings.fromName, category: 'email' },
      { key: 'email.fromEmail', value: emailSettings.fromEmail, category: 'email' },
      { key: 'email.replyTo', value: emailSettings.replyTo, category: 'email' },
    ];
    await updateSiteSettings.mutateAsync(settings);
  };
  
  const handleGeneralSettingsUpdate = async () => {
    const settings = [
      { key: 'general.maintenanceMode', value: generalSettings.maintenanceMode, category: 'general' },
      { key: 'general.allowRegistration', value: generalSettings.allowRegistration, category: 'general' },
      { key: 'general.requireEmailVerification', value: generalSettings.requireEmailVerification, category: 'general' },
    ];
    await updateSiteSettings.mutateAsync(settings);
  };


  if (status === "loading" || loadingUserSettings) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger value="contact">
                <Mail className="h-4 w-4 mr-2" />
                Contact Info
              </TabsTrigger>
              <TabsTrigger value="social">
                <Globe className="h-4 w-4 mr-2" />
                Social Media
              </TabsTrigger>
              <TabsTrigger value="branding">
                <Palette className="h-4 w-4 mr-2" />
                Branding
              </TabsTrigger>
              <TabsTrigger value="email">
                <Send className="h-4 w-4 mr-2" />
                Email
              </TabsTrigger>
              <TabsTrigger value="general">
                <SettingsIcon className="h-4 w-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger value="whatsapp">
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} disabled className="bg-slate-50" />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileData.phoneNumber}
                  onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                  placeholder="+1 (234) 567-890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>
              <Button onClick={handleProfileUpdate} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                />
              </div>
              <Button onClick={handlePasswordChange} disabled={changePassword.isPending}>
                {changePassword.isPending ? "Changing..." : "Change Password"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Order Updates</Label>
                  <p className="text-sm text-muted-foreground">Get notified about order status changes</p>
                </div>
                <Switch
                  checked={notificationSettings.orderNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, orderNotifications: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Message Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified about new messages</p>
                </div>
                <Switch
                  checked={notificationSettings.messageNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, messageNotifications: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">Receive promotional emails and newsletters</p>
                </div>
                <Switch
                  checked={notificationSettings.marketingEmails}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, marketingEmails: checked })
                  }
                />
              </div>
              <Button onClick={handleNotificationUpdate} disabled={updateSettings.isPending}>
                {updateSettings.isPending ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Info Tab (Admin Only) */}
        {isAdmin && (
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Update contact information displayed on the website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input
                    id="contact-email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                    placeholder="hello@fidevoltz.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Phone Number</Label>
                  <Input
                    id="contact-phone"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    placeholder="+1 (234) 567-890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-address">Office Address</Label>
                  <Textarea
                    id="contact-address"
                    value={contactInfo.address}
                    onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                    placeholder="123 Tech Avenue, Innovation City, TC 90210"
                    rows={2}
                  />
                </div>
                <Button onClick={handleContactInfoUpdate} disabled={updateSiteSettings.isPending}>
                  {updateSiteSettings.isPending ? "Saving..." : "Save Contact Info"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Social Media Tab (Admin Only) */}
        {isAdmin && (
          <TabsContent value="social" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>
                  Manage social media links and visibility across the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(socialMedia).map(([platform, data]) => {
                  const icons = {
                    facebook: Facebook,
                    twitter: Twitter,
                    instagram: Instagram,
                    linkedin: Linkedin,
                    youtube: Youtube,
                    tiktok: Send,
                    whatsapp: MessageCircle,
                    reddit: Globe,
                  };
                  const Icon = icons[platform as keyof typeof icons];
                  
                  return (
                    <div key={platform} className="space-y-2 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5" />
                          <Label className="capitalize">{platform === 'twitter' ? 'Twitter / X' : platform}</Label>
                        </div>
                        <Switch
                          checked={data.show}
                          onCheckedChange={(checked) =>
                            setSocialMedia({
                              ...socialMedia,
                              [platform]: { ...data, show: checked },
                            })
                          }
                        />
                      </div>
                      <Input
                        value={data.url}
                        onChange={(e) =>
                          setSocialMedia({
                            ...socialMedia,
                            [platform]: { ...data, url: e.target.value },
                          })
                        }
                        placeholder={`https://${platform}.com/fidevoltz`}
                      />
                    </div>
                  );
                })}
                <Button onClick={handleSocialMediaUpdate} disabled={updateSiteSettings.isPending}>
                  {updateSiteSettings.isPending ? "Saving..." : "Save Social Media Links"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Branding Tab (Admin Only) */}
        {isAdmin && (
          <TabsContent value="branding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Branding Settings</CardTitle>
                <CardDescription>Customize your site's branding and appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={branding.siteName}
                    onChange={(e) => setBranding({ ...branding, siteName: e.target.value })}
                    placeholder="FideVoltz"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={branding.tagline}
                    onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
                    placeholder="Innovation in Electronics"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    value={branding.logo}
                    onChange={(e) => setBranding({ ...branding, logo: e.target.value })}
                    placeholder="/logo.png"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="favicon">Favicon URL</Label>
                  <Input
                    id="favicon"
                    value={branding.favicon}
                    onChange={(e) => setBranding({ ...branding, favicon: e.target.value })}
                    placeholder="/favicon.ico"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={branding.primaryColor || "#3B82F6"}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
                <Button onClick={handleBrandingUpdate} disabled={updateSiteSettings.isPending}>
                  {updateSiteSettings.isPending ? "Saving..." : "Save Branding"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Email Settings Tab (Admin Only) */}
        {isAdmin && (
          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
                <CardDescription>Configure email sender information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                    placeholder="FideVoltz Team"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                    placeholder="noreply@fidevoltz.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="replyTo">Reply-To Email</Label>
                  <Input
                    id="replyTo"
                    type="email"
                    value={emailSettings.replyTo}
                    onChange={(e) => setEmailSettings({ ...emailSettings, replyTo: e.target.value })}
                    placeholder="hello@fidevoltz.com"
                  />
                </div>
                <Button onClick={handleEmailSettingsUpdate} disabled={updateSiteSettings.isPending}>
                  {updateSiteSettings.isPending ? "Saving..." : "Save Email Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* General Settings Tab (Admin Only) */}
        {isAdmin && (
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure general site behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable maintenance mode to prevent public access
                    </p>
                  </div>
                  <Switch
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(checked) =>
                      setGeneralSettings({ ...generalSettings, maintenanceMode: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new users to register accounts
                    </p>
                  </div>
                  <Switch
                    checked={generalSettings.allowRegistration}
                    onCheckedChange={(checked) =>
                      setGeneralSettings({ ...generalSettings, allowRegistration: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Email Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Require users to verify their email before accessing the site
                    </p>
                  </div>
                  <Switch
                    checked={generalSettings.requireEmailVerification}
                    onCheckedChange={(checked) =>
                      setGeneralSettings({ ...generalSettings, requireEmailVerification: checked })
                    }
                  />
                </div>
                <Button onClick={handleGeneralSettingsUpdate} disabled={updateSiteSettings.isPending}>
                  {updateSiteSettings.isPending ? "Saving..." : "Save General Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}


        {/* WhatsApp Tab (Admin Only) - Preserved */}
        {isAdmin && (
          <TabsContent value="whatsapp">
            <WhatsAppSettings />
          </TabsContent>
        )}
      </Tabs>

      {/* Initialize Settings Button (Admin Only) */}
      {isAdmin && (!siteSettingsData?.settings || siteSettingsData?.settings?.length === 0) && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Initialize Site Settings</CardTitle>
            <CardDescription>
              Click below to create default site settings for Contact Info, Social Media, Branding, Email, and General settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => initializeSettings.mutate()} disabled={initializeSettings.isPending}>
              {initializeSettings.isPending ? "Initializing..." : "Initialize Default Settings"}
            </Button>
            {loadingSiteSettings && <p className="text-sm text-muted-foreground mt-2">Loading settings...</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
