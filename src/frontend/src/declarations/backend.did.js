/* eslint-disable */

// @ts-nocheck

import { IDL } from '@icp-sdk/core/candid';

export const UserRole = IDL.Variant({
  'admin' : IDL.Null,
  'user' : IDL.Null,
  'guest' : IDL.Null,
});
export const NikahStatus = IDL.Variant({
  'pending' : IDL.Null,
  'approved' : IDL.Null,
  'rejected' : IDL.Null,
});
export const NikahRegistration = IDL.Record({
  'id' : IDL.Nat,
  'nikahUniqueId' : IDL.Text,
  'status' : NikahStatus,
  'groomName' : IDL.Text,
  'groomFatherName' : IDL.Text,
  'groomAddress' : IDL.Text,
  'groomAadhaarHash' : IDL.Text,
  'groomPhone' : IDL.Text,
  'groomPhotoUrl' : IDL.Text,
  'groomSignature' : IDL.Text,
  'brideName' : IDL.Text,
  'brideFatherName' : IDL.Text,
  'brideAddress' : IDL.Text,
  'brideAadhaarHash' : IDL.Text,
  'bridePhone' : IDL.Text,
  'bridePhotoUrl' : IDL.Text,
  'brideSignature' : IDL.Text,
  'nikahDate' : IDL.Text,
  'masjidVenue' : IDL.Text,
  'city' : IDL.Text,
  'qaziName' : IDL.Text,
  'qaziContact' : IDL.Text,
  'qaziSignature' : IDL.Text,
  'witness1' : IDL.Text,
  'witness1Contact' : IDL.Text,
  'witness1Signature' : IDL.Text,
  'witness2' : IDL.Text,
  'witness2Contact' : IDL.Text,
  'witness2Signature' : IDL.Text,
  'masjidSignature' : IDL.Text,
  'maher' : IDL.Text,
  'timestamp' : IDL.Int,
  'registeredBy' : IDL.Principal,
});
export const Certificate = IDL.Record({
  'issuedDate' : IDL.Int,
  'nikah' : NikahRegistration,
  'certificateNumber' : IDL.Text,
});
export const JobPosting = IDL.Record({
  'id' : IDL.Nat,
  'title' : IDL.Text,
  'postedBy' : IDL.Principal,
  'contact' : IDL.Text,
  'description' : IDL.Text,
  'company' : IDL.Text,
  'timestamp' : IDL.Int,
  'location' : IDL.Text,
});
export const MasjidStatus = IDL.Variant({
  'pending' : IDL.Null,
  'approved' : IDL.Null,
  'rejected' : IDL.Null,
});
export const MasjidProfile = IDL.Record({
  'id' : IDL.Nat,
  'status' : MasjidStatus,
  'city' : IDL.Text,
  'contactPerson' : IDL.Text,
  'registrationNumber' : IDL.Text,
  'email' : IDL.Text,
  'masjidName' : IDL.Text,
  'state' : IDL.Text,
  'address' : IDL.Text,
  'timestamp' : IDL.Int,
  'facilities' : IDL.Vec(IDL.Text),
  'phone' : IDL.Text,
  'capacity' : IDL.Nat,
  'registeredBy' : IDL.Principal,
  'upiId' : IDL.Text,
  'presidentName' : IDL.Text,
  'presidentPhone' : IDL.Text,
  'secretaryName' : IDL.Text,
  'secretaryPhone' : IDL.Text,
  'treasurerName' : IDL.Text,
  'treasurerPhone' : IDL.Text,
  'utrNumber' : IDL.Text,
  'masjidRegistrationId' : IDL.Text,
});
export const Gender = IDL.Variant({ 'female' : IDL.Null, 'male' : IDL.Null });
export const MatrimonyProposal = IDL.Record({
  'id' : IDL.Nat,
  'age' : IDL.Nat,
  'postedBy' : IDL.Principal,
  'contact' : IDL.Text,
  'city' : IDL.Text,
  'name' : IDL.Text,
  'education' : IDL.Text,
  'profession' : IDL.Text,
  'description' : IDL.Text,
  'gender' : Gender,
  'timestamp' : IDL.Int,
});
export const UserProfile = IDL.Record({
  'isMasjid' : IDL.Bool,
  'contact' : IDL.Text,
  'name' : IDL.Text,
});
export const DonationInfo = IDL.Record({
  'upiId' : IDL.Text,
  'qrCodeUrl' : IDL.Text,
});
export const RegistrationSettings = IDL.Record({
  'upiId' : IDL.Text,
  'feeAmount' : IDL.Nat,
});
export const ZakatSettings = IDL.Record({
  'nisabGoldGrams' : IDL.Float64,
  'silverRatePerGram' : IDL.Float64,
  'nisabSilverGrams' : IDL.Float64,
  'goldRatePerGram' : IDL.Float64,
});
export const ZakatProfileStatus = IDL.Variant({
  'open' : IDL.Null,
  'fulfilled' : IDL.Null,
});
export const ZakatProfile = IDL.Record({
  'id' : IDL.Nat,
  'masjidId' : IDL.Nat,
  'personName' : IDL.Text,
  'story' : IDL.Text,
  'requiredAmount' : IDL.Float64,
  'collectedAmount' : IDL.Float64,
  'upiId' : IDL.Text,
  'status' : ZakatProfileStatus,
  'createdBy' : IDL.Principal,
  'timestamp' : IDL.Int,
});

