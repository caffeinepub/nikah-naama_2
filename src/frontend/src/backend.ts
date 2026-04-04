/* eslint-disable */

// @ts-nocheck

import { Actor, HttpAgent, type HttpAgentOptions, type ActorConfig, type Agent, type ActorSubclass } from "@icp-sdk/core/agent";
import type { Principal } from "@icp-sdk/core/principal";
import { idlFactory, type _SERVICE } from "./declarations/backend.did";

export interface DonationInfo {
    upiId: string;
    qrCodeUrl: string;
}
export interface RegistrationSettings {
    upiId: string;
    feeAmount: bigint;
}
export interface ZakatSettings {
    nisabGoldGrams: number;
    silverRatePerGram: number;
    nisabSilverGrams: number;
    goldRatePerGram: number;
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
    status: NikahStatus;
    groomName: string;
    groomFatherName: string;
    groomAddress: string;
    groomAadhaarHash: string;
    groomPhone: string;
    groomPhotoUrl: string;
    groomSignature: string;
    brideName: string;
    brideFatherName: string;
    brideAddress: string;
    brideAadhaarHash: string;
    bridePhone: string;
    bridePhotoUrl: string;
    brideSignature: string;
    nikahDate: string;
    masjidVenue: string;
    city: string;
    qaziName: string;
    qaziContact: string;
    qaziSignature: string;
    witness1: string;
    witness1Contact: string;
    witness1Signature: string;
    witness2: string;
    witness2Contact: string;
    witness2Signature: string;
    masjidSignature: string;
    maher: string;
    timestamp: bigint;
    registeredBy: Principal;
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
    capacity: bigint;
    registeredBy: Principal;
    upiId: string;
    presidentName: string;
    presidentPhone: string;
    secretaryName: string;
    secretaryPhone: string;
    treasurerName: string;
    treasurerPhone: string;
    utrNumber: string;
    masjidRegistrationId: string;
}
export enum Gender {
    female = "female",
    male = "male"
}
export enum NikahStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
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
export enum MasjidStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum ZakatProfileStatus {
    open = "open",
    fulfilled = "fulfilled",
}

