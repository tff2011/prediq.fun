'use client'

import { useWeb3Auth } from '@/contexts/Web3AuthContext'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User,
  Bell,
  Shield,
  Key,
  Upload,
  Mail,
  MessageSquare,
  AlertTriangle,
  Eye,
  EyeOff,
  Copy,
  CheckCircle
} from 'lucide-react'
import { api } from '@/trpc/react'
import { toast } from 'sonner'
import { redirect } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const t = useTranslations('settings')
  const { user } = useWeb3Auth()
  const [activeSection, setActiveSection] = useState('profile')
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [privateKeyCopied, setPrivateKeyCopied] = useState(false)

  // Form states
  const [profileForm, setProfileForm] = useState({
    username: '',
    bio: '',
    email: ''
  })
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailResolutions: true,
    inAppOrderFills: true,
    inAppResolutions: true,
    hideSmallFills: false
  })

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  // Redirect to home if not logged in
  useEffect(() => {
    if (!user) {
      redirect('/')
    }
  }, [user])

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.name || '',
        bio: '',
        email: user.email || ''
      })
    }
  }, [user])

  // Mock private key (in real app, this would come from Web3Auth)
  const mockPrivateKey = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"

  const handleProfileSave = () => {
    toast.success(t('profile.saved'))
  }

  const handlePrivateKeyExport = () => {
    // In real implementation, this would interact with Web3Auth
    toast.success(t('privateKey.exportStarted'))
  }

  const copyPrivateKey = () => {
    navigator.clipboard.writeText(mockPrivateKey)
    setPrivateKeyCopied(true)
    toast.success(t('privateKey.copied'))
    setTimeout(() => setPrivateKeyCopied(false), 2000)
  }

  if (!user) {
    return null
  }

  const sidebarItems = [
    { id: 'profile', label: t('sections.profile'), icon: User },
    { id: 'notifications', label: t('sections.notifications'), icon: Bell },
    { id: 'twoFactor', label: t('sections.twoFactor'), icon: Shield },
    { id: 'privateKey', label: t('sections.privateKey'), icon: Key },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 shrink-0">
            <div className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left",
                      activeSection === item.id
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Profile Settings */}
            {activeSection === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{t('profile.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
                      {user.name?.charAt(0) || user.address?.slice(2, 4).toUpperCase() || 'U'}
                    </div>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      {t('profile.upload')}
                    </Button>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('profile.email')}</Label>
                    <Input
                      id="email"
                      value={profileForm.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username">{t('profile.username')}</Label>
                    <Input
                      id="username"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                      placeholder={t('profile.usernamePlaceholder')}
                    />
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">{t('profile.bio')}</Label>
                    <Textarea
                      id="bio"
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder={t('profile.bioPlaceholder')}
                      rows={4}
                    />
                  </div>

                  <Button onClick={handleProfileSave} className="bg-blue-600 hover:bg-blue-700">
                    {t('profile.saveChanges')}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Notification Settings */}
            {activeSection === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{t('notifications.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Email Notifications */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold">{t('notifications.email')}</h3>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t('notifications.resolutions')}</p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailResolutions}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, emailResolutions: checked }))
                        }
                      />
                    </div>
                  </div>

                  {/* In-App Notifications */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold">{t('notifications.inApp')}</h3>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t('notifications.orderFills')}</p>
                      </div>
                      <Switch
                        checked={notificationSettings.inAppOrderFills}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, inAppOrderFills: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t('notifications.resolutions')}</p>
                      </div>
                      <Switch
                        checked={notificationSettings.inAppResolutions}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, inAppResolutions: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notificationSettings.hideSmallFills}
                        onChange={(e) => 
                          setNotificationSettings(prev => ({ ...prev, hideSmallFills: e.target.checked }))
                        }
                        className="rounded border-input w-4 h-4"
                      />
                      <p className="font-medium">{t('notifications.hideSmallFills')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Two-Factor Authentication */}
            {activeSection === 'twoFactor' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{t('twoFactor.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{t('twoFactor.enable')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('twoFactor.description')}
                      </p>
                    </div>
                    <Switch
                      checked={twoFactorEnabled}
                      onCheckedChange={setTwoFactorEnabled}
                    />
                  </div>

                  {twoFactorEnabled && (
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        {t('twoFactor.setupInstructions')}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Export Private Key */}
            {activeSection === 'privateKey' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{t('privateKey.title')}</CardTitle>
                  <CardDescription>
                    {t('privateKey.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      {t('privateKey.warning')}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <h3 className="font-semibold">{t('privateKey.basicSteps')}</h3>
                    
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                          1
                        </div>
                        <p className="text-sm">{t('privateKey.step1')}</p>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                          2
                        </div>
                        <p className="text-sm">{t('privateKey.step2')}</p>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                          3
                        </div>
                        <p className="text-sm">{t('privateKey.step3')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Private Key Display (Mock) */}
                  {showPrivateKey && (
                    <div className="space-y-2">
                      <Label>{t('privateKey.yourKey')}</Label>
                      <div className="flex gap-2">
                        <Input
                          value={mockPrivateKey}
                          readOnly
                          className="font-mono text-sm"
                          type={showPrivateKey ? "text" : "password"}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPrivateKey(!showPrivateKey)}
                        >
                          {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyPrivateKey}
                          className="flex items-center gap-2"
                        >
                          {privateKeyCopied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={showPrivateKey ? handlePrivateKeyExport : () => setShowPrivateKey(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {showPrivateKey ? t('privateKey.startExport') : t('privateKey.reveal')}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}