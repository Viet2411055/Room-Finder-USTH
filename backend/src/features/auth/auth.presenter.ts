export function presentUser(user: any) {
  return { id: user.id, username: user.username, name: user.name, email: user.email, phone: user.phone, avatarUrl: user.avatarUrl, bio: user.bio, role: user.role, status: user.status, emailVerifiedAt: user.emailVerifiedAt, hostId: user.hostProfile?.id ?? null, createdAt: user.createdAt };
}
