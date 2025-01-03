import { useState, useEffect } from 'react';
import { User, Mail, Edit2, Save, AlertCircle } from 'lucide-react';
import { getUserProfile, saveUserProfile } from './services/userService';

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    company: '',
    role: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userData = await getUserProfile();
        setProfile(userData as any);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to load profile' });
      }
    };
    
    loadProfile();
  }, []);
  
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveUserProfile(profile);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg max-w-4xl mx-auto px-4 py-8 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
          Profile Settings
        </h2>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            isEditing
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
              : 'text-rose-500 hover:bg-rose-50'
          }`}
          disabled={isSaving}
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          ) : (
            <>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </>
          )}
        </button>
      </div>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm flex items-center ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          <AlertCircle className="w-4 h-4 mr-2" />
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-gray-700 mb-2">Display Name</label>
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={profile.displayName}
              onChange={(e) => setProfile({...profile, displayName: e.target.value})}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
              disabled={!isEditing}
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({...profile, email: e.target.value})}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
              disabled={!isEditing}
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Company</label>
          <input
            type="text"
            value={profile.company}
            onChange={(e) => setProfile({...profile, company: e.target.value})}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Role</label>
          <input
            type="text"
            value={profile.role}
            onChange={(e) => setProfile({...profile, role: e.target.value})}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
            disabled={!isEditing}
          />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;