export interface backendInterface {
    _initializeAccessControlWithSecret(userSecret: string): Promise<void>;
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
    getCallerNikahRegistrations(): Promise<Array<NikahRegistration>>;
    getCallerMatrimonyProposals(): Promise<Array<MatrimonyProposal>>;
    getCallerJobPostings(): Promise<Array<JobPosting>>;
    getDonationInfo(): Promise<DonationInfo | null>;
    getNikahRegistration(id: bigint): Promise<NikahRegistration | null>;
    getOpenZakatProfiles(): Promise<Array<ZakatProfile>>;
    getPendingMasjidRegistrations(): Promise<Array<MasjidProfile>>;
    getPendingNikahRegistrations(): Promise<Array<NikahRegistration>>;
    getRegistrationSettings(): Promise<RegistrationSettings | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getZakatSettings(): Promise<ZakatSettings | null>;
    getZakatProfilesByMasjid(masjidId: bigint): Promise<Array<ZakatProfile>>;
    isCallerAdmin(): Promise<boolean>;
    isAdminAssigned(): Promise<boolean>;
    claimAdminIfUnassigned(): Promise<boolean>;
    resetAllRolesWithToken(token: string): Promise<void>;
    postJobPosting(job: JobPosting): Promise<bigint>;
    postMatrimonyProposal(proposal: MatrimonyProposal): Promise<bigint>;
    rejectMasjidRegistration(id: bigint): Promise<void>;
    rejectNikahRegistration(id: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setRegistrationSettings(upiId: string, feeAmount: bigint): Promise<void>;
    submitMasjidRegistration(profile: MasjidProfile): Promise<string>;
    submitNikahRegistration(registration: NikahRegistration): Promise<bigint>;
    updateDonationInfo(info: DonationInfo): Promise<void>;
    updateZakatSettings(settings: ZakatSettings): Promise<void>;
    adminUpdateMasjidProfile(id: bigint, profile: MasjidProfile): Promise<void>;
    adminDeleteMasjidRegistration(id: bigint): Promise<void>;
    adminDeleteNikahRegistration(id: bigint): Promise<void>;
    adminUpdateNikahRegistration(id: bigint, registration: NikahRegistration): Promise<void>;
    adminDeleteMatrimonyProposal(id: bigint): Promise<void>;
    adminUpdateMatrimonyProposal(id: bigint, proposal: MatrimonyProposal): Promise<void>;
    adminDeleteJobPosting(id: bigint): Promise<void>;
    adminUpdateJobPosting(id: bigint, job: JobPosting): Promise<void>;
    createZakatProfile(profile: ZakatProfile): Promise<bigint>;
    updateZakatProfile(id: bigint, profile: ZakatProfile): Promise<void>;
    deleteZakatProfile(id: bigint): Promise<void>;
    markZakatProfileFulfilled(id: bigint): Promise<void>;
    updateZakatCollectedAmount(id: bigint, amount: number): Promise<void>;
}

// --- Candid variant converters ---
function genderToCandid(v: Gender) {
    return v === Gender.female ? { female: null } : { male: null };
}
function genderFromCandid(v: any): Gender {
    return "female" in v ? Gender.female : Gender.male;
}
function nikahStatusToCandid(v: NikahStatus) {
    return v === NikahStatus.pending ? { pending: null } : v === NikahStatus.approved ? { approved: null } : { rejected: null };
}
function nikahStatusFromCandid(v: any): NikahStatus {
    return "pending" in v ? NikahStatus.pending : "approved" in v ? NikahStatus.approved : NikahStatus.rejected;
}
function masjidStatusToCandid(v: MasjidStatus) {
    return v === MasjidStatus.pending ? { pending: null } : v === MasjidStatus.approved ? { approved: null } : { rejected: null };
}
function masjidStatusFromCandid(v: any): MasjidStatus {
    return "pending" in v ? MasjidStatus.pending : "approved" in v ? MasjidStatus.approved : MasjidStatus.rejected;
}
function userRoleToCandid(v: UserRole) {
    return v === UserRole.admin ? { admin: null } : v === UserRole.user ? { user: null } : { guest: null };
}
function userRoleFromCandid(v: any): UserRole {
    return "admin" in v ? UserRole.admin : "user" in v ? UserRole.user : UserRole.guest;
}
function zakatStatusFromCandid(v: any): ZakatProfileStatus {
    return "open" in v ? ZakatProfileStatus.open : ZakatProfileStatus.fulfilled;
}

function nikahFromCandid(v: any): NikahRegistration {
    return {
        id: v.id,
        nikahUniqueId: v.nikahUniqueId || "",
        status: nikahStatusFromCandid(v.status),
        groomName: v.groomName || "",
        groomFatherName: v.groomFatherName || "",
        groomAddress: v.groomAddress || "",
        groomAadhaarHash: v.groomAadhaarHash || "",
        groomPhone: v.groomPhone || "",
        groomPhotoUrl: v.groomPhotoUrl || "",
        groomSignature: v.groomSignature || "",
        brideName: v.brideName || "",
        brideFatherName: v.brideFatherName || "",
        brideAddress: v.brideAddress || "",
        brideAadhaarHash: v.brideAadhaarHash || "",
        bridePhone: v.bridePhone || "",
        bridePhotoUrl: v.bridePhotoUrl || "",
        brideSignature: v.brideSignature || "",
        nikahDate: v.nikahDate || "",
        masjidVenue: v.masjidVenue || "",
        city: v.city || "",
        qaziName: v.qaziName || "",
        qaziContact: v.qaziContact || "",
        qaziSignature: v.qaziSignature || "",
        witness1: v.witness1 || "",
        witness1Contact: v.witness1Contact || "",
        witness1Signature: v.witness1Signature || "",
        witness2: v.witness2 || "",
        witness2Contact: v.witness2Contact || "",
        witness2Signature: v.witness2Signature || "",
        masjidSignature: v.masjidSignature || "",
        maher: v.maher || "",
        timestamp: v.timestamp,
        registeredBy: v.registeredBy,
    };
}
function nikahToCandid(v: NikahRegistration) {
    return {
        id: v.id,
        nikahUniqueId: v.nikahUniqueId || "",
        status: nikahStatusToCandid(v.status),
        groomName: v.groomName || "",
        groomFatherName: v.groomFatherName || "",
        groomAddress: v.groomAddress || "",
        groomAadhaarHash: v.groomAadhaarHash || "",
        groomPhone: v.groomPhone || "",
        groomPhotoUrl: v.groomPhotoUrl || "",
        groomSignature: v.groomSignature || "",
        brideName: v.brideName || "",
        brideFatherName: v.brideFatherName || "",
        brideAddress: v.brideAddress || "",
        brideAadhaarHash: v.brideAadhaarHash || "",
        bridePhone: v.bridePhone || "",
        bridePhotoUrl: v.bridePhotoUrl || "",
        brideSignature: v.brideSignature || "",
        nikahDate: v.nikahDate || "",
        masjidVenue: v.masjidVenue || "",
        city: v.city || "",
        qaziName: v.qaziName || "",
        qaziContact: v.qaziContact || "",
        qaziSignature: v.qaziSignature || "",
        witness1: v.witness1 || "",
        witness1Contact: v.witness1Contact || "",
        witness1Signature: v.witness1Signature || "",
        witness2: v.witness2 || "",
        witness2Contact: v.witness2Contact || "",
        witness2Signature: v.witness2Signature || "",
        masjidSignature: v.masjidSignature || "",
        maher: v.maher || "",
        timestamp: v.timestamp,
        registeredBy: v.registeredBy,
    };
}

function masjidFromCandid(v: any): MasjidProfile {
    return {
        id: v.id,
        status: masjidStatusFromCandid(v.status),
        city: v.city || "",
        contactPerson: v.contactPerson || "",
        registrationNumber: v.registrationNumber || "",
        email: v.email || "",
        masjidName: v.masjidName || "",
        state: v.state || "",
        address: v.address || "",
        timestamp: v.timestamp,
        facilities: v.facilities || [],
        phone: v.phone || "",
        capacity: v.capacity,
        registeredBy: v.registeredBy,
        upiId: v.upiId || "",
        presidentName: v.presidentName || "",
        presidentPhone: v.presidentPhone || "",
        secretaryName: v.secretaryName || "",
        secretaryPhone: v.secretaryPhone || "",
        treasurerName: v.treasurerName || "",
        treasurerPhone: v.treasurerPhone || "",
        utrNumber: v.utrNumber || "",
        masjidRegistrationId: v.masjidRegistrationId || "",
    };
}
function masjidToCandid(v: MasjidProfile) {
    return {
        id: v.id,
        status: masjidStatusToCandid(v.status),
        city: v.city || "",
        contactPerson: v.contactPerson || "",
        registrationNumber: v.registrationNumber || "",
        email: v.email || "",
        masjidName: v.masjidName || "",
        state: v.state || "",
        address: v.address || "",
        timestamp: v.timestamp,
        facilities: v.facilities || [],
        phone: v.phone || "",
        capacity: v.capacity,
        registeredBy: v.registeredBy,
        upiId: v.upiId || "",
        presidentName: v.presidentName || "",
        presidentPhone: v.presidentPhone || "",
        secretaryName: v.secretaryName || "",
        secretaryPhone: v.secretaryPhone || "",
        treasurerName: v.treasurerName || "",
        treasurerPhone: v.treasurerPhone || "",
        utrNumber: v.utrNumber || "",
        masjidRegistrationId: v.masjidRegistrationId || "",
    };
}
function matrimonyFromCandid(v: any): MatrimonyProposal {
    return { ...v, gender: genderFromCandid(v.gender) };
}
function matrimonyToCandid(v: MatrimonyProposal) {
    return { ...v, gender: genderToCandid(v.gender) };
}
function zakatFromCandid(v: any): ZakatProfile {
    return { ...v, status: zakatStatusFromCandid(v.status) };
}

export class Backend implements backendInterface {
    constructor(private actor: ActorSubclass<_SERVICE>){}

