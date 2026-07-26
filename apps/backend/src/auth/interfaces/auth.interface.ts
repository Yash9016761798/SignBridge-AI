export interface FirebaseUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
}

export interface AuthenticatedUser {
  id: string;
  firebaseUid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roleId: string;
  organizationId?: string;
  isVerified: boolean;
  isActive: boolean;
}

export interface JwtPayload {
  sub: string;
  email: string;
  roleId: string;
  role: string;
  organizationId?: string;
}
