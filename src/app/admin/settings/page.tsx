'use client';

import { useState } from 'react';
import { api } from '~/trpc/react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import { Switch } from '~/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Skeleton } from '~/components/ui/skeleton';
import { 
  Loader2, 
  Save,
  Key,
  Globe,
  DollarSign,
  Shield,
  Bell,
  Database,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // General settings
  const [siteName, setSiteName] = useState('PredIQ.fun');
  const [siteDescription, setSiteDescription] = useState('Prediction Markets Platform');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  // Trading settings
  const [minBetAmount, setMinBetAmount] = useState('1');
  const [maxBetAmount, setMaxBetAmount] = useState('10000');
  const [tradingFee, setTradingFee] = useState('2');
  const [initialUserBalance, setInitialUserBalance] = useState('1000');
  
  // Security settings
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);
  const [allowNewRegistrations, setAllowNewRegistrations] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  
  // Admin password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { data: settings, isLoading } = api.admin.getSettings.useQuery();

  const updateSettingsMutation = api.admin.updateSettings.useMutation({
    onSuccess: () => {
      setSuccess('Settings updated successfully');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error) => {
      setError(error.message);
      setSuccess('');
    },
  });

  const changePasswordMutation = api.admin.changeAdminPassword.useMutation({
    onSuccess: () => {
      setSuccess('Password changed successfully');
      setError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error) => {
      setError(error.message);
      setSuccess('');
    },
  });

  const handleSaveGeneral = () => {
    updateSettingsMutation.mutate({
      category: 'general',
      settings: {
        siteName,
        siteDescription,
        maintenanceMode,
      },
    });
  };

  const handleSaveTrading = () => {
    updateSettingsMutation.mutate({
      category: 'trading',
      settings: {
        minBetAmount: Number(minBetAmount),
        maxBetAmount: Number(maxBetAmount),
        tradingFee: Number(tradingFee),
        initialUserBalance: Number(initialUserBalance),
      },
    });
  };

  const handleSaveSecurity = () => {
    updateSettingsMutation.mutate({
      category: 'security',
      settings: {
        requireEmailVerification,
        allowNewRegistrations,
        sessionTimeout: Number(sessionTimeout),
      },
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Badge variant="outline" className="text-sm">
          <Database className="h-3 w-3 mr-1" />
          Environment: {process.env.NODE_ENV}
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Configure basic site settings and appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenance">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Disable site access for non-admin users
                  </p>
                </div>
                <Switch
                  id="maintenance"
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>

              <Button 
                onClick={handleSaveGeneral}
                disabled={updateSettingsMutation.isPending}
                className="cursor-pointer"
              >
                {updateSettingsMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save General Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trading" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Trading Settings
              </CardTitle>
              <CardDescription>
                Configure market trading parameters and limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minBet">Minimum Bet Amount</Label>
                  <Input
                    id="minBet"
                    type="number"
                    value={minBetAmount}
                    onChange={(e) => setMinBetAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxBet">Maximum Bet Amount</Label>
                  <Input
                    id="maxBet"
                    type="number"
                    value={maxBetAmount}
                    onChange={(e) => setMaxBetAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tradingFee">Trading Fee (%)</Label>
                  <Input
                    id="tradingFee"
                    type="number"
                    step="0.1"
                    value={tradingFee}
                    onChange={(e) => setTradingFee(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initialBalance">Initial User Balance</Label>
                  <Input
                    id="initialBalance"
                    type="number"
                    value={initialUserBalance}
                    onChange={(e) => setInitialUserBalance(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={handleSaveTrading}
                disabled={updateSettingsMutation.isPending}
                className="cursor-pointer"
              >
                {updateSettingsMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Trading Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security and access control settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailVerification">Require Email Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Users must verify their email before trading
                    </p>
                  </div>
                  <Switch
                    id="emailVerification"
                    checked={requireEmailVerification}
                    onCheckedChange={setRequireEmailVerification}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="newRegistrations">Allow New Registrations</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable new user signups
                    </p>
                  </div>
                  <Switch
                    id="newRegistrations"
                    checked={allowNewRegistrations}
                    onCheckedChange={setAllowNewRegistrations}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (days)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={handleSaveSecurity}
                disabled={updateSettingsMutation.isPending}
                className="cursor-pointer"
              >
                {updateSettingsMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Security Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Change Admin Password
              </CardTitle>
              <CardDescription>
                Update your administrator password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="cursor-pointer"
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      Change Password
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Node Version:</span>
                <span className="font-mono">{process.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform:</span>
                <span className="font-mono">{process.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Memory Usage:</span>
                <span className="font-mono">
                  {Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}