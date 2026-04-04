/* eslint-disable */

// @ts-nocheck

import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

export interface Certificate {
  'issuedDate' : bigint,
  'nikah' : NikahRegistration,
  'certificateNumber' : string,
}
export interface DonationInfo { 'upiId' : string, 'qrCodeUrl' : string }
export interface RegistrationSettings { 'upiId' : string, 'feeAmount' : bigint }
export type Gender = { 'female' : null } |
  { 'male' : null };
export interface JobPosting {
  'id' : bigint,
  'title' : string,
  'postedBy' : Principal,
  'contact' : string,
  'description' : string,
  'company' : string,
  'timestamp' : bigint,
  'location' : string,
}
export interface MasjidProfile {
  'id' : bigint,
  'status' : MasjidStatus,
  'city' : string,
  'contactPerson' : string,
  'registrationNumber' : string,
  'email' : string,
  'masjidName' : string,
  'state' : string,
  'address' : string,
  'timestamp' : bigint,
  'facilities' : Array<string>,
  'phone' : string,
  'capacity' : bigint,
  'registeredBy' : Principal,
  'upiId' : string,
  'presidentName' : string,
  'presidentPhone' : string,
  'secretaryName' : string,
  'secretaryPhone' : string,
  'treasurerName' : string,
  'treasurerPhone' : string,
  'utrNumber' : string,
  'masjidRegistrationId' : string,
}
export type MasjidStatus = { 'pending' : null } |
  { 'approved' : null } |
  { 'rejected' : null };
export interface MatrimonyProposal {
  'id' : bigint,
  'age' : bigint,
  'postedBy' : Principal,
  'contact' : string,
  'city' : string,
  'name' : string,
  'education' : string,
  'profession' : string,
  'description' : string,
  'gender' : Gender,
  'timestamp' : bigint,
}
export interface NikahRegistration {
  'id' : bigint,
  'nikahUniqueId' : string,
  'status' : NikahStatus,
  'groomName' : string,
  'groomFatherName' : string,
  'groomAddress' : string,
  'groomAadhaarHash' : string,
  'groomPhone' : string,
  'groomPhotoUrl' : string,
  'groomSignature' : string,
  'brideName' : string,
  'brideFatherName' : string,
  'brideAddress' : string,
  'brideAadhaarHash' : string,
  'bridePhone' : string,
  'bridePhotoUrl' : string,
  'brideSignature' : string,
  'nikahDate' : string,
  'masjidVenue' : string,
  'city' : string,
  'qaziName' : string,
  'qaziContact' : string,
  'qaziSignature' : string,
  'witness1' : string,
  'witness1Contact' : string,
  'witness1Signature' : string,
  'witness2' : string,
  'witness2Contact' : string,
  'witness2Signature' : string,
  'masjidSignature' : string,
  'maher' : string,
  'timestamp' : bigint,
  'registeredBy' : Principal,
}
export type NikahStatus = { 'pending' : null } |
  { 'approved' : null } |
  { 'rejected' : null };
export interface UserProfile {
  'isMasjid' : boolean,
  'contact' : string,
  'name' : string,
}
export type UserRole = { 'admin' : null } |
  { 'user' : null } |
  { 'guest' : null };
