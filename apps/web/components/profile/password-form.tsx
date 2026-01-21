"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useChangePassword } from "@/lib/hooks/use-profile";
import { checkPasswordStrength, validatePasswordRequirements, doPasswordsMatch } from "@/lib/utils/password-validation";
import { Eye, EyeOff, Check, X } from "lucide-react";

export function PasswordForm() {
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const changePassword = useChangePassword();
  const strength = checkPasswordStrength(formData.newPassword);
  const requirements = validatePasswordRequirements(formData.newPassword);
  const passwordsMatch = doPasswordsMatch(formData.newPassword, formData.confirmPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    changePassword.mutate(formData, {
      onSuccess: () => {
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      },
    });
  };

  const canSubmit =
    formData.currentPassword &&
    formData.newPassword &&
    formData.confirmPassword &&
    requirements.minLength &&
    passwordsMatch;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update your password to keep your account secure</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password *</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password *</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {formData.newPassword && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        strength.score === 0 ? "bg-red-600 w-1/5" :
                        strength.score === 1 ? "bg-orange-600 w-2/5" :
                        strength.score === 2 ? "bg-yellow-600 w-3/5" :
                        strength.score === 3 ? "bg-blue-600 w-4/5" :
                        "bg-green-600 w-full"
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-medium ${strength.color}`}>
                    {strength.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password *</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {formData.confirmPassword && (
              <p className={`text-xs ${passwordsMatch ? "text-green-600" : "text-red-600"}`}>
                {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
              </p>
            )}
          </div>

          {/* Password Requirements */}
          {formData.newPassword && (
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">Password Requirements:</p>
              <div className="space-y-1">
                <RequirementItem met={requirements.minLength} text="At least 8 characters" />
                <RequirementItem met={requirements.hasUppercase} text="One uppercase letter" />
                <RequirementItem met={requirements.hasLowercase} text="One lowercase letter" />
                <RequirementItem met={requirements.hasNumber} text="One number" />
                <RequirementItem met={requirements.hasSpecialChar} text="One special character (optional)" />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!canSubmit || changePassword.isPending}
            className="w-full"
          >
            {changePassword.isPending ? "Changing Password..." : "Change Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <X className="h-4 w-4 text-slate-400" />
      )}
      <span className={met ? "text-green-600" : "text-slate-600"}>{text}</span>
    </div>
  );
}
