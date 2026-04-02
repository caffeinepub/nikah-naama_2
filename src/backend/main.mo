import Array "mo:core/Array";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Int "mo:core/Int";



actor {
  module TextTuple {
    public func compare(first : (Text, Text), second : (Text, Text)) : Order.Order {
      switch (Text.compare(first.0, second.0)) {
        case (#less) { #less };
        case (#greater) { #greater };
        case (#equal) { Text.compare(first.1, second.1) };
      };
    };
  };

  type Gender = { #male; #female };
  type MasjidStatus = { #pending; #approved; #rejected };
  type NikahStatus = { #pending; #approved; #rejected };
  type ZakatProfileStatus = { #open; #fulfilled };

  // OLD NikahRegistration type kept for stable upgrade compatibility
  type OldNikahRegistration = {
    id : Nat; brideName : Text; groomName : Text;
    brideAadhaarHash : Text; groomAadhaarHash : Text;
    nikahDate : Text; masjidVenue : Text; qaziName : Text;
    witness1 : Text; witness2 : Text; city : Text;
    status : NikahStatus; registeredBy : Principal; timestamp : Int;
  };

  // NEW expanded NikahRegistration type
  type NikahRegistration = {
    id : Nat;
    nikahUniqueId : Text;
    // Groom
    groomName : Text;
    groomFatherName : Text;
    groomAddress : Text;
    groomAadhaarHash : Text;
    groomPhone : Text;
    groomPhotoUrl : Text;
    groomSignature : Text;
    // Bride
    brideName : Text;
    brideFatherName : Text;
    brideAddress : Text;
    brideAadhaarHash : Text;
    bridePhone : Text;
    bridePhotoUrl : Text;
    brideSignature : Text;
    // Ceremony
    nikahDate : Text;
    masjidVenue : Text;
    city : Text;
    qaziName : Text;
    qaziContact : Text;
    qaziSignature : Text;
    // Witnesses
    witness1 : Text;
    witness1Contact : Text;
    witness1Signature : Text;
    witness2 : Text;
    witness2Contact : Text;
    witness2Signature : Text;
    // Masjid authority
    masjidSignature : Text;
    // Maher
    maher : Text;
    // Meta
    status : NikahStatus;
    registeredBy : Principal;
    timestamp : Int;
  };

  module NikahRegistration {
    public func compare(a : NikahRegistration, b : NikahRegistration) : Order.Order {
      switch (Text.compare(a.brideName, b.brideName)) {
        case (#equal) { Text.compare(a.groomName, b.groomName) };
        case (o) { o };
      };
    };
  };

  type MatrimonyProposal = {
    id : Nat; name : Text; age : Nat; city : Text; education : Text;
    profession : Text; contact : Text; gender : Gender;
    description : Text; postedBy : Principal; timestamp : Int;
  };

  type JobPosting = {
    id : Nat; title : Text; company : Text; location : Text;
    description : Text; contact : Text; postedBy : Principal; timestamp : Int;
  };

  type DonationInfo = { upiId : Text; qrCodeUrl : Text };

  type Certificate = {
    certificateNumber : Text; nikah : NikahRegistration; issuedDate : Int;
  };

  type UserProfile = { name : Text; contact : Text; isMasjid : Bool };

  module UserProfile {
    public func compare(a : UserProfile, b : UserProfile) : Order.Order {
      Text.compare(a.name, b.name);
    };
  };

  // OLD MasjidProfile type (without upiId) - kept for stable variable migration compatibility
  type OldMasjidProfile = {
    id : Nat; masjidName : Text; address : Text; city : Text; state : Text;
    contactPerson : Text; phone : Text; email : Text;
    registrationNumber : Text; capacity : Nat; facilities : [Text];
    status : MasjidStatus; registeredBy : Principal; timestamp : Int;
  };

  // V2 MasjidProfile type (with upiId but no committee) - kept for migration
  type MasjidProfileV2 = {
    id : Nat; masjidName : Text; address : Text; city : Text; state : Text;
    contactPerson : Text; phone : Text; email : Text;
    registrationNumber : Text; capacity : Nat; facilities : [Text];
    upiId : Text; status : MasjidStatus; registeredBy : Principal; timestamp : Int;
  };

  // NEW MasjidProfile type (with committee details and UTR)
  type MasjidProfile = {
    id : Nat; masjidName : Text; address : Text; city : Text; state : Text;
    contactPerson : Text; phone : Text; email : Text;
    registrationNumber : Text; capacity : Nat; facilities : [Text];
    upiId : Text;
    // Committee details
    presidentName : Text; presidentPhone : Text;
    secretaryName : Text; secretaryPhone : Text;
    treasurerName : Text; treasurerPhone : Text;
    // Payment
    utrNumber : Text;
    masjidRegistrationId : Text;
    status : MasjidStatus; registeredBy : Principal; timestamp : Int;
  };

  type ZakatProfile = {
    id : Nat; masjidId : Nat; personName : Text; story : Text;
    requiredAmount : Float; collectedAmount : Float; upiId : Text;
    status : ZakatProfileStatus; createdBy : Principal; timestamp : Int;
  };

  type ZakatSettings = {
    nisabGoldGrams : Float; nisabSilverGrams : Float;
    goldRatePerGram : Float; silverRatePerGram : Float;
  };

  // Registration settings (UPI for registration payment + fee)
  type RegistrationSettings = {
    upiId : Text;
    feeAmount : Nat;
  };

  // --- Stable state ---
  let matchEntries = Map.empty<(Text, Text), Nat>();
  // Old nikah map - kept for upgrade compat, new registrations go to nikahRegistrationsV2
  let nikahRegistrations = Map.empty<Nat, OldNikahRegistration>();
  let nikahRegistrationsV2 = Map.empty<Nat, NikahRegistration>();
  let matrimonyProposals = Map.empty<Nat, MatrimonyProposal>();
  let jobPostings = Map.empty<Nat, JobPosting>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // OLD stable var kept for upgrade compatibility (no upiId)
  let masjidProfiles = Map.empty<Nat, OldMasjidProfile>();
  // V2 stable var with upiId (no committee) - kept for migration
  let masjidProfilesV2 = Map.empty<Nat, MasjidProfileV2>();
  // V3 stable var with committee + UTR
  let masjidProfilesV3 = Map.empty<Nat, MasjidProfile>();
  let zakatProfiles = Map.empty<Nat, ZakatProfile>();

  // donationInfo kept for upgrade compatibility
  stable var donationInfo : ?DonationInfo = null;
  stable var zakatSettings : ?ZakatSettings = null;

  // Registration settings
  stable var registrationSettings : ?RegistrationSettings = null;

  stable var nextNikahId = 1;
  stable var nextProposalId = 1;
  stable var nextJobId = 1;
  stable var nextMasjidId = 1;
  stable var nextCertificateNumber = 1;
  stable var nextZakatProfileId = 1;
  stable var masjidMigrated = false;
  stable var masjidMigratedV3 = false;
  stable var nikahMigrated = false;

  // --- Stable Authorization State ---
  stable var stableAdminAssigned : Bool = false;
  stable var stableUserRoles : [(Principal, AccessControl.UserRole)] = [];

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Helper: get current year from nanoseconds
  func currentYear() : Text {
    let nowSeconds = Time.now() / 1_000_000_000;
    // Approximate: seconds since epoch / seconds per year
    let yearsSinceEpoch = nowSeconds / 31_557_600;
    let year = 1970 + yearsSinceEpoch;
    year.toText();
  };

  // Helper: zero-pad Nat to 4 digits
  func padId(n : Nat) : Text {
    let s = n.toText();
    if (s.size() >= 4) { s }
    else if (s.size() == 3) { "0" # s }
    else if (s.size() == 2) { "00" # s }
    else { "000" # s };
  };

  // Save auth state before upgrade
  system func preupgrade() {
    stableAdminAssigned := accessControlState.adminAssigned;
    stableUserRoles := accessControlState.userRoles.entries().toArray();
  };

  // Restore auth state and run migrations after upgrade
  system func postupgrade() {
    // Restore authorization state so admins survive deployments
    accessControlState.adminAssigned := stableAdminAssigned;
    for ((p, r) in stableUserRoles.vals()) {
      accessControlState.userRoles.add(p, r);
    };

    // One-time migration from old masjid map (no upiId) to V2 map (with upiId)
    if (not masjidMigrated) {
      for ((id, old) in masjidProfiles.entries()) {
        masjidProfilesV2.add(id, {
          id = old.id; masjidName = old.masjidName; address = old.address;
          city = old.city; state = old.state; contactPerson = old.contactPerson;
          phone = old.phone; email = old.email;
          registrationNumber = old.registrationNumber; capacity = old.capacity;
          facilities = old.facilities; upiId = "";
          status = old.status; registeredBy = old.registeredBy; timestamp = old.timestamp;
        });
      };
      masjidMigrated := true;
    };

    // One-time migration from V2 (no committee) to V3 (with committee + UTR)
    if (not masjidMigratedV3) {
      for ((id, old) in masjidProfilesV2.entries()) {
        masjidProfilesV3.add(id, {
          id = old.id; masjidName = old.masjidName; address = old.address;
          city = old.city; state = old.state; contactPerson = old.contactPerson;
          phone = old.phone; email = old.email;
          registrationNumber = old.registrationNumber; capacity = old.capacity;
          facilities = old.facilities; upiId = old.upiId;
          presidentName = ""; presidentPhone = "";
          secretaryName = ""; secretaryPhone = "";
          treasurerName = ""; treasurerPhone = "";
          utrNumber = ""; masjidRegistrationId = "";
          status = old.status; registeredBy = old.registeredBy; timestamp = old.timestamp;
        });
      };
      masjidMigratedV3 := true;
    };

    // One-time migration from old nikah map to new V2 map
    if (not nikahMigrated) {
      for ((id, old) in nikahRegistrations.entries()) {
        nikahRegistrationsV2.add(id, {
          id = old.id;
          nikahUniqueId = "NIKAH-" # currentYear() # "-" # padId(old.id);
          groomName = old.groomName;
          groomFatherName = "";
          groomAddress = "";
          groomAadhaarHash = old.groomAadhaarHash;
          groomPhone = "";
          groomPhotoUrl = "";
          groomSignature = "";
          brideName = old.brideName;
          brideFatherName = "";
          brideAddress = "";
          brideAadhaarHash = old.brideAadhaarHash;
          bridePhone = "";
          bridePhotoUrl = "";
          brideSignature = "";
          nikahDate = old.nikahDate;
          masjidVenue = old.masjidVenue;
          city = old.city;
          qaziName = old.qaziName;
          qaziContact = "";
          qaziSignature = "";
          witness1 = old.witness1;
          witness1Contact = "";
          witness1Signature = "";
          witness2 = old.witness2;
          witness2Contact = "";
          witness2Signature = "";
          masjidSignature = "";
          maher = "";
          status = old.status;
          registeredBy = old.registeredBy;
          timestamp = old.timestamp;
        });
        matchEntries.add((old.brideAadhaarHash, old.groomAadhaarHash), id);
      };
      nikahMigrated := true;
    };
  };

  func isMasjidOfficial(principal : Principal) : Bool {
    switch (userProfiles.get(principal)) {
      case (null) { false };
      case (?p) { p.isMasjid };
    };
  };

  // --- Reset All Roles (protected by hardcoded reset secret) ---
  public shared func resetAllRolesWithToken(token : Text) : async () {
    if (token != "NIKAHNAAMA_RESET_2026") {
      Runtime.trap("Invalid reset token");
    };
    for (p in accessControlState.userRoles.keys().toArray().vals()) {
      accessControlState.userRoles.remove(p);
    };
    accessControlState.adminAssigned := false;
    stableAdminAssigned := false;
    stableUserRoles := [];
  };

  public shared ({ caller }) func claimAdminIfUnassigned() : async Bool {
    if (caller.isAnonymous()) { return false };
    if (not accessControlState.adminAssigned) {
      accessControlState.userRoles.remove(caller);
      accessControlState.userRoles.add(caller, #admin);
      accessControlState.adminAssigned := true;
      stableAdminAssigned := true;
      stableUserRoles := accessControlState.userRoles.entries().toArray();
      return true;
    };
    return false;
  };

  public query func isAdminAssigned() : async Bool {
    accessControlState.adminAssigned;
  };

  // --- Registration Settings ---
  public shared ({ caller }) func setRegistrationSettings(upiId : Text, feeAmount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) Runtime.trap("Unauthorized");
    registrationSettings := ?{ upiId; feeAmount };
  };

  public query func getRegistrationSettings() : async ?RegistrationSettings {
    registrationSettings;
  };

  // --- Nikah Registration ---
  public shared ({ caller }) func submitNikahRegistration(reg : NikahRegistration) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (matchEntries.containsKey((reg.brideAadhaarHash, reg.groomAadhaarHash))) {
      Runtime.trap("Duplicate registration detected");
    };
    let id = nextNikahId;
    nextNikahId += 1;
    let uniqueId = "NIKAH-" # currentYear() # "-" # padId(id);
    nikahRegistrationsV2.add(id, {
      id;
      nikahUniqueId = uniqueId;
      groomName = reg.groomName;
      groomFatherName = reg.groomFatherName;
      groomAddress = reg.groomAddress;
      groomAadhaarHash = reg.groomAadhaarHash;
      groomPhone = reg.groomPhone;
      groomPhotoUrl = reg.groomPhotoUrl;
      groomSignature = reg.groomSignature;
      brideName = reg.brideName;
      brideFatherName = reg.brideFatherName;
      brideAddress = reg.brideAddress;
      brideAadhaarHash = reg.brideAadhaarHash;
      bridePhone = reg.bridePhone;
      bridePhotoUrl = reg.bridePhotoUrl;
      brideSignature = reg.brideSignature;
      nikahDate = reg.nikahDate;
      masjidVenue = reg.masjidVenue;
      city = reg.city;
      qaziName = reg.qaziName;
      qaziContact = reg.qaziContact;
      qaziSignature = reg.qaziSignature;
      witness1 = reg.witness1;
      witness1Contact = reg.witness1Contact;
      witness1Signature = reg.witness1Signature;
      witness2 = reg.witness2;
      witness2Contact = reg.witness2Contact;
      witness2Signature = reg.witness2Signature;
      masjidSignature = reg.masjidSignature;
      maher = reg.maher;
      status = #pending;
      registeredBy = caller;
      timestamp = Time.now();
    });
    matchEntries.add((reg.brideAadhaarHash, reg.groomAadhaarHash), id);
    id;
  };

  public query ({ caller }) func getNikahRegistration(id : Nat) : async ?NikahRegistration {
    switch (nikahRegistrationsV2.get(id)) {
      case (null) { null };
      case (?r) {
        if (AccessControl.isAdmin(accessControlState, caller) or isMasjidOfficial(caller) or r.registeredBy == caller) {
          ?r;
        } else { Runtime.trap("Unauthorized") };
      };
    };
  };

  // Admin gets all; use getCallerNikahRegistrations for masjid-scoped view
  public query ({ caller }) func getAllNikahRegistrations() : async [NikahRegistration] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized");
    };
    nikahRegistrationsV2.values().toArray().sort();
  };

  // Masjid panel: returns only registrations submitted by the calling principal
  public query ({ caller }) func getCallerNikahRegistrations() : async [NikahRegistration] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) Runtime.trap("Unauthorized");
    nikahRegistrationsV2.values().toArray().filter(func(r) { r.registeredBy == caller });
  };

  public query ({ caller }) func getPendingNikahRegistrations() : async [NikahRegistration] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    nikahRegistrationsV2.values().toArray().filter(func(r) { r.status == #pending }).sort();
  };

  public shared ({ caller }) func approveNikahRegistration(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) Runtime.trap("Unauthorized");
    switch (nikahRegistrationsV2.get(id)) {
      case (null) { Runtime.trap("Not found") };
      case (?r) { nikahRegistrationsV2.add(id, { r with status = #approved }) };
    };
  };

  public shared ({ caller }) func rejectNikahRegistration(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) Runtime.trap("Unauthorized");
    switch (nikahRegistrationsV2.get(id)) {
      case (null) { Runtime.trap("Not found") };
      case (?r) { nikahRegistrationsV2.add(id, { r with status = #rejected }) };
    };
  };

  // --- Matrimony ---
  public shared ({ caller }) func postMatrimonyProposal(p : MatrimonyProposal) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) Runtime.trap("Unauthorized");
    let id = nextProposalId;
    nextProposalId += 1;
    matrimonyProposals.add(id, {
      id; name = p.name; age = p.age; city = p.city; education = p.education;
      profession = p.profession; contact = p.contact; gender = p.gender;
      description = p.description; postedBy = caller; timestamp = Time.now();
    });
    id;
  };

  public query func getAllMatrimonyProposals() : async [MatrimonyProposal] {
    matrimonyProposals.values().toArray();
  };

  // Masjid-scoped: only proposals posted by the calling principal
  public query ({ caller }) func getCallerMatrimonyProposals() : async [MatrimonyProposal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) Runtime.trap("Unauthorized");
    matrimonyProposals.values().toArray().filter(func(p) { p.postedBy == caller });
  };

  // --- Jobs ---
  public shared ({ caller }) func postJobPosting(job : JobPosting) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) Runtime.trap("Unauthorized");
    let id = nextJobId;
    nextJobId += 1;
    jobPostings.add(id, {
      id; title = job.title; company = job.company; location = job.location;
      description = job.description; contact = job.contact;
      postedBy = caller; timestamp = Time.now();
    });
    id;
  };

  public query func getAllJobPostings() : async [JobPosting] {
    jobPostings.values().toArray();
  };

  // Masjid-scoped: only job postings by the calling principal
  public query ({ caller }) func getCallerJobPostings() : async [JobPosting] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) Runtime.trap("Unauthorized");
    jobPostings.values().toArray().filter(func(j) { j.postedBy == caller });
  };

  // --- Certificate ---
  public shared ({ caller }) func generateCertificate(nikahId : Nat) : async Certificate {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) Runtime.trap("Unauthorized");
    switch (nikahRegistrationsV2.get(nikahId)) {
      case (null) { Runtime.trap("Not found") };
      case (?r) {
        if (r.status != #approved) Runtime.trap("Only approved registrations can have certificates");
        if (not (AccessControl.isAdmin(accessControlState, caller) or r.registeredBy == caller)) Runtime.trap("Unauthorized");
        let cn = "CERT-" # nextCertificateNumber.toText();
        nextCertificateNumber += 1;
        { certificateNumber = cn; nikah = r; issuedDate = Time.now() };
      };
    };
  };

  // --- User Profiles ---
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) Runtime.trap("Unauthorized");
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    userProfiles.get(user);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  // --- Masjid Registration (using V3 map) ---
  public shared ({ caller }) func submitMasjidRegistration(profile : MasjidProfile) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) Runtime.trap("Unauthorized");
    let id = nextMasjidId;
    nextMasjidId += 1;
    let regId = "MASJID-" # currentYear() # "-" # padId(id);
    masjidProfilesV3.add(id, {
      id; masjidName = profile.masjidName; address = profile.address;
      city = profile.city; state = profile.state; contactPerson = profile.contactPerson;
      phone = profile.phone; email = profile.email;
      registrationNumber = profile.registrationNumber; capacity = profile.capacity;
      facilities = profile.facilities; upiId = profile.upiId;
      presidentName = profile.presidentName; presidentPhone = profile.presidentPhone;
      secretaryName = profile.secretaryName; secretaryPhone = profile.secretaryPhone;
      treasurerName = profile.treasurerName; treasurerPhone = profile.treasurerPhone;
      utrNumber = profile.utrNumber;
      masjidRegistrationId = regId;
      status = #pending; registeredBy = caller; timestamp = Time.now();
    });
    regId;
  };

  public query ({ caller }) func getCallerMasjidProfile() : async ?MasjidProfile {
    masjidProfilesV3.values().toArray().find<MasjidProfile>(func(p) { p.registeredBy == caller });
  };

  public query func getApprovedMasjids() : async [MasjidProfile] {
    masjidProfilesV3.values().toArray().filter(func(m) { m.status == #approved });
  };

  public query ({ caller }) func getPendingMasjidRegistrations() : async [MasjidProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) Runtime.trap("Unauthorized");
    masjidProfilesV3.values().toArray().filter(func(m) { m.status == #pending });
  };

  public query ({ caller }) func getAllMasjidRegistrations() : async [MasjidProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) Runtime.trap("Unauthorized");
    masjidProfilesV3.values().toArray();
  };

  public shared ({ caller }) func approveMasjidRegistration(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) Runtime.trap("Unauthorized");
    switch (masjidProfilesV3.get(id)) {
      case (null) { Runtime.trap("Not found") };
      case (?p) {
        masjidProfilesV3.add(id, { p with status = #approved });
        switch (userProfiles.get(p.registeredBy)) {
          case (null) { () };
          case (?up) { userProfiles.add(p.registeredBy, { up with isMasjid = true }) };
        };
      };
    };
  };

  public shared ({ caller }) func rejectMasjidRegistration(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) Runtime.trap("Unauthorized");
    switch (masjidProfilesV3.get(id)) {
      case (null) { Runtime.trap("Not found") };
      case (?p) { masjidProfilesV3.add(id, { p with status = #rejected }) };
    };
  };

  public shared ({ caller }) func adminUpdateMasjidProfile(id : Nat, profile : MasjidProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) Runtime.trap("Unauthorized");
    switch (masjidProfilesV3.get(id)) {
      case (null) { Runtime.trap("Not found") };
      case (?existing) {
        masjidProfilesV3.add(id, {
          profile with id; registeredBy = existing.registeredBy; timestamp = existing.timestamp;
          masjidRegistrationId = existing.masjidRegistrationId;
        });
      };
    };
  };

  public shared ({ caller }) func adminDeleteMasjidRegistration(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) Runtime.trap("Unauthorized");
    switch (masjidProfilesV3.get(id)) {
      case (null) { Runtime.trap("Not found") };
      case (?p) {
        masjidProfilesV3.remove(id);
        switch (userProfiles.get(p.registeredBy)) {
          case (null) { () };
          case (?up) { userProfiles.add(p.registeredBy, { up with isMasjid = false }) };
        };
      };
    };
  };

  // Admin: delete and edit nikah registrations
  public shared ({ caller }) func adminDeleteNikahRegistration(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) Runtime.trap("Unauthorized");
    switch (nikahRegistrationsV2.get(id)) {
      case (null) { Runtime.trap("Not found") };
      case (?r) {
        nikahRegistrationsV2.remove(id);
        matchEntries.remove((r.brideAadhaarHash, r.groomAadhaarHash));
      };
    };
  };

  public shared ({ caller }) func adminUpdateNikahRegistration(id : Nat, reg : NikahRegistration) : async () {
  if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) Runtime.trap("Unauthorized");
    switch (nikahRegistrationsV2.get(id)) {
      case (null) { Runtime.trap("Not found") };
      case (?existing) {
        matchEntries.remove((existing.brideAadhaarHash, existing.groomAadhaarHash));
        nikahRegistrationsV2.add(id, {
          reg with id; nikahUniqueId = existing.nikahUniqueId;
          registeredBy = existing.registeredBy; timestamp = existing.timestamp;
        });
        matchEntries.add((reg.brideAadhaarHash, reg.groomAadhaarHash), id);
      };
    };
  };

  // Admin: delete and edit matrimony proposals
  public shared ({ caller }) func adminDeleteMatrimonyProposal(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) Runtime.trap("Unauthorized");
    switch (matrimonyProposals.get(id)) {
      case (null) { Runtime.trap("Not found") };
      case (_) { matrimonyProposals.remove(id) };
    };
  };

  public shared ({ caller }) func adminUpdateMatrimonyProposal(id : Nat, p : MatrimonyProposal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) Runtime.trap("Unauthorized");
    switch (matrimonyProposals.get(id)) {
      case (null) { Runtime.trap("Not found") };
      case (?existing) {
        matrimonyProposals.add(id, { p with id; postedBy = existing.postedBy; timestamp = existing.timestamp });
      };
    };
  };

  // Admin: delete and edit job postings
  public shared ({ caller }) func adminDeleteJobPosting(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) Runtime.trap("Unauthorized");
    switch (jobPostings.get(id)) {
      case (null) { Runtime.trap("Not found") };
      case (_) { jobPostings.remove(id) };
    };
  };

  public shared ({ caller }) func adminUpdateJobPosting(id : Nat, job : JobPosting) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) Runtime.trap("Unauthorized");
    switch (jobPostings.get(id)) {
      case (null) { Runtime.trap("Not found") };
      case (?existing) {
        jobPostings.add(id, { job with id; postedBy = existing.postedBy; timestamp = existing.timestamp });
      };
    };
  };

  // --- Zakat Settings ---
  public shared ({ caller }) func updateZakatSettings(settings : ZakatSettings) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) Runtime.trap("Unauthorized");
    zakatSettings := ?settings;
  };

  public query func getZakatSettings() : async ?ZakatSettings { zakatSettings };

  // --- Zakat Profiles ---
  public shared ({ caller }) func createZakatProfile(profile : ZakatProfile) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) Runtime.trap("Unauthorized");
    if (not (isMasjidOfficial(caller) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Only masjid officials can create zakat profiles");
    };
    let id = nextZakatProfileId;
    nextZakatProfileId += 1;
    zakatProfiles.add(id, {
      id; masjidId = profile.masjidId; personName = profile.personName;
      story = profile.story; requiredAmount = profile.requiredAmount;
      collectedAmount = 0.0; upiId = profile.upiId; status = #open;
      createdBy = caller; timestamp = Time.now();
    });
    id;
  };

  public shared ({ caller }) func updateZakatProfile(id : Nat, profile : ZakatProfile) : async () {
    switch (zakatProfiles.get(id)) {
      case (null) { Runtime.trap("Not found") };
      case (?existing) {
        if (not (existing.createdBy == caller or AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Unauthorized");
        };
        zakatProfiles.add(id, { profile with id; createdBy = existing.createdBy; timestamp = existing.timestamp });
      };
    };
  };

  public shared ({ caller }) func deleteZakatProfile(id : Nat) : async () {
    switch (zakatProfiles.get(id)) {
      case (null) { Runtime.trap("Not found") };
      case (?existing) {
        if (not (existing.createdBy == caller or AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Unauthorized");
        };
        zakatProfiles.remove(id);
      };
    };
  };

  public shared ({ caller }) func markZakatProfileFulfilled(id : Nat) : async () {
    switch (zakatProfiles.get(id)) {
      case (null) { Runtime.trap("Not found") };
      case (?existing) {
        if (not (existing.createdBy == caller or AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Unauthorized");
        };
        zakatProfiles.add(id, { existing with status = #fulfilled });
      };
    };
  };

  public shared ({ caller }) func updateZakatCollectedAmount(id : Nat, amount : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) Runtime.trap("Unauthorized");
    switch (zakatProfiles.get(id)) {
      case (null) { Runtime.trap("Not found") };
      case (?existing) {
        let newAmount = existing.collectedAmount + amount;
        let newStatus : ZakatProfileStatus = if (newAmount >= existing.requiredAmount) { #fulfilled } else { #open };
        zakatProfiles.add(id, { existing with collectedAmount = newAmount; status = newStatus });
      };
    };
  };

  public query func getOpenZakatProfiles() : async [ZakatProfile] {
    zakatProfiles.values().toArray().filter(func(z) { z.status == #open });
  };

  public query ({ caller }) func getAllZakatProfiles() : async [ZakatProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) Runtime.trap("Unauthorized");
    zakatProfiles.values().toArray();
  };

  public query func getZakatProfilesByMasjid(masjidId : Nat) : async [ZakatProfile] {
    zakatProfiles.values().toArray().filter(func(z) { z.masjidId == masjidId });
  };

  // Legacy donation info getter (kept for upgrade compat)
  public query func getDonationInfo() : async ?DonationInfo { donationInfo };
};
