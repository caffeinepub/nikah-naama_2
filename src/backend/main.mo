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

  type NikahRegistration = {
    id : Nat; brideName : Text; groomName : Text;
    brideAadhaarHash : Text; groomAadhaarHash : Text;
    nikahDate : Text; masjidVenue : Text; qaziName : Text;
    witness1 : Text; witness2 : Text; city : Text;
    status : NikahStatus; registeredBy : Principal; timestamp : Int;
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

  // OLD MasjidProfile type (without upiId) — kept for stable variable migration compatibility
  type OldMasjidProfile = {
    id : Nat; masjidName : Text; address : Text; city : Text; state : Text;
    contactPerson : Text; phone : Text; email : Text;
    registrationNumber : Text; capacity : Nat; facilities : [Text];
    status : MasjidStatus; registeredBy : Principal; timestamp : Int;
  };

  // NEW MasjidProfile type (with upiId)
  type MasjidProfile = {
    id : Nat; masjidName : Text; address : Text; city : Text; state : Text;
    contactPerson : Text; phone : Text; email : Text;
    registrationNumber : Text; capacity : Nat; facilities : [Text];
    upiId : Text; status : MasjidStatus; registeredBy : Principal; timestamp : Int;
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

  // --- Stable state ---
  let matchEntries = Map.empty<(Text, Text), Nat>();
  let nikahRegistrations = Map.empty<Nat, NikahRegistration>();
  let matrimonyProposals = Map.empty<Nat, MatrimonyProposal>();
  let jobPostings = Map.empty<Nat, JobPosting>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // OLD stable var kept for upgrade compatibility (no upiId)
  stable let masjidProfiles = Map.empty<Nat, OldMasjidProfile>();
  // NEW stable var with upiId
  stable let masjidProfilesV2 = Map.empty<Nat, MasjidProfile>();
  stable let zakatProfiles = Map.empty<Nat, ZakatProfile>();

  // donationInfo kept for upgrade compatibility
  stable var donationInfo : ?DonationInfo = null;
  stable var zakatSettings : ?ZakatSettings = null;

  stable var nextNikahId = 1;
  stable var nextProposalId = 1;
  stable var nextJobId = 1;
  stable var nextMasjidId = 1;
  stable var nextCertificateNumber = 1;
  stable var nextZakatProfileId = 1;
  stable var masjidMigrated = false;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // One-time migration from old map (no upiId) to new map (with upiId)
  system func postupgrade() {
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
  };

  func isMasjidOfficial(principal : Principal) : Bool {
    switch (userProfiles.get(principal)) {
      case (null) { false };
      case (?p) { p.isMasjid };
    };
  };

  // --- Reset All Roles (protected by hardcoded reset secret) ---
  // After reset, the next person who logs in with the admin token becomes the new admin.
  public shared func resetAllRolesWithToken(token : Text) : async () {
    if (token != "NIKAHNAAMA_RESET_2026") {
      Runtime.trap("Invalid reset token");
    };
    for (p in accessControlState.userRoles.keys().toArray().vals()) {
      ignore accessControlState.userRoles.remove(p);
    };
    accessControlState.adminAssigned := false;
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
    nikahRegistrations.add(id, {
      id; brideName = reg.brideName; groomName = reg.groomName;
      brideAadhaarHash = reg.brideAadhaarHash; groomAadhaarHash = reg.groomAadhaarHash;
      nikahDate = reg.nikahDate; masjidVenue = reg.masjidVenue; qaziName = reg.qaziName;
      witness1 = reg.witness1; witness2 = reg.witness2; city = reg.city;
      status = #pending; registeredBy = caller; timestamp = Time.now();
    });
    matchEntries.add((reg.brideAadhaarHash, reg.groomAadhaarHash), id);
    id;
  };

  public query ({ caller }) func getNikahRegistration(id : Nat) : async ?NikahRegistration {
    switch (nikahRegistrations.get(id)) {
      case (null) { null };
      case (?r) {
        if (AccessControl.isAdmin(accessControlState, caller) or isMasjidOfficial(caller) or r.registeredBy == caller) {
          ?r;
        } else { Runtime.trap("Unauthorized") };
      };
    };
  };

  public query ({ caller }) func getAllNikahRegistrations() : async [NikahRegistration] {
    if (not (AccessControl.isAdmin(accessControlState, caller) or isMasjidOfficial(caller))) {
      Runtime.trap("Unauthorized");
    };
    nikahRegistrations.values().toArray().sort();
  };

  public query ({ caller }) func getPendingNikahRegistrations() : async [NikahRegistration] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    nikahRegistrations.values().toArray().filter(func(r) { r.status == #pending }).sort();
  };

  public shared ({ caller }) func approveNikahRegistration(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) Runtime.trap("Unauthorized");
    switch (nikahRegistrations.get(id)) {
      case (null) { Runtime.trap("Not found") };
      case (?r) { nikahRegistrations.add(id, { r with status = #approved }) };
    };
  };

  public shared ({ caller }) func rejectNikahRegistration(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) Runtime.trap("Unauthorized");
    switch (nikahRegistrations.get(id)) {
      case (null) { Runtime.trap("Not found") };
      case (?r) { nikahRegistrations.add(id, { r with status = #rejected }) };
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

  // --- Certificate ---
  public shared ({ caller }) func generateCertificate(nikahId : Nat) : async Certificate {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) Runtime.trap("Unauthorized");
    switch (nikahRegistrations.get(nikahId)) {
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

  // --- Masjid Registration (using V2 map) ---
  public shared ({ caller }) func submitMasjidRegistration(profile : MasjidProfile) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) Runtime.trap("Unauthorized");
    let id = nextMasjidId;
    nextMasjidId += 1;
    masjidProfilesV2.add(id, {
      id; masjidName = profile.masjidName; address = profile.address;
      city = profile.city; state = profile.state; contactPerson = profile.contactPerson;
      phone = profile.phone; email = profile.email;
      registrationNumber = profile.registrationNumber; capacity = profile.capacity;
      facilities = profile.facilities; upiId = profile.upiId;
      status = #pending; registeredBy = caller; timestamp = Time.now();
    });
    id;
  };

  public query ({ caller }) func getCallerMasjidProfile() : async ?MasjidProfile {
    masjidProfilesV2.values().toArray().find<MasjidProfile>(func(p) { p.registeredBy == caller });
  };

  public query func getApprovedMasjids() : async [MasjidProfile] {
    masjidProfilesV2.values().toArray().filter(func(m) { m.status == #approved });
  };

  public query ({ caller }) func getPendingMasjidRegistrations() : async [MasjidProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) Runtime.trap("Unauthorized");
    masjidProfilesV2.values().toArray().filter(func(m) { m.status == #pending });
  };

  public query ({ caller }) func getAllMasjidRegistrations() : async [MasjidProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) Runtime.trap("Unauthorized");
    masjidProfilesV2.values().toArray();
  };

  public shared ({ caller }) func approveMasjidRegistration(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) Runtime.trap("Unauthorized");
    switch (masjidProfilesV2.get(id)) {
      case (null) { Runtime.trap("Not found") };
      case (?p) {
        masjidProfilesV2.add(id, { p with status = #approved });
        switch (userProfiles.get(p.registeredBy)) {
          case (null) { () };
          case (?up) { userProfiles.add(p.registeredBy, { up with isMasjid = true }) };
        };
      };
    };
  };

  public shared ({ caller }) func rejectMasjidRegistration(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) Runtime.trap("Unauthorized");
    switch (masjidProfilesV2.get(id)) {
      case (null) { Runtime.trap("Not found") };
      case (?p) { masjidProfilesV2.add(id, { p with status = #rejected }) };
    };
  };

  public shared ({ caller }) func adminUpdateMasjidProfile(id : Nat, profile : MasjidProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) Runtime.trap("Unauthorized");
    switch (masjidProfilesV2.get(id)) {
      case (null) { Runtime.trap("Not found") };
      case (?existing) {
        masjidProfilesV2.add(id, {
          profile with id; registeredBy = existing.registeredBy; timestamp = existing.timestamp;
        });
      };
    };
  };

  public shared ({ caller }) func updateCallerMasjidProfile(profile : MasjidProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) Runtime.trap("Unauthorized");
    switch (masjidProfilesV2.values().toArray().find<MasjidProfile>(func(p) { p.registeredBy == caller })) {
      case (null) { Runtime.trap("No masjid profile found") };
      case (?existing) {
        masjidProfilesV2.add(existing.id, {
          profile with id = existing.id; status = existing.status;
          registeredBy = existing.registeredBy; timestamp = existing.timestamp;
        });
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
        ignore zakatProfiles.remove(id);
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
