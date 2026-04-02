import { NikahStatus } from "@/backend";
import type {
  Gender,
  JobPosting,
  MatrimonyProposal,
  NikahRegistration,
} from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

interface LocalZakatProfile {
  id: bigint;
  masjidId: bigint;
  personName: string;
  story: string;
  requiredAmount: number;
  collectedAmount: number;
  upiId: string;
  status: string;
}

interface LocalMasjidProfile {
  id: bigint;
  status: string;
  masjidName: string;
  address: string;
  city: string;
  state: string;
  contactPerson: string;
  phone: string;
  email: string;
  registrationNumber: string;
  capacity: bigint;
  facilities: string[];
  upiId: string;
  registeredBy: any;
  timestamp: bigint;
}

interface RegForm {
  brideName: string;
  groomName: string;
  brideAadhaar: string;
  groomAadhaar: string;
  nikahDate: string;
  masjidVenue: string;
  qaziName: string;
  witness1: string;
  witness2: string;
  city: string;
}

const initForm: RegForm = {
  brideName: "",
  groomName: "",
  brideAadhaar: "",
  groomAadhaar: "",
  nikahDate: "",
  masjidVenue: "",
  qaziName: "",
  witness1: "",
  witness2: "",
  city: "",
};

interface MatrimonyForm {
  name: string;
  age: string;
  gender: string;
  city: string;
  education: string;
  profession: string;
  description: string;
  contact: string;
}

const initMatrimonyForm: MatrimonyForm = {
  name: "",
  age: "",
  gender: "male",
  city: "",
  education: "",
  profession: "",
  description: "",
  contact: "",
};

interface JobForm {
  title: string;
  company: string;
  location: string;
  description: string;
  contact: string;
}

const initJobForm: JobForm = {
  title: "",
  company: "",
  location: "",
  description: "",
  contact: "",
};

interface ZakatForm {
  personName: string;
  story: string;
  requiredAmount: string;
  upiId: string;
}

const initZakatForm: ZakatForm = {
  personName: "",
  story: "",
  requiredAmount: "",
  upiId: "",
};

