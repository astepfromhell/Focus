exports.toUserDto = (user = {}) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  avatarUrl: user.avatar_url,
  emailVerified: !!user.email_verified,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
  lastLoginAt: user.last_login_at,
});
