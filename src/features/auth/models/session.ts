export type UserProfile = {
  id: string;
  programmingLanguages: string[];
  workArea: string | null;
  experienceYears: number | null;
  education: unknown;
  meta: unknown;
  createdAt: string | null;
  updatedAt: string | null;
};

export type SessionUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  linkedinUrl: string | null;
  meta: unknown;
  role: {
    id: string;
    code: string;
    label: string;
  };
  permissionCodes: string[];
  profile: UserProfile | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type Session = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number | null;
  tokenType: string;
  user: SessionUser;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
