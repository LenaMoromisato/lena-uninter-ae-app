export type SeedState = {
  studentUserId: string;
  mentorUserId: string;
  adminUserId: string;
  conversationId: string;
  eventId: string;
  roleId: string;
  mentorshipRequestId: string;
};

export type E2eCredentials = {
  studentEmail: string;
  studentPassword: string;
  mentorEmail: string;
  mentorPassword: string;
  adminEmail: string;
  adminPassword: string;
};

export type SessionPayload = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number | null;
  tokenType: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: { code: string };
    permissionCodes: string[];
  };
};
