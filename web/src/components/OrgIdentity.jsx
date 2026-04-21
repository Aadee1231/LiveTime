import { useNavigate } from 'react-router-dom';
import VerifiedBadge from './VerifiedBadge';

export default function OrgIdentity({ 
  profile, 
  size = 'default',
  showAvatar = true,
  clickable = true,
  className = ''
}) {
  const navigate = useNavigate();

  if (!profile || profile.account_type !== 'organization') {
    return null;
  }

  const handleClick = (e) => {
    if (clickable && profile.org_username) {
      e.stopPropagation();
      navigate(`/org/${profile.org_username}`);
    }
  };

  const sizeClasses = {
    small: 'org-identity-small',
    default: 'org-identity-default',
    large: 'org-identity-large'
  };

  const avatarSizes = {
    small: 'org-avatar-small',
    default: 'org-avatar-default',
    large: 'org-avatar-large'
  };

  return (
    <div 
      className={`org-identity ${sizeClasses[size]} ${clickable ? 'org-identity-clickable' : ''} ${className}`}
      onClick={handleClick}
    >
      {showAvatar && (
        <div className={`org-avatar ${avatarSizes[size]}`}>
          {profile.org_avatar_url ? (
            <img src={profile.org_avatar_url} alt={profile.org_name} />
          ) : (
            <div className="org-avatar-placeholder">
              {profile.org_name?.charAt(0)?.toUpperCase() || 'O'}
            </div>
          )}
        </div>
      )}
      <div className="org-identity-info">
        <div className="org-identity-name-row">
          <span className="org-name">{profile.org_name}</span>
          {profile.is_verified && <VerifiedBadge size={size === 'large' ? 'default' : 'small'} />}
        </div>
        {profile.org_username && size !== 'small' && (
          <span className="org-username">@{profile.org_username}</span>
        )}
      </div>
    </div>
  );
}
