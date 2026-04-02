import type { Principal } from "@icp-sdk/core/principal";

export interface ZakatSettings {
  nisabGoldGrams: number;
  nisabSilverGrams: number;
  goldRatePerGram: number;
  silverRatePerGram: number;
}

export interface RegistrationSettings {
  upiId: string;
  feeAmount: bigint;
}

export interface MatrimonyProposal {
  id: bigint;
  age: bigint;
  postedBy: Principal;
  contact: string;
  city: string;
  name: string;
  education: string;
  profession: string;
  description: string;
  gender: Gender;
  timestamp: bigint;
}

export interface NikahRegistration {
  id: bigint;
  nikahUniqueId: string;
  // Groom
  groomName: string;
  groomFatherName: string;
  groomAddress: string;
  groomAadhaarHash: string;
  groomPhone: string;
  groomPhotoUrl: string;
  groomSignature: string;
  // Bride
  brideName: string;
  brideFatherName: string;
  brideAddress: string;
  brideAadhaarHash: string;
  bridePhone: string;
  bridePhotoUrl: string;
  brideSignature: string;
  // Ceremony
  nikahDate: string;
  masjidVenue: string;
  city: string;
  qaziName: string;
  qaziContact: string;
  qaziSignature: string;
  // Witnesses
  witness1: string;
  witness1Contact: string;
  witness1Signature: string;
  witness2: string;
  witness2Contact: string;
  witness2Signature: string;
  // Masjid authority
  masjidSignature: string;
  // Maher
  maher: string;
  // Meta
  status: NikahStatus;
  registeredBy: Principal;
  timestamp: bigint;
}

export interface JobPosting {
  id: bigint;
  title: string;
  postedBy: Principal;
  contact: string;
  description: string;
  company: string;
  timestamp: bigint;
  location: string;
}

export interface Certificate {
  issuedDate: bigint;
  nikah: NikahRegistration;
  certificateNumber: string;
}

export interface UserProfile {
  isMasjid: boolean;
  contact: string;
  name: string;
}

export interface MasjidProfile {
  id: bigint;
  status: MasjidStatus;
  city: string;
  contactPerson: string;
  registrationNumber: string;
  email: string;
  masjidName: string;
  state: string;
  address: string;
  timestamp: bigint;
  facilities: Array<string>;
  phone: string;
  upiId: string;
  capacity: bigint;
  registeredBy: Principal;
  // Committee details
  presidentName: string;
  presidentPhone: string;
  secretaryName: string;
  secretaryPhone: string;
  treasurerName: string;
  treasurerPhone: string;
  // Payment
  utrNumber: string;
  masjidRegistrationId: string;
}

export interface ZakatProfile {
  id: bigint;
  masjidId: bigint;
  personName: string;
  story: string;
  requiredAmount: number;
  collectedAmount: number;
  upiId: string;
  status: ZakatProfileStatus;
  createdBy: Principal;
  timestamp: bigint;
}

export enum Gender {
  female = "female",
  male = "male",
}

export enum NikahStatus {
  pending = "pending",
  approved = "approved",
  rejected = "rejected",
}

export enum MasjidStatus {
  pending = "pending",
  approved = "approved",
  rejected = "rejected",
}

export enum ZakatProfileStatus {
  open = "open",
  fulfilled = "fulfilled",
}

export enum UserRole {
  admin = "admin",
  user = "user",
  guest = "guest",
}

export interface backendInterface {
  // Registration settings
  setRegistrationSettings(upiId: string, feeAmount: bigint): Promise<void>;
  getRegistrationSettings(): Promise<RegistrationSettings | null>;
  // Masjid management (admin only)
  approveMasjidRegistration(id: bigint): Promise<void>;
  rejectMasjidRegistration(id: bigint): Promise<void>;
  adminUpdateMasjidProfile(id: bigint, profile: MasjidProfile): Promise<void>;
  adminDeleteMasjidRegistration(id: bigint): Promise<void>;
  getPendingMasjidRegistrations(): Promise<Array<MasjidProfile>>;
  getAllMasjidRegistrations(): Promise<Array<MasjidProfile>>;
  getApprovedMasjids(): Promise<Array<MasjidProfile>>;
  getCallerMasjidProfile(): Promise<MasjidProfile | null>;
  submitMasjidRegistration(profile: MasjidProfile): Promise<string>;
  // Nikah management
  approveNikahRegistration(id: bigint): Promise<void>;
  rejectNikahRegistration(id: bigint): Promise<void>;
  adminDeleteNikahRegistration(id: bigint): Promise<void>;
  adminUpdateNikahRegistration(id: bigint, registration: NikahRegistration): Promise<void>;
  getAllNikahRegistrations(): Promise<Array<NikahRegistration>>;
  getCallerNikahRegistrations(): Promise<Array<NikahRegistration>>;
  getPendingNikahRegistrations(): Promise<Array<NikahRegistration>>;
  getNikahRegistration(id: bigint): Promise<NikahRegistration | null>;
  submitNikahRegistration(registration: NikahRegistration): Promise<bigint>;
  generateCertificate(nikahId: bigint): Promise<Certificate>;
  // Matrimony management
  getAllMatrimonyProposals(): Promise<Array<MatrimonyProposal>>;
  getCallerMatrimonyProposals(): Promise<Array<MatrimonyProposal>>;
  postMatrimonyProposal(proposal: MatrimonyProposal): Promise<bigint>;
  adminDeleteMatrimonyProposal(id: bigint): Promise<void>;
  adminUpdateMatrimonyProposal(id: bigint, proposal: MatrimonyProposal): Promise<void>;
  // Jobs management
  getAllJobPostings(): Promise<Array<JobPosting>>;
  getCallerJobPostings(): Promise<Array<JobPosting>>;
  postJobPosting(job: JobPosting): Promise<bigint>;
  adminDeleteJobPosting(id: bigint): Promise<void>;
  adminUpdateJobPosting(id: bigint, job: JobPosting): Promise<void>;
  // Zakat profiles
  getOpenZakatProfiles(): Promise<Array<ZakatProfile>>;
  getAllZakatProfiles(): Promise<Array<ZakatProfile>>;
  getZakatProfilesByMasjid(masjidId: bigint): Promise<Array<ZakatProfile>>;
  createZakatProfile(profile: ZakatProfile): Promise<bigint>;
  updateZakatProfile(id: bigint, profile: ZakatProfile): Promise<void>;
  deleteZakatProfile(id: bigint): Promise<void>;
  markZakatProfileFulfilled(id: bigint): Promise<void>;
  updateZakatCollectedAmount(id: bigint, amount: number): Promise<void>;
  // Zakat settings
  getZakatSettings(): Promise<ZakatSettings | null>;
  updateZakatSettings(settings: ZakatSettings): Promise<void>;
  // User profile
  assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
  getCallerUserProfile(): Promise<UserProfile | null>;
  getUserProfile(user: Principal): Promise<UserProfile | null>;
  saveCallerUserProfile(profile: UserProfile): Promise<void>;
  getCallerUserRole(): Promise<UserRole>;
  // Admin / auth
  isCallerAdmin(): Promise<boolean>;
  isAdminAssigned(): Promise<boolean>;
  claimAdminIfUnassigned(): Promise<boolean>;
  resetAllRolesWithToken(token: string): Promise<void>;
}
