import { useState, useEffect, useCallback, useRef } from 'react';
import { LogOut, Settings, Bell, Globe, Shield, Download, Coins, User, Mail, MapPin, Phone, Edit3, Save, X, Loader2, CheckCircle2, AlertCircle, Calendar, ChevronRight, Camera, Share2, Crown, RefreshCw } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useCurrency, CURRENCIES, type Currency } from '@/lib/currency';
import { useAuth } from '@/lib/auth';
import { useSubscription } from '@/lib/subscription';
import { supabase } from '@/lib/supabase';

type Profile = {
  nom: string;
  prenom: string;
  pays: string;
  ville: string;
  telephone: string;
  email: string;
  avatar_url: string | null;
  created_at?: string;
};

type SettingsTabProps = {
  onLogout: () => void;
  userEmail: string | undefined;
  installPrompt: BeforeInstallPromptEvent | null;
  onInstall: () => void;
  isInstalled: boolean;
  onOpenPrivacy: () => void;
  isAdmin: boolean;
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export default function SettingsTab({ onLogout, userEmail, installPrompt, onInstall, isInstalled, onOpenPrivacy, isAdmin }: SettingsTabProps) {
  const { t, lang } = useI18n();
  const { currency, setCurrency } = useCurrency();
  const { user } = useAuth();
  const { status: subStatus } = useSubscription();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Profile>({ nom: '', prenom: '', pays: '', ville: '', telephone: '', email: '', avatar_url: null });
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    try {
      return localStorage.getItem('feed_formular_notifications') !== 'false';
    } catch { return true; }
  });

  const toggleNotifications = useCallback(() => {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    try {
      localStorage.setItem('feed_formular_notifications', String(next));
    } catch { /* ignore */ }
  }, [notificationsEnabled]);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    setLoadingProfile(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('nom, prenom, pays, ville, telephone, email, avatar_url, created_at')
      .eq('id', user.id)
      .maybeSingle();
    if (!error && data) {
      setProfile(data);
      setEditForm(data);
      setAvatarUrl(data.avatar_url);
    } else if (user.user_metadata) {
      const fallback: Profile = {
        nom: user.user_metadata.nom || '',
        prenom: user.user_metadata.prenom || '',
        pays: user.user_metadata.pays || '',
        ville: user.user_metadata.ville || '',
        telephone: user.user_metadata.telephone || '',
        email: user.email || '',
        avatar_url: null,
      };
      setProfile(fallback);
      setEditForm(fallback);
    }
    setLoadingProfile(false);
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSaveProfile = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    setProfileMsg(null);
    const { error } = await supabase
      .from('profiles')
      .update({
        nom: editForm.nom,
        prenom: editForm.prenom,
        pays: editForm.pays,
        ville: editForm.ville,
        telephone: editForm.telephone,
      })
      .eq('id', user.id);
    setSaving(false);
    if (error) {
      setProfileMsg({ type: 'error', text: t('profileUpdateError') });
    } else {
      setProfile(editForm);
      setProfileMsg({ type: 'success', text: t('profileUpdated') });
      setEditing(false);
      setTimeout(() => setProfileMsg(null), 3000);
    }
  }, [user, editForm, t]);

  const handlePhotoUpload = useCallback(async (file: File) => {
    if (!user) return;
    setUploadingPhoto(true);
    setProfileMsg(null);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setUploadingPhoto(false);
      setProfileMsg({ type: 'error', text: t('photoUpdateError') });
      return;
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: urlData.publicUrl })
      .eq('id', user.id);

    setUploadingPhoto(false);
    if (updateError) {
      setProfileMsg({ type: 'error', text: t('photoUpdateError') });
    } else {
      setAvatarUrl(publicUrl);
      setProfileMsg({ type: 'success', text: t('photoUpdated') });
      setTimeout(() => setProfileMsg(null), 3000);
    }
  }, [user, t]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Profile section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-800">{t('myProfile')}</h2>
          </div>
          {!editing && !loadingProfile && profile && (
            <button
              onClick={() => { setEditing(true); setProfileMsg(null); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {t('editProfile')}
            </button>
          )}
        </div>

        {loadingProfile ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        ) : profile ? (
          <>
            {/* Profile header card */}
            <div className="flex items-center gap-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100 mb-4">
              <div className="relative shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={profile.prenom}
                    className="w-14 h-14 rounded-full object-cover border-2 border-emerald-200"
                  />
                ) : (
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-lg font-bold">
                    {(profile.prenom?.[0] || '') + (profile.nom?.[0] || '')}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute -bottom-1 -right-1 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white border-2 border-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-60"
                >
                  {uploadingPhoto ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoUpload(file);
                    e.target.value = '';
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-slate-800 truncate">
                  {profile.prenom} {profile.nom}
                </p>
                {profile.created_at && (
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {t('memberSince')} {formatDate(profile.created_at)}
                  </p>
                )}
              </div>
            </div>

            {/* Profile message */}
            {profileMsg && (
              <div className={`flex items-start gap-2 px-3 py-2.5 rounded-lg mb-4 ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                {profileMsg.type === 'success'
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  : <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                }
                <span className={`text-xs ${profileMsg.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
                  {profileMsg.text}
                </span>
              </div>
            )}

            {editing ? (
              /* Edit mode */
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">{t('lastName')}</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={editForm.nom}
                        onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">{t('firstName')}</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={editForm.prenom}
                        onChange={(e) => setEditForm({ ...editForm, prenom: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">{t('country')}</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={editForm.pays}
                        onChange={(e) => setEditForm({ ...editForm, pays: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">{t('city')}</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={editForm.ville}
                        onChange={(e) => setEditForm({ ...editForm, ville: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">{t('phone')}</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={editForm.telephone}
                      onChange={(e) => setEditForm({ ...editForm, telephone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />{t('loading')}</>
                    ) : (
                      <><Save className="w-4 h-4" />{t('saveProfile')}</>
                    )}
                  </button>
                  <button
                    onClick={() => { setEditing(false); setProfileMsg(null); setEditForm(profile); }}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-60"
                  >
                    <X className="w-4 h-4" />
                    {t('cancel')}
                  </button>
                </div>
              </div>
            ) : (
              /* Read mode */
              <div className="space-y-px rounded-xl overflow-hidden border border-slate-200">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-500 w-20 shrink-0">{t('email')}</span>
                  <span className="text-sm text-slate-800 font-medium truncate">{profile.email || userEmail}</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-white">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-500 w-20 shrink-0">{t('phone')}</span>
                  <span className="text-sm text-slate-800 font-medium">{profile.telephone || '—'}</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-500 w-20 shrink-0">{t('country')}</span>
                  <span className="text-sm text-slate-800 font-medium">{profile.pays || '—'}</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-white">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-500 w-20 shrink-0">{t('city')}</span>
                  <span className="text-sm text-slate-800 font-medium">{profile.ville || '—'}</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-center">
            <p className="text-sm text-slate-500">{userEmail || t('user')}</p>
          </div>
        )}
      </div>

      {/* Settings section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-800">{t('settings')}</h2>
        </div>

        {/* Options */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-700">{t('notifications')}</span>
            </div>
            <button
              onClick={toggleNotifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationsEnabled ? 'bg-emerald-600' : 'bg-slate-300'
              }`
              }
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`
                }
              />
            </button>
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-700">{t('language')}</span>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <Coins className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-700">{t('currency')}</span>
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={onOpenPrivacy}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-700">{t('privacy')}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
          {installPrompt && !isInstalled && (
            <button
              onClick={onInstall}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-700">{t('installApp')}</span>
              </div>
              <span className="text-xs text-emerald-600 font-medium">{t('install')}</span>
            </button>
          )}
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Feed Formular',
                  text: true
                    ? "Découvrez Feed Formular — l'application de formulation d'aliment pour volaille par PRAVET PLUS"
                    : 'Check out Feed Formular — the poultry feed formulation app by PRAVET PLUS',
                  url: window.location.origin,
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(window.location.origin);
                setProfileMsg({ type: 'success', text: t('linkCopied') });
                setTimeout(() => setProfileMsg(null), 3000);
              }
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Share2 className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-700">{t('shareApp')}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Subscription status */}
      {subStatus && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-800">{t('subscriptionStatus')}</h2>
          </div>
          <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${subStatus.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium text-slate-700">
                {subStatus.isAdmin ? t('adminAccess') : subStatus.isActive ? t('active') : t('expired')}
              </span>
            </div>
            {subStatus.isActive && !subStatus.isAdmin && subStatus.timeLeftText && (
              <span className="text-xs text-slate-500">
                {subStatus.timeLeftText}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Admin panel */}
      {isAdmin && <AdminPanel />}

      {/* Logout */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t('logout')}
        </button>
      </div>
    </div>
  );
}

function AdminPanel() {
  const { t, lang } = useI18n();
  const [version, setVersion] = useState('1.0.0');
  const [forceUpdate, setForceUpdate] = useState(false);
  const [updateMsgFr, setUpdateMsgFr] = useState('');
  const [updateMsgEn, setUpdateMsgEn] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('app_config')
        .select('current_version, force_update, update_message_fr, update_message_en')
        .eq('id', 1)
        .maybeSingle();
      if (data) {
        setVersion(data.current_version);
        setForceUpdate(data.force_update);
        setUpdateMsgFr(data.update_message_fr);
        setUpdateMsgEn(data.update_message_en);
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setMsg(null);
    const { error } = await supabase
      .from('app_config')
      .update({
        current_version: version,
        force_update: forceUpdate,
        update_message_fr: updateMsgFr,
        update_message_en: updateMsgEn,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);
    setSaving(false);
    if (error) {
      setMsg({ type: 'error', text: t('configSaveError') });
    } else {
      setMsg({ type: 'success', text: t('configSaved') });
      setTimeout(() => setMsg(null), 4000);
    }
  }, [version, forceUpdate, updateMsgFr, updateMsgEn, t]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-5 mb-4 flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-5 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Crown className="w-5 h-5 text-emerald-600" />
        <h2 className="text-lg font-bold text-slate-800">{t('adminPanel')}</h2>
      </div>

      {msg && (
        <div className={`flex items-start gap-2 px-3 py-2.5 rounded-lg mb-4 ${
          msg.type === 'success' ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
        }`}>
          {msg.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            : <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
          <span className={`text-xs ${msg.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>{msg.text}</span>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">{t('updateVersion')}</label>
          <div className="relative">
            <RefreshCw className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0.0"
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            {t('updateMessage')} ({lang === 'fr' ? 'FR' : 'EN'})
          </label>
          <textarea
            value={updateMsgFr}
            onChange={(e) => setUpdateMsgFr(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow resize-none"
          />
        </div>

        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-50">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-700">{t('forceUpdate')}</span>
          </div>
          <button
            onClick={() => setForceUpdate(!forceUpdate)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              forceUpdate ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
              forceUpdate ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" />{t('loading')}</>
          ) : (
            <><Save className="w-4 h-4" />{t('saveConfig')}</>
          )}
        </button>
      </div>
    </div>
  );
}
