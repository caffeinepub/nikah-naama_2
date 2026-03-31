import type { Principal } from "@icp-sdk/core/principal";

export interface ZakatSettings {
  nisabGoldGrams: number;
  nisabSilverGrams: number;
  goldRatePerGram: number;
  silverRatePerGram: number;
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
  status: NikahStatus;
  brideAadhaarHash: string;
  city: string;
  nikahDate: string;
  qaziName: string;
  brideName: string;
  witness1: string;
  witness2: string;
  timestamp: bigint;
  groomName: string;
  groomAadhaarHash: string;
  registeredBy: Principal;
  masjidVenue: string;
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
  approveMasjidRegistration(id: bigint): Promise<void>;
  approveNikahRegistration(id: bigint): Promise<void>;
  assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
  generateCertificate(nikahId: bigint): Promise<Certificate>;
  getAllJobPostings(): Promise<Array<JobPosting>>;
  getAllMasjidRegistrations(): Promise<Array<MasjidProfile>>;
  getAllMatrimonyProposals(): Promise<Array<MatrimonyProposal>>;
  getAllNikahRegistrations(): Promise<Array<NikahRegistration>>;
  getAllZakatProfiles(): Promise<Array<ZakatProfile>>;
  getApprovedMasjids(): Promise<Array<MasjidProfile>>;
  getCallerMasjidProfile(): Promise<MasjidProfile | null>;
  getCallerUserProfile(): Promise<UserProfile | null>;
  getCallerUserRole(): Promise<UserRole>;
  getNikahRegistration(id: bigint): Promise<NikahRegistration | null>;
  getOpenZakatProfiles(): Promise<Array<ZakatProfile>>;
  getPendingMasjidRegistrations(): Promise<Array<MasjidProfile>>;
  getPendingNikahRegistrations(): Promise<Array<NikahRegistration>>;
  getUserProfile(user: Principal): Promise<UserProfile | null>;
  getZakatProfilesByMasjid(masjidId: bigint): Promise<Array<ZakatProfile>>;
  getZakatSettings(): Promise<ZakatSettings | null>;
  isCallerAdmin(): Promise<boolean>;
  markZakatProfileFulfilled(id: bigint): Promise<void>;
  postJobPosting(job: JobPosting): Promise<bigint>;
  postMatrimonyProposal(proposal: MatrimonyProposal): Promise<bigint>;
  rejectMasjidRegistration(id: bigint): Promise<void>;
  rejectNikahRegistration(id: bigint): Promise<void>;
  saveCallerUserProfile(profile: UserProfile): Promise<void>;
  submitMasjidRegistration(profile: MasjidProfile): Promise<bigint>;
  submitNikahRegistration(registration: NikahRegistration): Promise<bigint>;
  updateCallerMasjidProfile(profile: MasjidProfile): Promise<void>;
  adminUpdateMasjidProfile(id: bigint, profile: MasjidProfile): Promise<void>;
  createZakatProfile(profile: ZakatProfile): Promise<bigint>;
  updateZakatProfile(id: bigint, profile: ZakatProfile): Promise<void>;
  deleteZakatProfile(id: bigint): Promise<void>;
  updateZakatCollectedAmount(id: bigint, amount: number): Promise<void>;
  updateZakatSettings(settings: ZakatSettings): Promise<void>;
}
