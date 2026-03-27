import React, { useRef, useState } from 'react';
import { FaCamera } from 'react-icons/fa';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './AvatarUpload.css';

interface Props {
  size?: number; // px, default 88
}

const AvatarUpload: React.FC<Props> = ({ size = 88 }) => {
  const { user, updateAvatar } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2 MB');
      return;
    }

    setUploading(true);
    try {
      const res = await authAPI.uploadAvatar(file);
      const updatedUser = res.data.user;
      updateAvatar(updatedUser.avatar);
      toast.success('Profile picture updated!');
    } catch {
      toast.error('Failed to upload photo. Try again.');
    } finally {
      setUploading(false);
      // reset so same file can be re-selected
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="avatar-upload-wrapper">
      <div
        className="avatar-upload-circle"
        style={{ width: size, height: size }}
        onClick={() => !uploading && inputRef.current?.click()}
        title="Change profile picture"
      >
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} />
        ) : (
          <div className="avatar-initials">{initials}</div>
        )}

        {uploading ? (
          <div className="avatar-uploading">
            <div className="avatar-spinner" />
          </div>
        ) : (
          <div className="avatar-overlay">
            <FaCamera />
            <span>Change</span>
          </div>
        )}
      </div>

      <p className="avatar-upload-hint">Click to upload photo · Max 2 MB</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default AvatarUpload;
