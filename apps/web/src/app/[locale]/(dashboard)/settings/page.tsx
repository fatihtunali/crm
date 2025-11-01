'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Bell, Globe, Lock } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-700 mt-2 text-base">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Settings */}
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-white" />
              <CardTitle className="text-white">Profile Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Name</label>
                <p className="text-gray-900 mt-1">{user?.name}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <p className="text-gray-900 mt-1">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Role</label>
                <p className="text-gray-900 mt-1">{user?.role}</p>
              </div>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-2 border-purple-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-white" />
              <CardTitle className="text-white">Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive email updates</p>
                </div>
                <input type="checkbox" className="w-5 h-5" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-600">Receive push notifications</p>
                </div>
                <input type="checkbox" className="w-5 h-5" />
              </div>
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="border-2 border-green-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-white" />
              <CardTitle className="text-white">Language & Region</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Language</label>
                <select className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-gray-900">
                  <option>English</option>
                  <option>Turkish</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Timezone</label>
                <select className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-gray-900">
                  <option>UTC</option>
                  <option>Europe/Istanbul</option>
                </select>
              </div>
              <Button className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600">
                Update Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-2 border-red-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-white" />
              <CardTitle className="text-white">Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-900">Password</p>
                <p className="text-sm text-gray-600">Last changed 30 days ago</p>
              </div>
              <Button variant="outline" className="w-full border-2 border-red-500 text-red-600 hover:bg-red-50">
                Change Password
              </Button>
              <div>
                <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Add extra security to your account</p>
              </div>
              <Button className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                Enable 2FA
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