// ─── Nikah Registration Form Tab ─────────────────────────────────────────────────
function NikahFormTab() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const [form, setForm] = useState<RegForm>(initForm);
  const [loading, setLoading] = useState(false);

  const set =
    (field: keyof RegForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity || !actor) return;
    setLoading(true);
    try {
      await actor.submitNikahRegistration({
        id: 0n,
        status: NikahStatus.pending,
        brideAadhaarHash: btoa(form.brideAadhaar.replace(/\s/g, "")),
        groomAadhaarHash: btoa(form.groomAadhaar.replace(/\s/g, "")),
        brideName: form.brideName,
        groomName: form.groomName,
        nikahDate: form.nikahDate,
        masjidVenue: form.masjidVenue,
        qaziName: form.qaziName,
        witness1: form.witness1,
        witness2: form.witness2,
        city: form.city,
        registeredBy: identity.getPrincipal(),
        timestamp: BigInt(Date.now()),
      });
      toast.success("Registration submitted!");
      setForm(initForm);
    } catch {
      toast.error("Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl p-6"
      style={{
        backgroundColor: "#FAF7E6",
        border: "1px solid rgba(212,175,55,0.5)",
      }}
      data-ocid="masjid.nikah.form"
    >
      <h3 className="font-semibold mb-4" style={{ color: "#0B5A3A" }}>
        Submit Nikah Registration
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label style={{ color: "#0B5A3A" }}>Bride Name</Label>
          <Input
            data-ocid="masjid.bride_name.input"
            value={form.brideName}
            onChange={set("brideName")}
            required
          />
        </div>
        <div className="space-y-1">
          <Label style={{ color: "#0B5A3A" }}>Groom Name</Label>
          <Input
            data-ocid="masjid.groom_name.input"
            value={form.groomName}
            onChange={set("groomName")}
            required
          />
        </div>
        <div className="space-y-1">
          <Label style={{ color: "#0B5A3A" }}>Bride Aadhaar</Label>
          <Input
            data-ocid="masjid.bride_aadhaar.input"
            type="password"
            maxLength={12}
            value={form.brideAadhaar}
            onChange={set("brideAadhaar")}
            required
          />
        </div>
        <div className="space-y-1">
          <Label style={{ color: "#0B5A3A" }}>Groom Aadhaar</Label>
          <Input
            data-ocid="masjid.groom_aadhaar.input"
            type="password"
            maxLength={12}
            value={form.groomAadhaar}
            onChange={set("groomAadhaar")}
            required
          />
        </div>
        <div className="space-y-1">
          <Label style={{ color: "#0B5A3A" }}>Date of Nikah</Label>
          <Input
            data-ocid="masjid.nikah_date.input"
            type="date"
            value={form.nikahDate}
            onChange={set("nikahDate")}
            required
          />
        </div>
        <div className="space-y-1">
          <Label style={{ color: "#0B5A3A" }}>City</Label>
          <Input
            data-ocid="masjid.city.input"
            value={form.city}
            onChange={set("city")}
            required
          />
        </div>
        <div className="space-y-1">
          <Label style={{ color: "#0B5A3A" }}>Masjid / Venue</Label>
          <Input
            data-ocid="masjid.venue.input"
            value={form.masjidVenue}
            onChange={set("masjidVenue")}
            required
          />
        </div>
        <div className="space-y-1">
          <Label style={{ color: "#0B5A3A" }}>Qazi Name</Label>
          <Input
            data-ocid="masjid.qazi.input"
            value={form.qaziName}
            onChange={set("qaziName")}
            required
          />
        </div>
        <div className="space-y-1">
          <Label style={{ color: "#0B5A3A" }}>Witness 1</Label>
          <Input
            data-ocid="masjid.witness1.input"
            value={form.witness1}
            onChange={set("witness1")}
            required
          />
        </div>
        <div className="space-y-1">
          <Label style={{ color: "#0B5A3A" }}>Witness 2</Label>
          <Input
            data-ocid="masjid.witness2.input"
            value={form.witness2}
            onChange={set("witness2")}
            required
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="mt-6"
        data-ocid="masjid.submit_button"
        style={{ backgroundColor: "#0B5A3A", color: "white" }}
      >
        {loading ? "Submitting..." : "Submit Registration"}
      </Button>
    </form>
  );
}