export interface ZakatSettings {
  'nisabGoldGrams' : number,
  'silverRatePerGram' : number,
  'nisabSilverGrams' : number,
  'goldRatePerGram' : number,
}
export interface ZakatProfile {
  'id' : bigint,
  'masjidId' : bigint,
  'personName' : string,
  'story' : string,
  'requiredAmount' : number,
  'collectedAmount' : number,
  'upiId' : string,
  'status' : ZakatProfileStatus,
  'createdBy' : Principal,
  'timestamp' : bigint,
}
export type ZakatProfileStatus = { 'open' : null } | { 'fulfilled' : null };
export interface _SERVICE {
  '_initializeAccessControlWithSecret' : ActorMethod<[string], undefined>,
  'approveMasjidRegistration' : ActorMethod<[bigint], undefined>,
  'approveNikahRegistration' : ActorMethod<[bigint], undefined>,
  'assignCallerUserRole' : ActorMethod<[Principal, UserRole], undefined>,
  'generateCertificate' : ActorMethod<[bigint], Certificate>,
  'getAllJobPostings' : ActorMethod<[], Array<JobPosting>>,
  'getAllMasjidRegistrations' : ActorMethod<[], Array<MasjidProfile>>,
  'getAllMatrimonyProposals' : ActorMethod<[], Array<MatrimonyProposal>>,
  'getAllNikahRegistrations' : ActorMethod<[], Array<NikahRegistration>>,
  'getAllZakatProfiles' : ActorMethod<[], Array<ZakatProfile>>,
  'getApprovedMasjids' : ActorMethod<[], Array<MasjidProfile>>,
  'getCallerMasjidProfile' : ActorMethod<[], [] | [MasjidProfile]>,
  'getCallerUserProfile' : ActorMethod<[], [] | [UserProfile]>,
  'getCallerUserRole' : ActorMethod<[], UserRole>,
  'getCallerNikahRegistrations' : ActorMethod<[], Array<NikahRegistration>>,
  'getCallerMatrimonyProposals' : ActorMethod<[], Array<MatrimonyProposal>>,
  'getCallerJobPostings' : ActorMethod<[], Array<JobPosting>>,
  'getDonationInfo' : ActorMethod<[], [] | [DonationInfo]>,
  'getNikahRegistration' : ActorMethod<[bigint], [] | [NikahRegistration]>,
  'getOpenZakatProfiles' : ActorMethod<[], Array<ZakatProfile>>,
  'getPendingMasjidRegistrations' : ActorMethod<[], Array<MasjidProfile>>,
  'getPendingNikahRegistrations' : ActorMethod<[], Array<NikahRegistration>>,
  'getRegistrationSettings' : ActorMethod<[], [] | [RegistrationSettings]>,
  'getUserProfile' : ActorMethod<[Principal], [] | [UserProfile]>,
  'getZakatSettings' : ActorMethod<[], [] | [ZakatSettings]>,
  'getZakatProfilesByMasjid' : ActorMethod<[bigint], Array<ZakatProfile>>,
  'isCallerAdmin' : ActorMethod<[], boolean>,
  'isAdminAssigned' : ActorMethod<[], boolean>,
  'claimAdminIfUnassigned' : ActorMethod<[], boolean>,
  'resetAllRolesWithToken' : ActorMethod<[string], undefined>,
  'postJobPosting' : ActorMethod<[JobPosting], bigint>,
  'postMatrimonyProposal' : ActorMethod<[MatrimonyProposal], bigint>,
  'rejectMasjidRegistration' : ActorMethod<[bigint], undefined>,
  'rejectNikahRegistration' : ActorMethod<[bigint], undefined>,
  'saveCallerUserProfile' : ActorMethod<[UserProfile], undefined>,
  'setRegistrationSettings' : ActorMethod<[string, bigint], undefined>,
  'submitMasjidRegistration' : ActorMethod<[MasjidProfile], string>,
  'submitNikahRegistration' : ActorMethod<[NikahRegistration], bigint>,
  'updateDonationInfo' : ActorMethod<[DonationInfo], undefined>,
  'updateZakatSettings' : ActorMethod<[ZakatSettings], undefined>,
  'adminUpdateMasjidProfile' : ActorMethod<[bigint, MasjidProfile], undefined>,
  'adminDeleteMasjidRegistration' : ActorMethod<[bigint], undefined>,
  'adminDeleteNikahRegistration' : ActorMethod<[bigint], undefined>,
  'adminUpdateNikahRegistration' : ActorMethod<[bigint, NikahRegistration], undefined>,
  'adminDeleteMatrimonyProposal' : ActorMethod<[bigint], undefined>,
  'adminUpdateMatrimonyProposal' : ActorMethod<[bigint, MatrimonyProposal], undefined>,
  'adminDeleteJobPosting' : ActorMethod<[bigint], undefined>,
  'adminUpdateJobPosting' : ActorMethod<[bigint, JobPosting], undefined>,
  'createZakatProfile' : ActorMethod<[ZakatProfile], bigint>,
  'updateZakatProfile' : ActorMethod<[bigint, ZakatProfile], undefined>,
  'deleteZakatProfile' : ActorMethod<[bigint], undefined>,
  'markZakatProfileFulfilled' : ActorMethod<[bigint], undefined>,
  'updateZakatCollectedAmount' : ActorMethod<[bigint, number], undefined>,
}
export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