    async _initializeAccessControlWithSecret(arg0: string): Promise<void> {
        return this.actor._initializeAccessControlWithSecret(arg0);
    }
    async approveMasjidRegistration(id: bigint): Promise<void> {
        return this.actor.approveMasjidRegistration(id);
    }
    async approveNikahRegistration(id: bigint): Promise<void> {
        return this.actor.approveNikahRegistration(id);
    }
    async assignCallerUserRole(user: Principal, role: UserRole): Promise<void> {
        return this.actor.assignCallerUserRole(user, userRoleToCandid(role));
    }
    async generateCertificate(nikahId: bigint): Promise<Certificate> {
        const r = await this.actor.generateCertificate(nikahId);
        return { ...r, nikah: nikahFromCandid(r.nikah) };
    }
    async getAllJobPostings(): Promise<Array<JobPosting>> {
        return this.actor.getAllJobPostings();
    }
    async getAllMasjidRegistrations(): Promise<Array<MasjidProfile>> {
        const r = await this.actor.getAllMasjidRegistrations();
        return r.map(masjidFromCandid);
    }
    async getAllMatrimonyProposals(): Promise<Array<MatrimonyProposal>> {
        const r = await this.actor.getAllMatrimonyProposals();
        return r.map(matrimonyFromCandid);
    }
    async getAllNikahRegistrations(): Promise<Array<NikahRegistration>> {
        const r = await this.actor.getAllNikahRegistrations();
        return r.map(nikahFromCandid);
    }
    async getAllZakatProfiles(): Promise<Array<ZakatProfile>> {
        const r = await (this.actor as any).getAllZakatProfiles();
        return r.map(zakatFromCandid);
    }
    async getApprovedMasjids(): Promise<Array<MasjidProfile>> {
        const r = await this.actor.getApprovedMasjids();
        return r.map(masjidFromCandid);
    }
    async getCallerMasjidProfile(): Promise<MasjidProfile | null> {
        const r = await this.actor.getCallerMasjidProfile();
        return r.length === 0 ? null : masjidFromCandid(r[0]);
    }
    async getCallerUserProfile(): Promise<UserProfile | null> {
        const r = await this.actor.getCallerUserProfile();
        return r.length === 0 ? null : r[0];
    }
    async getCallerUserRole(): Promise<UserRole> {
        const r = await this.actor.getCallerUserRole();
        return userRoleFromCandid(r);
    }
    async getCallerNikahRegistrations(): Promise<Array<NikahRegistration>> {
        const r = await this.actor.getCallerNikahRegistrations();
        return r.map(nikahFromCandid);
    }
    async getCallerMatrimonyProposals(): Promise<Array<MatrimonyProposal>> {
        const r = await this.actor.getCallerMatrimonyProposals();
        return r.map(matrimonyFromCandid);
    }
    async getCallerJobPostings(): Promise<Array<JobPosting>> {
        return this.actor.getCallerJobPostings();
    }
    async getDonationInfo(): Promise<DonationInfo | null> {
        const r = await this.actor.getDonationInfo();
        return r.length === 0 ? null : r[0];
    }
    async getNikahRegistration(id: bigint): Promise<NikahRegistration | null> {
        const r = await this.actor.getNikahRegistration(id);
        return r.length === 0 ? null : nikahFromCandid(r[0]);
    }
    async getOpenZakatProfiles(): Promise<Array<ZakatProfile>> {
        const r = await (this.actor as any).getOpenZakatProfiles();
        return r.map(zakatFromCandid);
    }
    async getPendingMasjidRegistrations(): Promise<Array<MasjidProfile>> {
        const r = await this.actor.getPendingMasjidRegistrations();
        return r.map(masjidFromCandid);
    }
    async getPendingNikahRegistrations(): Promise<Array<NikahRegistration>> {
        const r = await this.actor.getPendingNikahRegistrations();
        return r.map(nikahFromCandid);
    }
    async getRegistrationSettings(): Promise<RegistrationSettings | null> {
        const r = await (this.actor as any).getRegistrationSettings();
        return r.length === 0 ? null : r[0];
    }
    async getUserProfile(user: Principal): Promise<UserProfile | null> {
        const r = await this.actor.getUserProfile(user);
        return r.length === 0 ? null : r[0];
    }
    async getZakatSettings(): Promise<ZakatSettings | null> {
        const r = await this.actor.getZakatSettings();
        return r.length === 0 ? null : r[0];
    }
    async getZakatProfilesByMasjid(masjidId: bigint): Promise<Array<ZakatProfile>> {
        const r = await (this.actor as any).getZakatProfilesByMasjid(masjidId);
        return r.map(zakatFromCandid);
    }
    async isCallerAdmin(): Promise<boolean> {
        return this.actor.isCallerAdmin();
    }
    async isAdminAssigned(): Promise<boolean> {
        return this.actor.isAdminAssigned();
    }
    async claimAdminIfUnassigned(): Promise<boolean> {
        return this.actor.claimAdminIfUnassigned();
    }
    async resetAllRolesWithToken(token: string): Promise<void> {
        return this.actor.resetAllRolesWithToken(token);
    }
    async postJobPosting(job: JobPosting): Promise<bigint> {
        return this.actor.postJobPosting(job);
    }
    async postMatrimonyProposal(proposal: MatrimonyProposal): Promise<bigint> {
        return this.actor.postMatrimonyProposal(matrimonyToCandid(proposal));
    }
    async rejectMasjidRegistration(id: bigint): Promise<void> {
        return this.actor.rejectMasjidRegistration(id);
    }
    async rejectNikahRegistration(id: bigint): Promise<void> {
        return this.actor.rejectNikahRegistration(id);
    }
    async saveCallerUserProfile(profile: UserProfile): Promise<void> {
        return this.actor.saveCallerUserProfile(profile);
    }
    async setRegistrationSettings(upiId: string, feeAmount: bigint): Promise<void> {
        return (this.actor as any).setRegistrationSettings(upiId, feeAmount);
    }
    async submitMasjidRegistration(profile: MasjidProfile): Promise<string> {
        return (this.actor as any).submitMasjidRegistration(masjidToCandid(profile));
    }
    async submitNikahRegistration(registration: NikahRegistration): Promise<bigint> {
        return this.actor.submitNikahRegistration(nikahToCandid(registration));
    }
    async updateDonationInfo(info: DonationInfo): Promise<void> {
        return this.actor.updateDonationInfo(info);
    }
    async updateZakatSettings(settings: ZakatSettings): Promise<void> {
        return this.actor.updateZakatSettings(settings);
    }
    async adminUpdateMasjidProfile(id: bigint, profile: MasjidProfile): Promise<void> {
        return (this.actor as any).adminUpdateMasjidProfile(id, masjidToCandid(profile));
    }
    async adminDeleteMasjidRegistration(id: bigint): Promise<void> {
        return this.actor.adminDeleteMasjidRegistration(id);
    }
    async adminDeleteNikahRegistration(id: bigint): Promise<void> {
        return this.actor.adminDeleteNikahRegistration(id);
    }
    async adminUpdateNikahRegistration(id: bigint, registration: NikahRegistration): Promise<void> {
        return (this.actor as any).adminUpdateNikahRegistration(id, nikahToCandid(registration));
    }
    async adminDeleteMatrimonyProposal(id: bigint): Promise<void> {
        return this.actor.adminDeleteMatrimonyProposal(id);
    }
    async adminUpdateMatrimonyProposal(id: bigint, proposal: MatrimonyProposal): Promise<void> {
        return (this.actor as any).adminUpdateMatrimonyProposal(id, matrimonyToCandid(proposal));
    }
    async adminDeleteJobPosting(id: bigint): Promise<void> {
        return this.actor.adminDeleteJobPosting(id);
    }
    async adminUpdateJobPosting(id: bigint, job: JobPosting): Promise<void> {
        return (this.actor as any).adminUpdateJobPosting(id, job);
    }
    async createZakatProfile(profile: ZakatProfile): Promise<bigint> {
        return (this.actor as any).createZakatProfile(profile);
    }
    async updateZakatProfile(id: bigint, profile: ZakatProfile): Promise<void> {
        return (this.actor as any).updateZakatProfile(id, profile);
    }
    async deleteZakatProfile(id: bigint): Promise<void> {
        return (this.actor as any).deleteZakatProfile(id);
    }
    async markZakatProfileFulfilled(id: bigint): Promise<void> {
        return (this.actor as any).markZakatProfileFulfilled(id);
    }
    async updateZakatCollectedAmount(id: bigint, amount: number): Promise<void> {
        return (this.actor as any).updateZakatCollectedAmount(id, amount);
    }
}

export interface CreateActorOptions {
    agent?: Agent;
    agentOptions?: HttpAgentOptions;
    actorOptions?: ActorConfig;
    processError?: (error: unknown) => never;
}
export function createActor(canisterId: string, _uploadFileOrOptions?: any, _downloadFile?: any, options?: CreateActorOptions): Backend {
    const resolvedOptions: CreateActorOptions = (typeof _uploadFileOrOptions === "object" && _uploadFileOrOptions !== null && ("agent" in _uploadFileOrOptions || "agentOptions" in _uploadFileOrOptions || "actorOptions" in _uploadFileOrOptions || "processError" in _uploadFileOrOptions)) ? _uploadFileOrOptions : (options || {});
    const agent = resolvedOptions.agent || HttpAgent.createSync({ ...resolvedOptions.agentOptions });
    if (resolvedOptions.agent && resolvedOptions.agentOptions) {
        console.warn("Detected both agent and agentOptions passed to createActor. Ignoring agentOptions.");
    }
    const actor = Actor.createActor<_SERVICE>(idlFactory, {
        agent,
        canisterId,
        ...resolvedOptions.actorOptions,
    });
    return new Backend(actor);
}

// ExternalBlob kept for config.ts compatibility (blob-storage not actively used in this project)
export class ExternalBlob {
    _blob?: Uint8Array<ArrayBuffer> | null;
    directURL: string;
    onProgress?: (percentage: number) => void = undefined;
    private constructor(directURL: string, blob: Uint8Array<ArrayBuffer> | null){
        if (blob) { this._blob = blob; }
        this.directURL = directURL;
    }
    static fromURL(url: string): ExternalBlob { return new ExternalBlob(url, null); }
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob {
        const url = URL.createObjectURL(new Blob([new Uint8Array(blob)], { type: 'application/octet-stream' }));
        return new ExternalBlob(url, blob);
    }
    public async getBytes(): Promise<Uint8Array<ArrayBuffer>> {
        if (this._blob) return this._blob;
        const response = await fetch(this.directURL);
        const blob = await response.blob();
        this._blob = new Uint8Array(await blob.arrayBuffer());
        return this._blob;
    }
    public getDirectURL(): string { return this.directURL; }
    public withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob {
        this.onProgress = onProgress;
        return this;
    }
}