// ─── Manage Content Tab (Matrimony + Jobs) ──────────────────────────────────
function ManageContentTab() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();
  const [matForm, setMatForm] = useState<MatrimonyForm>(initMatrimonyForm);
  const [jobForm, setJobForm] = useState<JobForm>(initJobForm);

  const setMat =
    (field: keyof MatrimonyForm) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setMatForm((prev) => ({ ...prev, [field]: e.target.value }));

  const setJob =
    (field: keyof JobForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setJobForm((prev) => ({ ...prev, [field]: e.target.value }));

  // Caller's own matrimony proposals
  const { data: myProposals = [] } = useQuery<MatrimonyProposal[]>({
    queryKey: ["callerMatrimony"],
    queryFn: () => (actor as any).getCallerMatrimonyProposals(),
    enabled: !!actor && !isFetching,
  });

  // Caller's own job postings
  const { data: myJobs = [] } = useQuery<JobPosting[]>({
    queryKey: ["callerJobs"],
    queryFn: () => (actor as any).getCallerJobPostings(),
    enabled: !!actor && !isFetching,
  });

  const matrimonyMutation = useMutation({
    mutationFn: () =>
      actor!.postMatrimonyProposal({
        id: 0n,
        name: matForm.name,
        age: BigInt(Number.parseInt(matForm.age) || 0),
        gender: matForm.gender as Gender,
        city: matForm.city,
        education: matForm.education,
        profession: matForm.profession,
        description: matForm.description,
        contact: matForm.contact,
        postedBy: identity!.getPrincipal(),
        timestamp: BigInt(Date.now()),
      }),
    onSuccess: () => {
      toast.success("Matrimony proposal posted!");
      setMatForm(initMatrimonyForm);
      qc.invalidateQueries({ queryKey: ["matrimony"] });
      qc.invalidateQueries({ queryKey: ["callerMatrimony"] });
    },
    onError: () => toast.error("Failed to post proposal"),
  });

  const jobMutation = useMutation({
    mutationFn: () =>
      actor!.postJobPosting({
        id: 0n,
        title: jobForm.title,
        company: jobForm.company,
        location: jobForm.location,
        description: jobForm.description,
        contact: jobForm.contact,
        postedBy: identity!.getPrincipal(),
        timestamp: BigInt(Date.now()),
      }),
    onSuccess: () => {
      toast.success("Job posting published!");
      setJobForm(initJobForm);
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: ["callerJobs"] });
    },
    onError: () => toast.error("Failed to post job"),
  });

  return (
    <div className="space-y-8">
      {/* ─── Matrimony Section ─── */}
      <div>
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: "#FAF7E6",
            border: "1px solid rgba(212,175,55,0.5)",
          }}
          data-ocid="masjid.matrimony.form"
        >
          <h3 className="font-semibold mb-4" style={{ color: "#0B5A3A" }}>
            💍 Post Matrimony Proposal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Name</Label>
              <Input
                value={matForm.name}
                onChange={setMat("name")}
                required
                data-ocid="masjid.matrimony_name.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Age</Label>
              <Input
                type="number"
                value={matForm.age}
                onChange={setMat("age")}
                required
                data-ocid="masjid.matrimony_age.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Gender</Label>
              <select
                value={matForm.gender}
                onChange={setMat("gender")}
                className="w-full border rounded-md px-3 py-2 text-sm"
                style={{
                  borderColor: "rgba(212,175,55,0.5)",
                  color: "#0B5A3A",
                }}
                data-ocid="masjid.matrimony_gender.select"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>City</Label>
              <Input
                value={matForm.city}
                onChange={setMat("city")}
                required
                data-ocid="masjid.matrimony_city.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Education</Label>
              <Input
                value={matForm.education}
                onChange={setMat("education")}
                data-ocid="masjid.matrimony_education.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Profession</Label>
              <Input
                value={matForm.profession}
                onChange={setMat("profession")}
                data-ocid="masjid.matrimony_profession.input"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label style={{ color: "#0B5A3A" }}>Description</Label>
              <Textarea
                value={matForm.description}
                onChange={setMat("description")}
                data-ocid="masjid.matrimony_desc.textarea"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Contact</Label>
              <Input
                value={matForm.contact}
                onChange={setMat("contact")}
                required
                data-ocid="masjid.matrimony_contact.input"
              />
            </div>
          </div>
          <Button
            className="mt-4"
            onClick={() => matrimonyMutation.mutate()}
            disabled={matrimonyMutation.isPending}
            data-ocid="masjid.matrimony.submit_button"
            style={{ backgroundColor: "#0B5A3A", color: "white" }}
          >
            {matrimonyMutation.isPending ? "Posting..." : "Post Proposal"}
          </Button>
        </div>

        {/* My Posted Proposals */}
        {myProposals.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold text-sm" style={{ color: "#0B5A3A" }}>
              My Posted Proposals
            </h4>
            {myProposals.map((p, i) => (
              <div
                key={p.id.toString()}
                data-ocid={`masjid.matrimony.item.${i + 1}`}
                className="rounded-lg px-4 py-3"
                style={{
                  backgroundColor: "#FAF7E6",
                  border: "1px solid rgba(212,175,55,0.3)",
                }}
              >
                <p className="font-medium text-sm" style={{ color: "#0B5A3A" }}>
                  {p.name}, {p.age.toString()}yrs — {p.gender}
                </p>
                <p className="text-xs" style={{ color: "#1E7A52" }}>
                  {p.city} • {p.education} • {p.profession}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Jobs Section ─── */}
      <div>
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: "#FAF7E6",
            border: "1px solid rgba(212,175,55,0.5)",
          }}
          data-ocid="masjid.jobs.form"
        >
          <h3 className="font-semibold mb-4" style={{ color: "#0B5A3A" }}>
            💼 Post Job Listing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Job Title</Label>
              <Input
                value={jobForm.title}
                onChange={setJob("title")}
                required
                data-ocid="masjid.job_title.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Company / Organisation</Label>
              <Input
                value={jobForm.company}
                onChange={setJob("company")}
                required
                data-ocid="masjid.job_company.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Location</Label>
              <Input
                value={jobForm.location}
                onChange={setJob("location")}
                required
                data-ocid="masjid.job_location.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Contact</Label>
              <Input
                value={jobForm.contact}
                onChange={setJob("contact")}
                required
                data-ocid="masjid.job_contact.input"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label style={{ color: "#0B5A3A" }}>Description</Label>
              <Textarea
                value={jobForm.description}
                onChange={setJob("description")}
                data-ocid="masjid.job_desc.textarea"
              />
            </div>
          </div>
          <Button
            className="mt-4"
            onClick={() => jobMutation.mutate()}
            disabled={jobMutation.isPending}
            data-ocid="masjid.jobs.submit_button"
            style={{ backgroundColor: "#0B5A3A", color: "white" }}
          >
            {jobMutation.isPending ? "Posting..." : "Post Job"}
          </Button>
        </div>

        {/* My Posted Jobs */}
        {myJobs.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold text-sm" style={{ color: "#0B5A3A" }}>
              My Posted Jobs
            </h4>
            {myJobs.map((job, i) => (
              <div
                key={job.id.toString()}
                data-ocid={`masjid.jobs.item.${i + 1}`}
                className="rounded-lg px-4 py-3"
                style={{
                  backgroundColor: "#FAF7E6",
                  border: "1px solid rgba(212,175,55,0.3)",
                }}
              >
                <p className="font-medium text-sm" style={{ color: "#0B5A3A" }}>
                  {job.title} — {job.company}
                </p>
                <p className="text-xs" style={{ color: "#1E7A52" }}>
                  {job.location} • {job.contact}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Zakat Profiles Tab ──────────────────────────────────────────────────────────
function ZakatProfilesTab({ masjidId }: { masjidId: bigint }) {
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();
  const [form, setForm] = useState<ZakatForm>(initZakatForm);
  const [showForm, setShowForm] = useState(false);

  const setField =
    (field: keyof ZakatForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const { data: profiles = [], isLoading } = useQuery<LocalZakatProfile[]>({
    queryKey: ["masjidZakatProfiles", masjidId.toString()],
    queryFn: () => (actor as any).getZakatProfilesByMasjid(masjidId),
    enabled: !!actor && !isFetching,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      (actor as any).createZakatProfile({
        id: 0n,
        masjidId,
        personName: form.personName,
        story: form.story,
        requiredAmount: Number.parseFloat(form.requiredAmount) || 0,
        collectedAmount: 0,
        upiId: form.upiId,
        status: "open" as any,
        createdBy: identity!.getPrincipal(),
        timestamp: BigInt(Date.now()),
      }),
    onSuccess: () => {
      toast.success("Profile created!");
      setForm(initZakatForm);
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ["masjidZakatProfiles"] });
    },
    onError: () => toast.error("Failed to create profile"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: bigint) => (actor as any).deleteZakatProfile(id),
    onSuccess: () => {
      toast.success("Profile deleted.");
      qc.invalidateQueries({ queryKey: ["masjidZakatProfiles"] });
    },
    onError: () => toast.error("Failed to delete"),
  });

  const fulfillMutation = useMutation({
    mutationFn: (id: bigint) => (actor as any).markZakatProfileFulfilled(id),
    onSuccess: () => {
      toast.success("Marked as fulfilled!");
      qc.invalidateQueries({ queryKey: ["masjidZakatProfiles"] });
    },
    onError: () => toast.error("Failed to update"),
  });

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold" style={{ color: "#0B5A3A" }}>
          🤲 Zakat Profiles for the Needy
        </h3>
        <Button
          size="sm"
          onClick={() => setShowForm(!showForm)}
          data-ocid="masjid.zakat_profiles.open_modal_button"
          style={{ backgroundColor: "#0B5A3A", color: "white" }}
        >
          {showForm ? "Cancel" : "+ Add New Profile"}
        </Button>
      </div>

      {showForm && (
        <div
          className="rounded-xl p-5 space-y-3"
          style={{ backgroundColor: "#FAF7E6", border: "2px solid #D4AF37" }}
          data-ocid="masjid.zakat_profiles.form"
        >
          <h4 className="font-semibold" style={{ color: "#0B5A3A" }}>
            Add Needy Person Profile
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Person&apos;s Name *</Label>
              <Input
                value={form.personName}
                onChange={setField("personName")}
                required
                placeholder="Full name"
                data-ocid="masjid.zakat_profile.name.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Required Amount (₹) *</Label>
              <Input
                type="number"
                min="0"
                value={form.requiredAmount}
                onChange={setField("requiredAmount")}
                required
                placeholder="50000"
                data-ocid="masjid.zakat_profile.amount.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>UPI ID for Donations</Label>
              <Input
                value={form.upiId}
                onChange={setField("upiId")}
                placeholder="person@upi"
                data-ocid="masjid.zakat_profile.upi.input"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label style={{ color: "#0B5A3A" }}>
                Story / Need Description *
              </Label>
              <Textarea
                value={form.story}
                onChange={setField("story")}
                required
                placeholder="Describe the person's situation..."
                data-ocid="masjid.zakat_profile.story.textarea"
              />
            </div>
          </div>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={
              createMutation.isPending ||
              !form.personName ||
              !form.story ||
              !form.requiredAmount
            }
            data-ocid="masjid.zakat_profiles.submit_button"
            style={{ backgroundColor: "#0B5A3A", color: "white" }}
          >
            {createMutation.isPending ? "Creating..." : "Create Profile"}
          </Button>
        </div>
      )}

      {isLoading && (
        <p
          style={{ color: "#1E7A52" }}
          data-ocid="masjid.zakat_profiles.loading_state"
        >
          Loading profiles...
        </p>
      )}

      {!isLoading && profiles.length === 0 && (
        <div
          className="text-center py-8 rounded-xl"
          style={{
            backgroundColor: "#FAF7E6",
            border: "1px solid rgba(212,175,55,0.4)",
          }}
          data-ocid="masjid.zakat_profiles.empty_state"
        >
          <p className="text-2xl mb-2">🤲</p>
          <p style={{ color: "#1E7A52" }}>
            No profiles yet. Add a needy person to receive Zakat donations.
          </p>
        </div>
      )}

      <div className="space-y-3" data-ocid="masjid.zakat_profiles.list">
        {profiles.map((p, i) => {
          const pct =
            p.requiredAmount > 0
              ? Math.min(
                  100,
                  Math.round((p.collectedAmount / p.requiredAmount) * 100),
                )
              : 0;
          return (
            <div
              key={p.id.toString()}
              data-ocid={`masjid.zakat_profiles.item.${i + 1}`}
              className="rounded-xl p-5"
              style={{
                backgroundColor: "#FAF7E6",
                border: "1px solid rgba(212,175,55,0.4)",
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold" style={{ color: "#0B5A3A" }}>
                  {p.personName}
                </p>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor:
                      p.status === "fulfilled" ? "#1E7A52" : "#D4AF37",
                    color: "white",
                  }}
                >
                  {p.status}
                </span>
              </div>
              <p className="text-sm mb-3" style={{ color: "#1E7A52" }}>
                {p.story}
              </p>
              <div className="mb-2">
                <div
                  className="flex justify-between text-xs mb-1"
                  style={{ color: "#0B5A3A" }}
                >
                  <span>
                    ₹{p.collectedAmount.toLocaleString("en-IN")} raised
                  </span>
                  <span>Goal: ₹{p.requiredAmount.toLocaleString("en-IN")}</span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
              {p.upiId && (
                <p className="text-xs" style={{ color: "#1E7A52" }}>
                  UPI: {p.upiId}
                </p>
              )}
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={() => fulfillMutation.mutate(p.id)}
                  disabled={p.status === "fulfilled"}
                  data-ocid={`masjid.zakat_profiles.fulfill.button.${i + 1}`}
                  style={{ backgroundColor: "#1E7A52", color: "white" }}
                >
                  Mark Fulfilled
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(p.id)}
                  data-ocid={`masjid.zakat_profiles.delete_button.${i + 1}`}
                >
                  Delete
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── My Nikah Records Tab ──────────────────────────────────────────────────────────
function MyNikahRecordsTab() {
  const { actor, isFetching } = useActor();

  const { data: registrations = [], isLoading } = useQuery<NikahRegistration[]>(
    {
      queryKey: ["callerNikahRegs"],
      queryFn: () => (actor as any).getCallerNikahRegistrations(),
      enabled: !!actor && !isFetching,
    },
  );

  if (isLoading) {
    return (
      <p
        style={{ color: "#1E7A52" }}
        data-ocid="masjid.nikah_records.loading_state"
      >
        Loading registrations...
      </p>
    );
  }

  if (registrations.length === 0) {
    return (
      <div
        className="text-center py-8 rounded-xl"
        style={{
          backgroundColor: "#FAF7E6",
          border: "1px solid rgba(212,175,55,0.4)",
        }}
        data-ocid="masjid.nikah_records.empty_state"
      >
        <p className="text-2xl mb-2">📜</p>
        <p style={{ color: "#1E7A52" }}>
          No nikah registrations submitted yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-ocid="masjid.nikah_records.list">
      {registrations.map((reg, i) => (
        <div
          key={reg.id.toString()}
          data-ocid={`masjid.nikah_records.item.${i + 1}`}
          className="flex items-center justify-between rounded-xl px-5 py-3"
          style={{
            backgroundColor: "#FAF7E6",
            border: "1px solid rgba(212,175,55,0.3)",
          }}
        >
          <div>
            <p className="font-medium text-sm" style={{ color: "#0B5A3A" }}>
              #{reg.id.toString()} — {reg.brideName} &amp; {reg.groomName}
            </p>
            <p className="text-xs" style={{ color: "#1E7A52" }}>
              {reg.city} • {reg.nikahDate}
            </p>
          </div>
          <Badge
            style={{
              backgroundColor:
                reg.status === NikahStatus.approved
                  ? "#1E7A52"
                  : reg.status === NikahStatus.rejected
                    ? "#c62828"
                    : "#F9A825",
              color: "white",
            }}
          >
            {reg.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}

// ─── Main Masjid Page ───────────────────────────────────────────────────────────
export default function MasjidPage() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => actor!.getCallerUserProfile(),
    enabled: !!actor && isAuthenticated,
  });

  const { data: masjidProfile, isLoading: masjidLoading } = useQuery({
    queryKey: ["callerMasjidProfile"],
    queryFn: () => actor!.getCallerMasjidProfile(),
    enabled: !!actor && isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div
        className="max-w-xl mx-auto px-4 py-12 text-center"
        data-ocid="masjid.error_state"
      >
        <p style={{ color: "#0B5A3A" }} className="text-lg font-semibold">
          Please login to access Masjid panel
        </p>
      </div>
    );
  }

  if (profileLoading || masjidLoading) {
    return (
      <div
        className="text-center py-12"
        data-ocid="masjid.loading_state"
        style={{ color: "#1E7A52" }}
      >
        Loading...
      </div>
    );
  }

  const isMasjidUser = !!profile?.isMasjid;
  const mp = masjidProfile as LocalMasjidProfile | null;
  const isApprovedMasjid =
    mp !== null && mp !== undefined && mp.status === "approved";
  const isPendingMasjid =
    mp !== null && mp !== undefined && mp.status === "pending";

  if (!isMasjidUser && !isApprovedMasjid) {
    return (
      <div
        className="max-w-xl mx-auto px-4 py-12 text-center"
        data-ocid="masjid.error_state"
      >
        {isPendingMasjid ? (
          <>
            <p className="text-3xl mb-3">⏳</p>
            <p className="text-lg font-semibold" style={{ color: "#0B5A3A" }}>
              Registration Pending
            </p>
            <p className="text-sm mt-2" style={{ color: "#1E7A52" }}>
              Your Masjid application is under review.
            </p>
          </>
        ) : (
          <>
            <p className="text-3xl mb-3">🕌</p>
            <p className="text-lg font-semibold" style={{ color: "#0B5A3A" }}>
              Masjid Not Registered
            </p>
            <p className="text-sm mt-2 mb-5" style={{ color: "#1E7A52" }}>
              This panel is for registered and approved Masjids only.
            </p>
            <Link to="/masjid-register">
              <Button
                data-ocid="masjid.register.button"
                style={{ backgroundColor: "#0B5A3A", color: "white" }}
              >
                Register your Masjid →
              </Button>
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Masjid Header — READ ONLY */}
      <div className="mb-6">
        <h2
          className="text-2xl font-bold"
          style={{ fontFamily: "'Playfair Display', serif", color: "#0B5A3A" }}
        >
          🕌 Masjid Panel
        </h2>
        {mp && (
          <div
            className="mt-3 rounded-xl px-5 py-4"
            style={{
              backgroundColor: "#FAF7E6",
              border: "1px solid rgba(212,175,55,0.4)",
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-lg" style={{ color: "#0B5A3A" }}>
                  {mp.masjidName}
                </p>
                <p className="text-sm" style={{ color: "#1E7A52" }}>
                  {mp.address}, {mp.city}, {mp.state}
                </p>
                <p className="text-xs mt-1" style={{ color: "#1E7A52" }}>
                  {mp.contactPerson} · {mp.phone}
                </p>
              </div>
              <Badge
                style={{
                  backgroundColor:
                    mp.status === "approved"
                      ? "#1E7A52"
                      : mp.status === "rejected"
                        ? "#c62828"
                        : "#F9A825",
                  color: "white",
                }}
              >
                {mp.status}
              </Badge>
            </div>
          </div>
        )}
      </div>

      <Tabs defaultValue="nikah" data-ocid="masjid.panel">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="nikah" data-ocid="masjid.nikah.tab">
            Submit Nikah
          </TabsTrigger>
          {isApprovedMasjid && (
            <TabsTrigger value="manage" data-ocid="masjid.manage.tab">
              Matrimony &amp; Jobs
            </TabsTrigger>
          )}
          {isApprovedMasjid && (
            <TabsTrigger value="zakat" data-ocid="masjid.zakat.tab">
              Zakat Profiles
            </TabsTrigger>
          )}
          <TabsTrigger value="mynikah" data-ocid="masjid.mynikah.tab">
            My Nikah Records
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nikah">
          <NikahFormTab />
        </TabsContent>

        <TabsContent value="manage">
          <ManageContentTab />
        </TabsContent>

        {isApprovedMasjid && mp && (
          <TabsContent value="zakat">
            <ZakatProfilesTab masjidId={mp.id} />
          </TabsContent>
        )}

        <TabsContent value="mynikah">
          <MyNikahRecordsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
