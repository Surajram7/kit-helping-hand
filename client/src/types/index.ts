export type UserRole = 'STUDENT' | 'CONTENT_MANAGER' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  fullName: string;
  email: string;
  studentId?: string | null;
  role: UserRole;
  isActive: boolean;
  academicProgramId?: string | null;
  academicProgram?: AcademicProgram | null;
  batchId?: string | null;
  batch?: Batch | null;
  semesterId?: string | null;
  semester?: Semester | null;
  universityAffiliationId?: string | null;
  universityAffiliation?: UniversityAffiliation | null;
  createdAt: string;
  _count?: {
    studentRequests?: number;
    uploadedResources?: number;
  };
}

export interface AcademicProgram {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  batches?: Batch[];
  subjects?: Subject[];
  _count?: {
    subjects: number;
    batches: number;
    resources: number;
  };
}

export interface Batch {
  id: string;
  name: string;
  code: string;
  academicProgramId?: string | null;
  academicProgram?: AcademicProgram | null;
  isActive: boolean;
  _count?: {
    resources: number;
    users: number;
  };
}

export interface Semester {
  id: string;
  name: string;
  semesterNumber: number;
  isActive: boolean;
  _count?: {
    subjects: number;
    resources: number;
  };
}

export interface UniversityAffiliation {
  id: string;
  name: string;
  shortCode: string;
  description?: string | null;
  isActive: boolean;
  _count?: {
    resources: number;
    users: number;
  };
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  academicProgramId: string;
  academicProgram?: AcademicProgram;
  semesterId: string;
  semester?: Semester;
  description?: string | null;
  isActive: boolean;
  _count?: {
    resources: number;
  };
}

export interface ResourceFile {
  id: string;
  resourceId: string;
  fileName: string;
  storageKey: string;
  fileSize: number;
  mimeType: string;
  fileRole: 'MAIN' | 'SOLUTION' | 'SUPPLEMENTARY';
  createdAt: string;
}

export interface Resource {
  id: string;
  title: string;
  description?: string | null;
  resourceType: string;
  academicProgramId?: string | null;
  academicProgram?: AcademicProgram | null;
  batchId?: string | null;
  batch?: Batch | null;
  semesterId?: string | null;
  semester?: Semester | null;
  subjectId?: string | null;
  subject?: Subject | null;
  universityAffiliationId?: string | null;
  universityAffiliation?: UniversityAffiliation | null;
  lectureNumber?: string | null;
  topic?: string | null;
  examType?: string | null;
  examYear?: number | null;
  examSession?: string | null;
  isSolved: boolean;
  hasSolutionFile: boolean;
  isPublished: boolean;
  isArchived: boolean;
  downloadCount: number;
  viewCount: number;
  uploadedById: string;
  uploadedBy?: { id: string; fullName: string; role: string };
  files: ResourceFile[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentRequest {
  id: string;
  studentId: string;
  student?: { id: string; fullName: string; email: string; studentId?: string };
  title: string;
  category: 'LECTURE_NOTE' | 'PAST_PAPER' | 'RESOURCE_CATEGORY_SUGGESTION' | 'FILE_ISSUE_REPORT' | 'GENERAL_FEEDBACK';
  description: string;
  semesterId?: string | null;
  semester?: Semester | null;
  subjectId?: string | null;
  subject?: Subject | null;
  universityAffiliationId?: string | null;
  universityAffiliation?: UniversityAffiliation | null;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'COMPLETED' | 'DECLINED';
  adminResponse?: string | null;
  comments: RequestComment[];
  createdAt: string;
  updatedAt: string;
}

export interface RequestComment {
  id: string;
  requestId: string;
  userId: string;
  user: { id: string; fullName: string; role: string };
  comment: string;
  createdAt: string;
}

export interface PlatformSettings {
  id: string;
  platformName: string;
  tagline: string;
  institutionName: string;
  logoUrl?: string | null;
  contactEmail?: string | null;
  maintenanceMode: boolean;
  maintenanceNotice?: string | null;
  allowedFileTypes: string;
  maxFileSizeMb: number;
}

export interface DashboardStats {
  totalStudents: number;
  totalContentManagers?: number;
  totalPublishedResources: number;
  totalFiles: number;
  totalBatches: number;
  totalSemesters: number;
  totalSubjects: number;
  totalPastPapers: number;
  totalSolvedPapers: number;
  totalUnsolvedPapers: number;
  pendingRequests: number;
  recentResources: Resource[];
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  userEmail: string;
  action: string;
  recordType: string;
  recordId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}