export const idlService = IDL.Service({
  '_initializeAccessControlWithSecret' : IDL.Func([IDL.Text], [], []),
  'approveMasjidRegistration' : IDL.Func([IDL.Nat], [], []),
  'approveNikahRegistration' : IDL.Func([IDL.Nat], [], []),
  'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
  'generateCertificate' : IDL.Func([IDL.Nat], [Certificate], []),
  'getAllJobPostings' : IDL.Func([], [IDL.Vec(JobPosting)], ['query']),
  'getAllMasjidRegistrations' : IDL.Func([], [IDL.Vec(MasjidProfile)], ['query']),
  'getAllMatrimonyProposals' : IDL.Func([], [IDL.Vec(MatrimonyProposal)], ['query']),
  'getAllNikahRegistrations' : IDL.Func([], [IDL.Vec(NikahRegistration)], ['query']),
  'getAllZakatProfiles' : IDL.Func([], [IDL.Vec(ZakatProfile)], ['query']),
  'getApprovedMasjids' : IDL.Func([], [IDL.Vec(MasjidProfile)], ['query']),
  'getCallerMasjidProfile' : IDL.Func([], [IDL.Opt(MasjidProfile)], ['query']),
  'getCallerUserProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
  'getCallerUserRole' : IDL.Func([], [UserRole], ['query']),
  'getCallerNikahRegistrations' : IDL.Func([], [IDL.Vec(NikahRegistration)], ['query']),
  'getCallerMatrimonyProposals' : IDL.Func([], [IDL.Vec(MatrimonyProposal)], ['query']),
  'getCallerJobPostings' : IDL.Func([], [IDL.Vec(JobPosting)], ['query']),
  'getDonationInfo' : IDL.Func([], [IDL.Opt(DonationInfo)], ['query']),
  'getNikahRegistration' : IDL.Func([IDL.Nat], [IDL.Opt(NikahRegistration)], ['query']),
  'getOpenZakatProfiles' : IDL.Func([], [IDL.Vec(ZakatProfile)], ['query']),
  'getPendingMasjidRegistrations' : IDL.Func([], [IDL.Vec(MasjidProfile)], ['query']),
  'getPendingNikahRegistrations' : IDL.Func([], [IDL.Vec(NikahRegistration)], ['query']),
  'getRegistrationSettings' : IDL.Func([], [IDL.Opt(RegistrationSettings)], ['query']),
  'getUserProfile' : IDL.Func([IDL.Principal], [IDL.Opt(UserProfile)], ['query']),
  'getZakatSettings' : IDL.Func([], [IDL.Opt(ZakatSettings)], ['query']),
  'getZakatProfilesByMasjid' : IDL.Func([IDL.Nat], [IDL.Vec(ZakatProfile)], ['query']),
  'isCallerAdmin' : IDL.Func([], [IDL.Bool], ['query']),
  'isAdminAssigned' : IDL.Func([], [IDL.Bool], ['query']),
  'claimAdminIfUnassigned' : IDL.Func([], [IDL.Bool], []),
  'resetAllRolesWithToken' : IDL.Func([IDL.Text], [], []),
  'postJobPosting' : IDL.Func([JobPosting], [IDL.Nat], []),
  'postMatrimonyProposal' : IDL.Func([MatrimonyProposal], [IDL.Nat], []),
  'rejectMasjidRegistration' : IDL.Func([IDL.Nat], [], []),
  'rejectNikahRegistration' : IDL.Func([IDL.Nat], [], []),
  'saveCallerUserProfile' : IDL.Func([UserProfile], [], []),
  'setRegistrationSettings' : IDL.Func([IDL.Text, IDL.Nat], [], []),
  'submitMasjidRegistration' : IDL.Func([MasjidProfile], [IDL.Text], []),
  'submitNikahRegistration' : IDL.Func([NikahRegistration], [IDL.Nat], []),
  'updateDonationInfo' : IDL.Func([DonationInfo], [], []),
  'updateZakatSettings' : IDL.Func([ZakatSettings], [], []),
  'adminUpdateMasjidProfile' : IDL.Func([IDL.Nat, MasjidProfile], [], []),
  'adminDeleteMasjidRegistration' : IDL.Func([IDL.Nat], [], []),
  'adminDeleteNikahRegistration' : IDL.Func([IDL.Nat], [], []),
  'adminUpdateNikahRegistration' : IDL.Func([IDL.Nat, NikahRegistration], [], []),
  'adminDeleteMatrimonyProposal' : IDL.Func([IDL.Nat], [], []),
  'adminUpdateMatrimonyProposal' : IDL.Func([IDL.Nat, MatrimonyProposal], [], []),
  'adminDeleteJobPosting' : IDL.Func([IDL.Nat], [], []),
  'adminUpdateJobPosting' : IDL.Func([IDL.Nat, JobPosting], [], []),
  'createZakatProfile' : IDL.Func([ZakatProfile], [IDL.Nat], []),
  'updateZakatProfile' : IDL.Func([IDL.Nat, ZakatProfile], [], []),
  'deleteZakatProfile' : IDL.Func([IDL.Nat], [], []),
  'markZakatProfileFulfilled' : IDL.Func([IDL.Nat], [], []),
  'updateZakatCollectedAmount' : IDL.Func([IDL.Nat, IDL.Float64], [], []),
});

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const UserRole = IDL.Variant({ 'admin' : IDL.Null, 'user' : IDL.Null, 'guest' : IDL.Null });
  const NikahStatus = IDL.Variant({ 'pending' : IDL.Null, 'approved' : IDL.Null, 'rejected' : IDL.Null });
  const NikahRegistration = IDL.Record({
    'id' : IDL.Nat,
    'nikahUniqueId' : IDL.Text,
    'status' : NikahStatus,
    'groomName' : IDL.Text,
    'groomFatherName' : IDL.Text,
    'groomAddress' : IDL.Text,
    'groomAadhaarHash' : IDL.Text,
    'groomPhone' : IDL.Text,
    'groomPhotoUrl' : IDL.Text,
    'groomSignature' : IDL.Text,
    'brideName' : IDL.Text,
    'brideFatherName' : IDL.Text,
    'brideAddress' : IDL.Text,
    'brideAadhaarHash' : IDL.Text,
    'bridePhone' : IDL.Text,
    'bridePhotoUrl' : IDL.Text,
    'brideSignature' : IDL.Text,
    'nikahDate' : IDL.Text,
    'masjidVenue' : IDL.Text,
    'city' : IDL.Text,
    'qaziName' : IDL.Text,
    'qaziContact' : IDL.Text,
    'qaziSignature' : IDL.Text,
    'witness1' : IDL.Text,
    'witness1Contact' : IDL.Text,
    'witness1Signature' : IDL.Text,
    'witness2' : IDL.Text,
    'witness2Contact' : IDL.Text,
    'witness2Signature' : IDL.Text,
    'masjidSignature' : IDL.Text,
    'maher' : IDL.Text,
    'timestamp' : IDL.Int,
    'registeredBy' : IDL.Principal,
  });
  const Certificate = IDL.Record({ 'issuedDate' : IDL.Int, 'nikah' : NikahRegistration, 'certificateNumber' : IDL.Text });
  const JobPosting = IDL.Record({
    'id' : IDL.Nat, 'title' : IDL.Text, 'postedBy' : IDL.Principal,
    'contact' : IDL.Text, 'description' : IDL.Text, 'company' : IDL.Text,
    'timestamp' : IDL.Int, 'location' : IDL.Text,
  });
  const MasjidStatus = IDL.Variant({ 'pending' : IDL.Null, 'approved' : IDL.Null, 'rejected' : IDL.Null });
  const MasjidProfile = IDL.Record({
    'id' : IDL.Nat, 'status' : MasjidStatus, 'city' : IDL.Text,
    'contactPerson' : IDL.Text, 'registrationNumber' : IDL.Text, 'email' : IDL.Text,
    'masjidName' : IDL.Text, 'state' : IDL.Text, 'address' : IDL.Text,
    'timestamp' : IDL.Int, 'facilities' : IDL.Vec(IDL.Text), 'phone' : IDL.Text,
    'capacity' : IDL.Nat, 'registeredBy' : IDL.Principal, 'upiId' : IDL.Text,
    'presidentName' : IDL.Text, 'presidentPhone' : IDL.Text,
    'secretaryName' : IDL.Text, 'secretaryPhone' : IDL.Text,
    'treasurerName' : IDL.Text, 'treasurerPhone' : IDL.Text,
    'utrNumber' : IDL.Text, 'masjidRegistrationId' : IDL.Text,
  });
  const Gender = IDL.Variant({ 'female' : IDL.Null, 'male' : IDL.Null });
  const MatrimonyProposal = IDL.Record({
    'id' : IDL.Nat, 'age' : IDL.Nat, 'postedBy' : IDL.Principal,
    'contact' : IDL.Text, 'city' : IDL.Text, 'name' : IDL.Text,
    'education' : IDL.Text, 'profession' : IDL.Text, 'description' : IDL.Text,
    'gender' : Gender, 'timestamp' : IDL.Int,
  });
  const UserProfile = IDL.Record({ 'isMasjid' : IDL.Bool, 'contact' : IDL.Text, 'name' : IDL.Text });
  const DonationInfo = IDL.Record({ 'upiId' : IDL.Text, 'qrCodeUrl' : IDL.Text });
  const RegistrationSettings = IDL.Record({ 'upiId' : IDL.Text, 'feeAmount' : IDL.Nat });
  const ZakatSettings = IDL.Record({
    'nisabGoldGrams' : IDL.Float64, 'silverRatePerGram' : IDL.Float64,
    'nisabSilverGrams' : IDL.Float64, 'goldRatePerGram' : IDL.Float64,
  });
  const ZakatProfileStatus = IDL.Variant({ 'open' : IDL.Null, 'fulfilled' : IDL.Null });
  const ZakatProfile = IDL.Record({
    'id' : IDL.Nat, 'masjidId' : IDL.Nat, 'personName' : IDL.Text,
    'story' : IDL.Text, 'requiredAmount' : IDL.Float64, 'collectedAmount' : IDL.Float64,
    'upiId' : IDL.Text, 'status' : ZakatProfileStatus, 'createdBy' : IDL.Principal,
    'timestamp' : IDL.Int,
  });
  return IDL.Service({
    '_initializeAccessControlWithSecret' : IDL.Func([IDL.Text], [], []),
    'approveMasjidRegistration' : IDL.Func([IDL.Nat], [], []),
    'approveNikahRegistration' : IDL.Func([IDL.Nat], [], []),
    'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
    'generateCertificate' : IDL.Func([IDL.Nat], [Certificate], []),
    'getAllJobPostings' : IDL.Func([], [IDL.Vec(JobPosting)], ['query']),
    'getAllMasjidRegistrations' : IDL.Func([], [IDL.Vec(MasjidProfile)], ['query']),
    'getAllMatrimonyProposals' : IDL.Func([], [IDL.Vec(MatrimonyProposal)], ['query']),
    'getAllNikahRegistrations' : IDL.Func([], [IDL.Vec(NikahRegistration)], ['query']),
    'getAllZakatProfiles' : IDL.Func([], [IDL.Vec(ZakatProfile)], ['query']),
    'getApprovedMasjids' : IDL.Func([], [IDL.Vec(MasjidProfile)], ['query']),
    'getCallerMasjidProfile' : IDL.Func([], [IDL.Opt(MasjidProfile)], ['query']),
    'getCallerUserProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    'getCallerUserRole' : IDL.Func([], [UserRole], ['query']),
    'getCallerNikahRegistrations' : IDL.Func([], [IDL.Vec(NikahRegistration)], ['query']),
    'getCallerMatrimonyProposals' : IDL.Func([], [IDL.Vec(MatrimonyProposal)], ['query']),
    'getCallerJobPostings' : IDL.Func([], [IDL.Vec(JobPosting)], ['query']),
    'getDonationInfo' : IDL.Func([], [IDL.Opt(DonationInfo)], ['query']),
    'getNikahRegistration' : IDL.Func([IDL.Nat], [IDL.Opt(NikahRegistration)], ['query']),
    'getOpenZakatProfiles' : IDL.Func([], [IDL.Vec(ZakatProfile)], ['query']),
    'getPendingMasjidRegistrations' : IDL.Func([], [IDL.Vec(MasjidProfile)], ['query']),
    'getPendingNikahRegistrations' : IDL.Func([], [IDL.Vec(NikahRegistration)], ['query']),
    'getRegistrationSettings' : IDL.Func([], [IDL.Opt(RegistrationSettings)], ['query']),
    'getUserProfile' : IDL.Func([IDL.Principal], [IDL.Opt(UserProfile)], ['query']),
    'getZakatSettings' : IDL.Func([], [IDL.Opt(ZakatSettings)], ['query']),
    'getZakatProfilesByMasjid' : IDL.Func([IDL.Nat], [IDL.Vec(ZakatProfile)], ['query']),
    'isCallerAdmin' : IDL.Func([], [IDL.Bool], ['query']),
    'isAdminAssigned' : IDL.Func([], [IDL.Bool], ['query']),
    'claimAdminIfUnassigned' : IDL.Func([], [IDL.Bool], []),
    'resetAllRolesWithToken' : IDL.Func([IDL.Text], [], []),
    'postJobPosting' : IDL.Func([JobPosting], [IDL.Nat], []),
    'postMatrimonyProposal' : IDL.Func([MatrimonyProposal], [IDL.Nat], []),
    'rejectMasjidRegistration' : IDL.Func([IDL.Nat], [], []),
    'rejectNikahRegistration' : IDL.Func([IDL.Nat], [], []),
    'saveCallerUserProfile' : IDL.Func([UserProfile], [], []),
    'setRegistrationSettings' : IDL.Func([IDL.Text, IDL.Nat], [], []),
    'submitMasjidRegistration' : IDL.Func([MasjidProfile], [IDL.Text], []),
    'submitNikahRegistration' : IDL.Func([NikahRegistration], [IDL.Nat], []),
    'updateDonationInfo' : IDL.Func([DonationInfo], [], []),
    'updateZakatSettings' : IDL.Func([ZakatSettings], [], []),
    'adminUpdateMasjidProfile' : IDL.Func([IDL.Nat, MasjidProfile], [], []),
    'adminDeleteMasjidRegistration' : IDL.Func([IDL.Nat], [], []),
    'adminDeleteNikahRegistration' : IDL.Func([IDL.Nat], [], []),
    'adminUpdateNikahRegistration' : IDL.Func([IDL.Nat, NikahRegistration], [], []),
    'adminDeleteMatrimonyProposal' : IDL.Func([IDL.Nat], [], []),
    'adminUpdateMatrimonyProposal' : IDL.Func([IDL.Nat, MatrimonyProposal], [], []),
    'adminDeleteJobPosting' : IDL.Func([IDL.Nat], [], []),
    'adminUpdateJobPosting' : IDL.Func([IDL.Nat, JobPosting], [], []),
    'createZakatProfile' : IDL.Func([ZakatProfile], [IDL.Nat], []),
    'updateZakatProfile' : IDL.Func([IDL.Nat, ZakatProfile], [], []),
    'deleteZakatProfile' : IDL.Func([IDL.Nat], [], []),
    'markZakatProfileFulfilled' : IDL.Func([IDL.Nat], [], []),
    'updateZakatCollectedAmount' : IDL.Func([IDL.Nat, IDL.Float64], [], []),
  });
};

export const init = ({ IDL }) => { return []; };
