import type {
  AdminUser,
  AdminUserDetail,
  AdminUserQueryParams,
  AdminPaginatedResponse,
  AdminUserStats,
} from '@/types/admin';

// TODO: Replace with real API calls when backend admin endpoints are built
// Backend needs:
// - GET    /api/v1/admin/users           (list users with search/filter/pagination)
// - GET    /api/v1/admin/users/:id       (get user detail)
// - PUT    /api/v1/admin/users/:id       (update user)
// - PATCH  /api/v1/admin/users/:id/suspend   (suspend user)
// - PATCH  /api/v1/admin/users/:id/activate  (activate user)
// - DELETE /api/v1/admin/users/:id       (soft delete user)
// - GET    /api/v1/admin/stats           (admin dashboard stats)

const MOCK_USERS: AdminUser[] = [
  { id: '1', email: 'priya.sharma@example.com', firstName: 'Priya', lastName: 'Sharma', role: 'LEARNER', status: 'active', profileImage: null, isVerified: true, organizationId: null, organizationName: null, lastLoginAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: '2', email: 'rahul.patel@example.com', firstName: 'Rahul', lastName: 'Patel', role: 'TEACHER', status: 'active', profileImage: null, isVerified: true, organizationId: 'org-1', organizationName: 'Delhi Public School', lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: '3', email: 'anita.desai@example.com', firstName: 'Anita', lastName: 'Desai', role: 'LEARNER', status: 'inactive', profileImage: null, isVerified: false, organizationId: null, organizationName: null, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString() },
  { id: '4', email: 'vikram.singh@example.com', firstName: 'Vikram', lastName: 'Singh', role: 'INSTRUCTOR', status: 'active', profileImage: null, isVerified: true, organizationId: 'org-2', organizationName: 'AIISH Mumbai', lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
  { id: '5', email: 'meera.nair@example.com', firstName: 'Meera', lastName: 'Nair', role: 'LEARNER', status: 'active', profileImage: null, isVerified: true, organizationId: null, organizationName: null, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() },
  { id: '6', email: 'arjun.reddy@example.com', firstName: 'Arjun', lastName: 'Reddy', role: 'TEACHER', status: 'suspended', profileImage: null, isVerified: true, organizationId: 'org-3', organizationName: 'Hyderabad Central School', lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 200).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString() },
  { id: '7', email: 'sneha.gupta@example.com', firstName: 'Sneha', lastName: 'Gupta', role: 'ADMIN', status: 'active', profileImage: null, isVerified: true, organizationId: null, organizationName: null, lastLoginAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { id: '8', email: 'karan.joshi@example.com', firstName: 'Karan', lastName: 'Joshi', role: 'LEARNER', status: 'active', profileImage: null, isVerified: false, organizationId: null, organizationName: null, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
  { id: '9', email: 'divya.menon@example.com', firstName: 'Divya', lastName: 'Menon', role: 'HOSPITAL', status: 'active', profileImage: null, isVerified: true, organizationId: 'org-4', organizationName: 'KIMS Hospital', lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 75).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: '10', email: 'rohan.verma@example.com', firstName: 'Rohan', lastName: 'Verma', role: 'LEARNER', status: 'active', profileImage: null, isVerified: true, organizationId: null, organizationName: null, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
  { id: '11', email: 'anjali.iyer@example.com', firstName: 'Anjali', lastName: 'Iyer', role: 'NGO', status: 'active', profileImage: null, isVerified: true, organizationId: 'org-5', organizationName: 'AccessAbility India', lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 150).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
  { id: '12', email: 'amit.kumar@example.com', firstName: 'Amit', lastName: 'Kumar', role: 'LEARNER', status: 'inactive', profileImage: null, isVerified: false, organizationId: null, organizationName: null, lastLoginAt: null, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
  { id: '13', email: 'pooja.sinha@example.com', firstName: 'Pooja', lastName: 'Sinha', role: 'TEACHER', status: 'active', profileImage: null, isVerified: true, organizationId: 'org-6', organizationName: 'Patna Central School', lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() },
  { id: '14', email: 'deepak.yadav@example.com', firstName: 'Deepak', lastName: 'Yadav', role: 'GOVERNMENT', status: 'active', profileImage: null, isVerified: true, organizationId: 'org-7', organizationName: 'Ministry of Social Justice', lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 300).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() },
  { id: '15', email: 'nishtha.jain@example.com', firstName: 'Nishtha', lastName: 'Jain', role: 'LEARNER', status: 'active', profileImage: null, isVerified: true, organizationId: null, organizationName: null, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
];

const MOCK_DETAIL: Record<string, AdminUserDetail> = {
  '1': {
    ...MOCK_USERS[0],
    phone: '+91 98765 43210',
    dateOfBirth: '1995-06-15',
    bio: 'Passionate about learning Indian Sign Language to communicate with deaf community members.',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    enrolledCourses: 3,
    completedCourses: 1,
    certificates: 1,
    practiceSessions: 24,
    translations: 56,
    recentActivity: [
      { id: 'a1', action: 'COMPLETED_LESSON', resource: 'Basic Greetings', details: 'Lesson completed with 92% accuracy', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
      { id: 'a2', action: 'PRACTICE_SESSION', resource: 'AI Practice', details: 'Practiced 15 gestures with 87% average confidence', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
      { id: 'a3', action: 'TRANSLATION', resource: 'Text to Sign', details: 'Translated 3 paragraphs to ISL', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
    ],
  },
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const adminUserApi = {
  async getUsers(params: AdminUserQueryParams = {}): Promise<AdminPaginatedResponse<AdminUser>> {
    // TODO: Replace with real API: GET /api/v1/admin/users
    await delay(300);
    let filtered = [...MOCK_USERS];

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      );
    }

    if (params.role) {
      filtered = filtered.filter((u) => u.role === params.role);
    }

    if (params.status) {
      filtered = filtered.filter((u) => u.status === params.status);
    }

    const page = params.page || 1;
    const limit = params.limit || 10;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return {
      data: paginated,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    };
  },

  async getUserById(id: string): Promise<AdminUserDetail> {
    // TODO: Replace with real API: GET /api/v1/admin/users/:id
    await delay(200);
    if (MOCK_DETAIL[id]) return MOCK_DETAIL[id];
    const user = MOCK_USERS.find((u) => u.id === id);
    if (!user) throw new Error('User not found');
    return {
      ...user,
      phone: null,
      dateOfBirth: null,
      bio: null,
      country: null,
      state: null,
      city: null,
      enrolledCourses: 0,
      completedCourses: 0,
      certificates: 0,
      practiceSessions: 0,
      translations: 0,
      recentActivity: [],
    };
  },

  async updateUser(id: string, data: Partial<Pick<AdminUser, 'firstName' | 'lastName' | 'email' | 'role' | 'status'>>): Promise<AdminUser> {
    // TODO: Replace with real API: PUT /api/v1/admin/users/:id
    await delay(400);
    const idx = MOCK_USERS.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('User not found');
    MOCK_USERS[idx] = { ...MOCK_USERS[idx], ...data, updatedAt: new Date().toISOString() };
    return MOCK_USERS[idx];
  },

  async suspendUser(id: string): Promise<AdminUser> {
    // TODO: Replace with real API: PATCH /api/v1/admin/users/:id/suspend
    await delay(300);
    const idx = MOCK_USERS.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('User not found');
    MOCK_USERS[idx] = { ...MOCK_USERS[idx], status: 'suspended', updatedAt: new Date().toISOString() };
    return MOCK_USERS[idx];
  },

  async activateUser(id: string): Promise<AdminUser> {
    // TODO: Replace with real API: PATCH /api/v1/admin/users/:id/activate
    await delay(300);
    const idx = MOCK_USERS.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('User not found');
    MOCK_USERS[idx] = { ...MOCK_USERS[idx], status: 'active', updatedAt: new Date().toISOString() };
    return MOCK_USERS[idx];
  },

  async deleteUser(id: string): Promise<void> {
    // TODO: Replace with real API: DELETE /api/v1/admin/users/:id
    await delay(300);
    const idx = MOCK_USERS.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('User not found');
    MOCK_USERS.splice(idx, 1);
  },

  async getStats(): Promise<AdminUserStats> {
    // TODO: Replace with real API: GET /api/v1/admin/stats
    await delay(200);
    return {
      totalUsers: MOCK_USERS.length,
      activeUsers: MOCK_USERS.filter((u) => u.status === 'active').length,
      suspendedUsers: MOCK_USERS.filter((u) => u.status === 'suspended').length,
      newUsersThisMonth: MOCK_USERS.filter((u) => {
        const d = new Date(u.createdAt);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length,
    };
  },
};
