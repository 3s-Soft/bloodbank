import React, { useState, useEffect } from 'react';
import { 
  FaCog, 
  FaBell, 
  FaShieldAlt, 
  FaPalette, 
  FaLanguage, 
  FaGlobe, 
  FaDownload,
  FaTrash,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSave,
  FaMoon,
  FaSun,
  FaVolumeUp,
  FaVolumeOff
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';

const Settings = () => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    bloodRequestAlerts: true,
    eventReminders: true,
    donationReminders: true,
    
    // Privacy Settings
    profileVisibility: 'public',
    showPhoneNumber: true,
    showEmail: false,
    showLastDonation: true,
    
    // App Settings
    theme: 'light',
    language: 'en',
    soundEnabled: true,
    autoLocation: true,
    
    // Account Settings
    twoFactorAuth: false,
    dataExport: false,
    marketingEmails: false
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showPasswords: false
  });

  useEffect(() => {
    // Load settings from localStorage or API
    const savedTheme = localStorage.getItem('theme') || 'light';
    setSettings(prev => ({
      ...prev,
      theme: savedTheme
    }));
  }, []);

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));

    // Apply theme change immediately
    if (setting === 'theme') {
      document.documentElement.setAttribute('data-theme', value);
      localStorage.setItem('theme', value);
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = () => {
    // Here you would save settings to your backend
    console.log('Saving settings:', settings);
    
    Swal.fire({
      title: 'Settings Saved!',
      text: 'Your preferences have been updated successfully.',
      icon: 'success',
      confirmButtonColor: '#ef4444'
    });
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire({
        title: 'Error!',
        text: 'New passwords do not match.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Swal.fire({
        title: 'Error!',
        text: 'Password must be at least 6 characters long.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    // Here you would change the password via your auth system
    console.log('Changing password...');
    
    Swal.fire({
      title: 'Password Changed!',
      text: 'Your password has been updated successfully.',
      icon: 'success',
      confirmButtonColor: '#ef4444'
    });

    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      showPasswords: false
    });
  };

  const handleExportData = () => {
    Swal.fire({
      title: 'Export Data',
      text: 'Your data export will be sent to your email address within 24 hours.',
      icon: 'info',
      confirmButtonColor: '#ef4444'
    });
  };

  const handleDeleteAccount = () => {
    Swal.fire({
      title: 'Delete Account?',
      text: 'This action cannot be undone. All your data will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete my account',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280'
    }).then((result) => {
      if (result.isConfirmed) {
        // Handle account deletion
        console.log('Deleting account...');
        Swal.fire({
          title: 'Account Deleted',
          text: 'Your account has been successfully deleted.',
          icon: 'success',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-base-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Settings</h1>
            <p className="text-lg text-base-content/70">
              Customize your experience and manage your account
            </p>
          </div>

          <div className="space-y-6">
            {/* Notification Settings */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-primary mb-4">
                  <FaBell className="mr-2" />
                  Notification Preferences
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                    { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive text message alerts' },
                    { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications' },
                    { key: 'bloodRequestAlerts', label: 'Blood Request Alerts', desc: 'Get notified about matching requests' },
                    { key: 'eventReminders', label: 'Event Reminders', desc: 'Reminders for blood drive events' },
                    { key: 'donationReminders', label: 'Donation Reminders', desc: 'Reminders when you can donate again' }
                  ].map((item) => (
                    <div key={item.key} className="form-control">
                      <label className="label cursor-pointer justify-start gap-4">
                        <input
                          type="checkbox"
                          checked={settings[item.key]}
                          onChange={(e) => handleSettingChange(item.key, e.target.checked)}
                          className="toggle toggle-primary"
                        />
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-sm text-base-content/70">{item.desc}</div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-success mb-4">
                  <FaShieldAlt className="mr-2" />
                  Privacy & Visibility
                </h2>
                
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Profile Visibility</span>
                    </label>
                    <select
                      value={settings.profileVisibility}
                      onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                      className="select select-bordered"
                    >
                      <option value="public">Public - Visible to everyone</option>
                      <option value="donors">Donors Only - Visible to registered donors</option>
                      <option value="private">Private - Only visible to you</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'showPhoneNumber', label: 'Show Phone Number', desc: 'Display your phone in profile' },
                      { key: 'showEmail', label: 'Show Email Address', desc: 'Display your email in profile' },
                      { key: 'showLastDonation', label: 'Show Last Donation', desc: 'Display your last donation date' }
                    ].map((item) => (
                      <div key={item.key} className="form-control">
                        <label className="label cursor-pointer justify-start gap-4">
                          <input
                            type="checkbox"
                            checked={settings[item.key]}
                            onChange={(e) => handleSettingChange(item.key, e.target.checked)}
                            className="toggle toggle-success"
                          />
                          <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-sm text-base-content/70">{item.desc}</div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* App Settings */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-warning mb-4">
                  <FaPalette className="mr-2" />
                  App Preferences
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        {settings.theme === 'dark' ? <FaMoon /> : <FaSun />}
                        Theme
                      </span>
                    </label>
                    <select
                      value={settings.theme}
                      onChange={(e) => handleSettingChange('theme', e.target.value)}
                      className="select select-bordered"
                    >
                      <option value="light">Light Mode</option>
                      <option value="dark">Dark Mode</option>
                      <option value="auto">Auto (System)</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <FaLanguage />
                        Language
                      </span>
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                      className="select select-bordered"
                    >
                      <option value="en">English</option>
                      <option value="bn">বাংলা (Bengali)</option>
                      <option value="hi">हिंदी (Hindi)</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-4">
                      <input
                        type="checkbox"
                        checked={settings.soundEnabled}
                        onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                        className="toggle toggle-warning"
                      />
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {settings.soundEnabled ? <FaVolumeUp /> : <FaVolumeOff />}
                          Sound Effects
                        </div>
                        <div className="text-sm text-base-content/70">Enable notification sounds</div>
                      </div>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-4">
                      <input
                        type="checkbox"
                        checked={settings.autoLocation}
                        onChange={(e) => handleSettingChange('autoLocation', e.target.checked)}
                        className="toggle toggle-warning"
                      />
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <FaGlobe />
                          Auto Location
                        </div>
                        <div className="text-sm text-base-content/70">Automatically detect your location</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-error mb-4">
                  <FaLock className="mr-2" />
                  Security & Account
                </h2>
                
                <div className="space-y-6">
                  {/* Change Password */}
                  <div>
                    <h3 className="font-semibold mb-3">Change Password</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Current Password</span>
                        </label>
                        <div className="relative">
                          <input
                            type={passwordData.showPasswords ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                            className="input input-bordered w-full pr-10"
                            placeholder="Enter current password"
                          />
                        </div>
                      </div>
                      
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">New Password</span>
                        </label>
                        <input
                          type={passwordData.showPasswords ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                          className="input input-bordered"
                          placeholder="Enter new password"
                        />
                      </div>
                      
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Confirm New Password</span>
                        </label>
                        <input
                          type={passwordData.showPasswords ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                          className="input input-bordered"
                          placeholder="Confirm new password"
                        />
                      </div>
                      
                      <div className="form-control">
                        <label className="label cursor-pointer justify-start gap-2">
                          <input
                            type="checkbox"
                            checked={passwordData.showPasswords}
                            onChange={(e) => handlePasswordChange('showPasswords', e.target.checked)}
                            className="checkbox checkbox-sm"
                          />
                          <span className="label-text flex items-center gap-1">
                            {passwordData.showPasswords ? <FaEye /> : <FaEyeSlash />}
                            Show passwords
                          </span>
                        </label>
                        <button
                          onClick={handleChangePassword}
                          className="btn btn-primary mt-2"
                        >
                          Change Password
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Two Factor Auth */}
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-4">
                      <input
                        type="checkbox"
                        checked={settings.twoFactorAuth}
                        onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                        className="toggle toggle-error"
                      />
                      <div>
                        <div className="font-medium">Two-Factor Authentication</div>
                        <div className="text-sm text-base-content/70">Add an extra layer of security to your account</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Data & Account Management */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-info mb-4">
                  <FaCog className="mr-2" />
                  Data & Account Management
                </h2>
                
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-4">
                      <input
                        type="checkbox"
                        checked={settings.marketingEmails}
                        onChange={(e) => handleSettingChange('marketingEmails', e.target.checked)}
                        className="toggle toggle-info"
                      />
                      <div>
                        <div className="font-medium">Marketing Emails</div>
                        <div className="text-sm text-base-content/70">Receive updates about new features and blood drives</div>
                      </div>
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleExportData}
                      className="btn btn-outline btn-info"
                    >
                      <FaDownload className="mr-2" />
                      Export My Data
                    </button>
                    
                    <button
                      onClick={handleDeleteAccount}
                      className="btn btn-outline btn-error"
                    >
                      <FaTrash className="mr-2" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Settings Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSaveSettings}
                className="btn btn-primary btn-lg"
              >
                <FaSave className="mr-2" />
                Save All Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
