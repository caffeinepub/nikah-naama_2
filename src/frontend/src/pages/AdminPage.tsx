import { NikahStatus, UserRole } from "@/backend";
import type {
  JobPosting,
  MatrimonyProposal,
  NikahRegistration,
  ZakatSettings,
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
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ADMIN_CLAIM_TOKEN = "NIKAHNAAMA_RESET_2026";

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
  presidentName: string;
  presidentPhone: string;
  secretaryName: string;
  secretaryPhone: string;
  treasurerName: string;
  treasurerPhone: string;
  utrNumber: string;
  masjidRegistrationId: string;
}

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

function statusColor(s: NikahStatus): string {
  if (s === NikahStatus.approved) return "#1E7A52";
  if (s === NikahStatus.rejected) return "#c62828";
  return "#F9A825";
}

function masjidStatusColor(s: string): string {
  if (s === "approved") return "#1E7A52";
  if (s === "rejected") return "#c62828";
  return "#F9A825";
}

// ─── Nikah Edit Row ──────────────────────────────────────────────────────────
function NikahEditRow({
  reg,
  onSave,
  onDelete,
}: {
  reg: NikahRegistration;
  onSave: (updated: NikahRegistration) => void;
  onDelete: (id: bigint) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({
    groomName: reg.groomName,
    brideName: reg.brideName,
    nikahDate: reg.nikahDate,
    city: reg.city,
    status: reg.status as string,
  });

  const set =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = () => {
    onSave({
      ...reg,
      groomName: form.groomName,
      brideName: form.brideName,
      nikahDate: form.nikahDate,
      city: form.city,
      status: form.status as NikahStatus,
    });
    setEditing(false);
  };

  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: "#FAF7E6",
        border: "1px solid rgba(212,175,55,0.3)",
      }}
    >
      {!editing ? (
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-medium text-sm" style={{ color: "#0B5A3A" }}>
              #{reg.id.toString()} — {reg.brideName} &amp; {reg.groomName}
            </p>
            <p className="text-xs" style={{ color: "#1E7A52" }}>
              {reg.city} • {reg.nikahDate}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge
              style={{
                backgroundColor: statusColor(reg.status),
                color: "white",
              }}
            >
              {reg.status}
            </Badge>
            <Button
              size="sm"
              onClick={() => {
                setEditing(true);
                setConfirmDelete(false);
              }}
              data-ocid="admin.nikah.edit_button"
              style={{ backgroundColor: "#D4AF37", color: "#0B5A3A" }}
            >
              Edit
            </Button>
            {!confirmDelete ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setConfirmDelete(true)}
                data-ocid="admin.nikah.delete_button"
              >
                Delete
              </Button>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-xs" style={{ color: "#c62828" }}>
                  Sure?
                </span>
                <Button
                  size="sm"
                  style={{ backgroundColor: "#c62828", color: "white" }}
                  onClick={() => onDelete(reg.id)}
                  data-ocid="admin.nikah.confirm_button"
                >
                  Yes
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmDelete(false)}
                  data-ocid="admin.nikah.cancel_button"
                >
                  No
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm" style={{ color: "#0B5A3A" }}>
            Edit Nikah #{reg.id.toString()}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Groom Name</Label>
              <Input
                value={form.groomName}
                onChange={set("groomName")}
                data-ocid="admin.nikah_edit.groom.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Bride Name</Label>
              <Input
                value={form.brideName}
                onChange={set("brideName")}
                data-ocid="admin.nikah_edit.bride.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Date of Nikah</Label>
              <Input
                type="date"
                value={form.nikahDate}
                onChange={set("nikahDate")}
                data-ocid="admin.nikah_edit.date.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>City</Label>
              <Input
                value={form.city}
                onChange={set("city")}
                data-ocid="admin.nikah_edit.city.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Status</Label>
              <select
                value={form.status}
                onChange={set("status")}
                className="w-full border rounded-md px-3 py-2 text-sm"
                style={{
                  borderColor: "rgba(212,175,55,0.4)",
                  color: "#0B5A3A",
                }}
                data-ocid="admin.nikah_edit.status.select"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              data-ocid="admin.nikah_edit.save_button"
              style={{ backgroundColor: "#0B5A3A", color: "white" }}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(false)}
              data-ocid="admin.nikah_edit.cancel_button"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Matrimony Tab ─────────────────────────────────────────────────────────
function MatrimonyAdminTab() {
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();

  const { data: proposals = [], isLoading } = useQuery<MatrimonyProposal[]>({
    queryKey: ["adminMatrimony"],
    queryFn: () => actor!.getAllMatrimonyProposals(),
    enabled: !!actor && !isFetching,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: bigint) => (actor as any).adminDeleteMatrimonyProposal(id),
    onSuccess: () => {
      toast.success("Proposal deleted.");
      qc.invalidateQueries({ queryKey: ["adminMatrimony"] });
    },
    onError: () => toast.error("Failed to delete"),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      proposal,
    }: { id: bigint; proposal: MatrimonyProposal }) =>
      (actor as any).adminUpdateMatrimonyProposal(id, proposal),
    onSuccess: () => {
      toast.success("Proposal updated.");
      qc.invalidateQueries({ queryKey: ["adminMatrimony"] });
    },
    onError: () => toast.error("Failed to update"),
  });

  if (isLoading) {
    return (
      <p style={{ color: "#1E7A52" }} data-ocid="admin.matrimony.loading_state">
        Loading...
      </p>
    );
  }

  if (proposals.length === 0) {
    return (
      <div
        className="text-center py-8 rounded-xl"
        style={{
          backgroundColor: "#FAF7E6",
          border: "1px solid rgba(212,175,55,0.4)",
        }}
        data-ocid="admin.matrimony.empty_state"
      >
        <p className="text-2xl mb-2">💍</p>
        <p style={{ color: "#1E7A52" }}>No matrimony proposals yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-ocid="admin.matrimony.list">
      {proposals.map((p, i) => (
        <MatrimonyEditRow
          key={p.id.toString()}
          proposal={p}
          index={i + 1}
          onSave={(updated) =>
            updateMutation.mutate({ id: updated.id, proposal: updated })
          }
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      ))}
    </div>
  );
}

function MatrimonyEditRow({
  proposal,
  index,
  onSave,
  onDelete,
}: {
  proposal: MatrimonyProposal;
  index: number;
  onSave: (updated: MatrimonyProposal) => void;
  onDelete: (id: bigint) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({
    name: proposal.name,
    age: proposal.age.toString(),
    city: proposal.city,
    education: proposal.education,
    profession: proposal.profession,
    description: proposal.description,
    contact: proposal.contact,
    gender: proposal.gender as string,
  });

  const set =
    (field: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = () => {
    onSave({
      ...proposal,
      name: form.name,
      age: BigInt(Number.parseInt(form.age) || 0),
      city: form.city,
      education: form.education,
      profession: form.profession,
      description: form.description,
      contact: form.contact,
      gender: form.gender as any,
    });
    setEditing(false);
  };

  return (
    <div
      data-ocid={`admin.matrimony.item.${index}`}
      className="rounded-xl p-4"
      style={{
        backgroundColor: "#FAF7E6",
        border: "1px solid rgba(212,175,55,0.3)",
      }}
    >
      {!editing ? (
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-medium text-sm" style={{ color: "#0B5A3A" }}>
              {proposal.name}, {proposal.age.toString()}yrs — {proposal.gender}
            </p>
            <p className="text-xs" style={{ color: "#1E7A52" }}>
              {proposal.city} • {proposal.education} • {proposal.profession}
            </p>
            <p className="text-xs mt-1" style={{ color: "#555" }}>
              {proposal.description}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              onClick={() => {
                setEditing(true);
                setConfirmDelete(false);
              }}
              data-ocid={`admin.matrimony.edit_button.${index}`}
              style={{ backgroundColor: "#D4AF37", color: "#0B5A3A" }}
            >
              Edit
            </Button>
            {!confirmDelete ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setConfirmDelete(true)}
                data-ocid={`admin.matrimony.delete_button.${index}`}
              >
                Delete
              </Button>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-xs" style={{ color: "#c62828" }}>
                  Sure?
                </span>
                <Button
                  size="sm"
                  style={{ backgroundColor: "#c62828", color: "white" }}
                  onClick={() => onDelete(proposal.id)}
                  data-ocid={`admin.matrimony.confirm_button.${index}`}
                >
                  Yes
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmDelete(false)}
                  data-ocid={`admin.matrimony.cancel_button.${index}`}
                >
                  No
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm" style={{ color: "#0B5A3A" }}>
            Edit Proposal
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Name</Label>
              <Input
                value={form.name}
                onChange={set("name")}
                data-ocid={`admin.matrimony_edit.name.input.${index}`}
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Age</Label>
              <Input
                type="number"
                value={form.age}
                onChange={set("age")}
                data-ocid={`admin.matrimony_edit.age.input.${index}`}
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Gender</Label>
              <select
                value={form.gender}
                onChange={set("gender")}
                className="w-full border rounded-md px-3 py-2 text-sm"
                style={{
                  borderColor: "rgba(212,175,55,0.4)",
                  color: "#0B5A3A",
                }}
                data-ocid={`admin.matrimony_edit.gender.select.${index}`}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>City</Label>
              <Input
                value={form.city}
                onChange={set("city")}
                data-ocid={`admin.matrimony_edit.city.input.${index}`}
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Education</Label>
              <Input
                value={form.education}
                onChange={set("education")}
                data-ocid={`admin.matrimony_edit.education.input.${index}`}
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Profession</Label>
              <Input
                value={form.profession}
                onChange={set("profession")}
                data-ocid={`admin.matrimony_edit.profession.input.${index}`}
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Contact</Label>
              <Input
                value={form.contact}
                onChange={set("contact")}
                data-ocid={`admin.matrimony_edit.contact.input.${index}`}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label style={{ color: "#0B5A3A" }}>Description</Label>
              <Textarea
                value={form.description}
                onChange={set("description")}
                data-ocid={`admin.matrimony_edit.desc.textarea.${index}`}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              data-ocid={`admin.matrimony_edit.save_button.${index}`}
              style={{ backgroundColor: "#0B5A3A", color: "white" }}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(false)}
              data-ocid={`admin.matrimony_edit.cancel_button.${index}`}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Jobs Tab ─────────────────────────────────────────────────────────────
function JobsAdminTab() {
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();

  const { data: jobs = [], isLoading } = useQuery<JobPosting[]>({
    queryKey: ["adminJobs"],
    queryFn: () => actor!.getAllJobPostings(),
    enabled: !!actor && !isFetching,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: bigint) => (actor as any).adminDeleteJobPosting(id),
    onSuccess: () => {
      toast.success("Job deleted.");
      qc.invalidateQueries({ queryKey: ["adminJobs"] });
    },
    onError: () => toast.error("Failed to delete"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, job }: { id: bigint; job: JobPosting }) =>
      (actor as any).adminUpdateJobPosting(id, job),
    onSuccess: () => {
      toast.success("Job updated.");
      qc.invalidateQueries({ queryKey: ["adminJobs"] });
    },
    onError: () => toast.error("Failed to update"),
  });

  if (isLoading) {
    return (
      <p style={{ color: "#1E7A52" }} data-ocid="admin.jobs.loading_state">
        Loading...
      </p>
    );
  }

  if (jobs.length === 0) {
    return (
      <div
        className="text-center py-8 rounded-xl"
        style={{
          backgroundColor: "#FAF7E6",
          border: "1px solid rgba(212,175,55,0.4)",
        }}
        data-ocid="admin.jobs.empty_state"
      >
        <p className="text-2xl mb-2">💼</p>
        <p style={{ color: "#1E7A52" }}>No job postings yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-ocid="admin.jobs.list">
      {jobs.map((job, i) => (
        <JobEditRow
          key={job.id.toString()}
          job={job}
          index={i + 1}
          onSave={(updated) =>
            updateMutation.mutate({ id: updated.id, job: updated })
          }
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      ))}
    </div>
  );
}

function JobEditRow({
  job,
  index,
  onSave,
  onDelete,
}: {
  job: JobPosting;
  index: number;
  onSave: (updated: JobPosting) => void;
  onDelete: (id: bigint) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({
    title: job.title,
    company: job.company,
    location: job.location,
    description: job.description,
    contact: job.contact,
  });

  const set =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = () => {
    onSave({ ...job, ...form });
    setEditing(false);
  };

  return (
    <div
      data-ocid={`admin.jobs.item.${index}`}
      className="rounded-xl p-4"
      style={{
        backgroundColor: "#FAF7E6",
        border: "1px solid rgba(212,175,55,0.3)",
      }}
    >
      {!editing ? (
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-medium text-sm" style={{ color: "#0B5A3A" }}>
              {job.title} — {job.company}
            </p>
            <p className="text-xs" style={{ color: "#1E7A52" }}>
              {job.location} • {job.contact}
            </p>
            <p className="text-xs mt-1" style={{ color: "#555" }}>
              {job.description}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              onClick={() => {
                setEditing(true);
                setConfirmDelete(false);
              }}
              data-ocid={`admin.jobs.edit_button.${index}`}
              style={{ backgroundColor: "#D4AF37", color: "#0B5A3A" }}
            >
              Edit
            </Button>
            {!confirmDelete ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setConfirmDelete(true)}
                data-ocid={`admin.jobs.delete_button.${index}`}
              >
                Delete
              </Button>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-xs" style={{ color: "#c62828" }}>
                  Sure?
                </span>
                <Button
                  size="sm"
                  style={{ backgroundColor: "#c62828", color: "white" }}
                  onClick={() => onDelete(job.id)}
                  data-ocid={`admin.jobs.confirm_button.${index}`}
                >
                  Yes
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmDelete(false)}
                  data-ocid={`admin.jobs.cancel_button.${index}`}
                >
                  No
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm" style={{ color: "#0B5A3A" }}>
            Edit Job
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Title</Label>
              <Input
                value={form.title}
                onChange={set("title")}
                data-ocid={`admin.jobs_edit.title.input.${index}`}
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Company</Label>
              <Input
                value={form.company}
                onChange={set("company")}
                data-ocid={`admin.jobs_edit.company.input.${index}`}
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Location</Label>
              <Input
                value={form.location}
                onChange={set("location")}
                data-ocid={`admin.jobs_edit.location.input.${index}`}
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Contact</Label>
              <Input
                value={form.contact}
                onChange={set("contact")}
                data-ocid={`admin.jobs_edit.contact.input.${index}`}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label style={{ color: "#0B5A3A" }}>Description</Label>
              <Textarea
                value={form.description}
                onChange={set("description")}
                data-ocid={`admin.jobs_edit.desc.textarea.${index}`}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              data-ocid={`admin.jobs_edit.save_button.${index}`}
              style={{ backgroundColor: "#0B5A3A", color: "white" }}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(false)}
              data-ocid={`admin.jobs_edit.cancel_button.${index}`}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Masjid Edit Row ─────────────────────────────────────────────────────────
interface EditMasjidForm {
  masjidName: string;
  address: string;
  city: string;
  state: string;
  contactPerson: string;
  phone: string;
  email: string;
  registrationNumber: string;
  capacity: string;
  upiId: string;
  presidentName: string;
  presidentPhone: string;
  secretaryName: string;
  secretaryPhone: string;
  treasurerName: string;
  treasurerPhone: string;
}

function MasjidEditRow({
  m,
  onSave,
  onDelete,
}: {
  m: LocalMasjidProfile;
  onSave: (id: bigint, profile: LocalMasjidProfile) => void;
  onDelete: (id: bigint) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState<EditMasjidForm>({
    masjidName: m.masjidName,
    address: m.address,
    city: m.city,
    state: m.state,
    contactPerson: m.contactPerson,
    phone: m.phone,
    email: m.email,
    registrationNumber: m.registrationNumber,
    capacity: m.capacity.toString(),
    upiId: m.upiId || "",
    presidentName: m.presidentName || "",
    presidentPhone: m.presidentPhone || "",
    secretaryName: m.secretaryName || "",
    secretaryPhone: m.secretaryPhone || "",
    treasurerName: m.treasurerName || "",
    treasurerPhone: m.treasurerPhone || "",
  });

  const set =
    (field: keyof EditMasjidForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = () => {
    onSave(m.id, {
      ...m,
      masjidName: form.masjidName,
      address: form.address,
      city: form.city,
      state: form.state,
      contactPerson: form.contactPerson,
      phone: form.phone,
      email: form.email,
      registrationNumber: form.registrationNumber,
      capacity: BigInt(Number.parseInt(form.capacity) || 0),
      upiId: form.upiId,
      presidentName: form.presidentName,
      presidentPhone: form.presidentPhone,
      secretaryName: form.secretaryName,
      secretaryPhone: form.secretaryPhone,
      treasurerName: form.treasurerName,
      treasurerPhone: form.treasurerPhone,
    });
    setEditing(false);
  };

  return (
    <div
      className="rounded-xl p-5"
      style={{
        backgroundColor: "#FAF7E6",
        border: "1px solid rgba(212,175,55,0.4)",
      }}
    >
      {!editing ? (
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="font-semibold" style={{ color: "#0B5A3A" }}>
              {m.masjidName}
            </p>
            <p className="text-sm" style={{ color: "#1E7A52" }}>
              {m.address}, {m.city}, {m.state}
            </p>
            <p className="text-xs mt-1" style={{ color: "#1E7A52" }}>
              {m.contactPerson} · {m.phone} · {m.email}
            </p>
            {m.upiId && (
              <p className="text-xs" style={{ color: "#1E7A52" }}>
                UPI: {m.upiId}
              </p>
            )}
            {(m.masjidRegistrationId || m.utrNumber) && (
              <div className="mt-1 space-y-0.5">
                {m.masjidRegistrationId && (
                  <p className="text-xs" style={{ color: "#0B5A3A" }}>
                    Reg ID: <strong>{m.masjidRegistrationId}</strong>
                  </p>
                )}
                {m.utrNumber && (
                  <p className="text-xs" style={{ color: "#1E7A52" }}>
                    UTR: {m.utrNumber}
                  </p>
                )}
              </div>
            )}
            {(m.presidentName || m.secretaryName || m.treasurerName) && (
              <div className="mt-1 text-xs" style={{ color: "#555" }}>
                {m.presidentName && (
                  <span>
                    President: {m.presidentName} ({m.presidentPhone}) ·{" "}
                  </span>
                )}
                {m.secretaryName && (
                  <span>
                    Secretary: {m.secretaryName} ({m.secretaryPhone}) ·{" "}
                  </span>
                )}
                {m.treasurerName && (
                  <span>
                    Treasurer: {m.treasurerName} ({m.treasurerPhone})
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge
              style={{
                backgroundColor: masjidStatusColor(m.status),
                color: "white",
              }}
            >
              {m.status}
            </Badge>
            <Button
              size="sm"
              onClick={() => {
                setEditing(true);
                setConfirmDelete(false);
              }}
              data-ocid="admin.masjid.edit_button"
              style={{ backgroundColor: "#D4AF37", color: "#0B5A3A" }}
            >
              Edit
            </Button>
            {!confirmDelete ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setConfirmDelete(true)}
                data-ocid="admin.masjid.delete_button"
              >
                Delete
              </Button>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-xs" style={{ color: "#c62828" }}>
                  Sure?
                </span>
                <Button
                  size="sm"
                  style={{ backgroundColor: "#c62828", color: "white" }}
                  onClick={() => onDelete(m.id)}
                  data-ocid="admin.masjid.confirm_button"
                >
                  Yes
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmDelete(false)}
                  data-ocid="admin.masjid.cancel_button"
                >
                  No
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <h4 className="font-semibold" style={{ color: "#0B5A3A" }}>
            Editing: {m.masjidName}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Masjid Name</Label>
              <Input
                value={form.masjidName}
                onChange={set("masjidName")}
                data-ocid="admin.edit_masjid.name.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Address</Label>
              <Input
                value={form.address}
                onChange={set("address")}
                data-ocid="admin.edit_masjid.address.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>City</Label>
              <Input
                value={form.city}
                onChange={set("city")}
                data-ocid="admin.edit_masjid.city.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>State</Label>
              <Input
                value={form.state}
                onChange={set("state")}
                data-ocid="admin.edit_masjid.state.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Contact Person</Label>
              <Input
                value={form.contactPerson}
                onChange={set("contactPerson")}
                data-ocid="admin.edit_masjid.contact.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Phone</Label>
              <Input
                value={form.phone}
                onChange={set("phone")}
                data-ocid="admin.edit_masjid.phone.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={set("email")}
                data-ocid="admin.edit_masjid.email.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Reg Number</Label>
              <Input
                value={form.registrationNumber}
                onChange={set("registrationNumber")}
                data-ocid="admin.edit_masjid.reg_number.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Capacity</Label>
              <Input
                type="number"
                value={form.capacity}
                onChange={set("capacity")}
                data-ocid="admin.edit_masjid.capacity.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>UPI ID</Label>
              <Input
                value={form.upiId}
                onChange={set("upiId")}
                placeholder="example@upi"
                data-ocid="admin.edit_masjid.upi.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>President Name</Label>
              <Input
                value={form.presidentName}
                onChange={set("presidentName")}
                data-ocid="admin.edit_masjid.president_name.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>President Phone</Label>
              <Input
                value={form.presidentPhone}
                onChange={set("presidentPhone")}
                data-ocid="admin.edit_masjid.president_phone.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Secretary Name</Label>
              <Input
                value={form.secretaryName}
                onChange={set("secretaryName")}
                data-ocid="admin.edit_masjid.secretary_name.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Secretary Phone</Label>
              <Input
                value={form.secretaryPhone}
                onChange={set("secretaryPhone")}
                data-ocid="admin.edit_masjid.secretary_phone.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Treasurer Name</Label>
              <Input
                value={form.treasurerName}
                onChange={set("treasurerName")}
                data-ocid="admin.edit_masjid.treasurer_name.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Treasurer Phone</Label>
              <Input
                value={form.treasurerPhone}
                onChange={set("treasurerPhone")}
                data-ocid="admin.edit_masjid.treasurer_phone.input"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label style={{ color: "#555" }}>UTR Number (read-only)</Label>
              <Input
                value={m.utrNumber || "—"}
                readOnly
                className="bg-gray-50 text-gray-500"
                data-ocid="admin.edit_masjid.utr.input"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label style={{ color: "#555" }}>
                Registration ID (read-only)
              </Label>
              <Input
                value={m.masjidRegistrationId || "—"}
                readOnly
                className="bg-gray-50 text-gray-500"
                data-ocid="admin.edit_masjid.reg_id.input"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              onClick={handleSave}
              data-ocid="admin.edit_masjid.save_button"
              style={{ backgroundColor: "#0B5A3A", color: "white" }}
            >
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={() => setEditing(false)}
              data-ocid="admin.edit_masjid.cancel_button"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Zakat Profiles Admin Tab ─────────────────────────────────────────────
function ZakatProfilesAdminTab() {
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();
  const [editAmounts, setEditAmounts] = useState<Record<string, string>>({});

  const { data: profiles = [], isLoading } = useQuery<LocalZakatProfile[]>({
    queryKey: ["allZakatProfiles"],
    queryFn: () => (actor as any).getAllZakatProfiles(),
    enabled: !!actor && !isFetching,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: bigint) => (actor as any).deleteZakatProfile(id),
    onSuccess: () => {
      toast.success("Profile deleted.");
      qc.invalidateQueries({ queryKey: ["allZakatProfiles"] });
    },
    onError: () => toast.error("Failed to delete"),
  });

  const fulfillMutation = useMutation({
    mutationFn: (id: bigint) => (actor as any).markZakatProfileFulfilled(id),
    onSuccess: () => {
      toast.success("Marked fulfilled!");
      qc.invalidateQueries({ queryKey: ["allZakatProfiles"] });
    },
    onError: () => toast.error("Failed"),
  });

  const updateAmountMutation = useMutation({
    mutationFn: ({ id, amount }: { id: bigint; amount: number }) =>
      (actor as any).updateZakatCollectedAmount(id, amount),
    onSuccess: () => {
      toast.success("Amount updated!");
      qc.invalidateQueries({ queryKey: ["allZakatProfiles"] });
    },
    onError: () => toast.error("Failed to update amount"),
  });

  if (isLoading) {
    return (
      <p
        style={{ color: "#1E7A52" }}
        data-ocid="admin.zakat_profiles.loading_state"
      >
        Loading...
      </p>
    );
  }

  if (profiles.length === 0) {
    return (
      <div
        className="text-center py-8 rounded-xl"
        style={{
          backgroundColor: "#FAF7E6",
          border: "1px solid rgba(212,175,55,0.4)",
        }}
        data-ocid="admin.zakat_profiles.empty_state"
      >
        <p className="text-2xl mb-2">🤲</p>
        <p style={{ color: "#1E7A52" }}>No Zakat profiles yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-ocid="admin.zakat_profiles.list">
      {profiles.map((p, i) => {
        const pct =
          p.requiredAmount > 0
            ? Math.min(
                100,
                Math.round((p.collectedAmount / p.requiredAmount) * 100),
              )
            : 0;
        const key = p.id.toString();
        return (
          <div
            key={key}
            data-ocid={`admin.zakat_profiles.item.${i + 1}`}
            className="rounded-xl p-5"
            style={{
              backgroundColor: "#FAF7E6",
              border: "1px solid rgba(212,175,55,0.4)",
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold" style={{ color: "#0B5A3A" }}>
                  {p.personName}
                </p>
                <p className="text-xs" style={{ color: "#1E7A52" }}>
                  Masjid #{p.masjidId.toString()} · UPI: {p.upiId || "—"}
                </p>
              </div>
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
            <div className="mb-3">
              <div
                className="flex justify-between text-xs mb-1"
                style={{ color: "#0B5A3A" }}
              >
                <span>
                  Collected: ₹{p.collectedAmount.toLocaleString("en-IN")}
                </span>
                <span>
                  Required: ₹{p.requiredAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <Progress value={pct} className="h-2" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Input
                type="number"
                min="0"
                placeholder="Update collected amount"
                value={editAmounts[key] ?? ""}
                onChange={(e) =>
                  setEditAmounts((prev) => ({ ...prev, [key]: e.target.value }))
                }
                className="max-w-48"
                data-ocid={`admin.zakat_profiles.amount.input.${i + 1}`}
              />
              <Button
                size="sm"
                onClick={() => {
                  const amount = Number.parseFloat(editAmounts[key] || "0");
                  updateAmountMutation.mutate({ id: p.id, amount });
                  setEditAmounts((prev) => ({ ...prev, [key]: "" }));
                }}
                data-ocid={`admin.zakat_profiles.update.button.${i + 1}`}
                style={{ backgroundColor: "#D4AF37", color: "#0B5A3A" }}
              >
                Update Amount
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => fulfillMutation.mutate(p.id)}
                disabled={p.status === "fulfilled"}
                data-ocid={`admin.zakat_profiles.fulfill.button.${i + 1}`}
                style={{ backgroundColor: "#1E7A52", color: "white" }}
              >
                Mark Fulfilled
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteMutation.mutate(p.id)}
                data-ocid={`admin.zakat_profiles.delete_button.${i + 1}`}
              >
                Delete
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Admin Management Tab ─────────────────────────────────────────────────
function AdminManagementTab() {
  const { actor } = useActor();
  const [principalInput, setPrincipalInput] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "user">("admin");
  const [resetToken, setResetToken] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  const assignRole = useMutation({
    mutationFn: async () => {
      const { Principal } = await import("@icp-sdk/core/principal");
      const p = Principal.fromText(principalInput.trim());
      const role = selectedRole === "admin" ? UserRole.admin : UserRole.user;
      return actor!.assignCallerUserRole(p, role);
    },
    onSuccess: () => {
      toast.success("Role assigned successfully!");
      setPrincipalInput("");
    },
    onError: (e: any) => toast.error(e?.message || "Failed to assign role"),
  });

  const resetAllRoles = useMutation({
    mutationFn: async () => {
      return (actor as any).resetAllRolesWithToken(resetToken.trim());
    },
    onSuccess: () => {
      toast.success("All roles reset. The next login will claim admin.");
      setResetToken("");
      setConfirmReset(false);
    },
    onError: (e: any) =>
      toast.error(e?.message || "Failed to reset roles. Check your token."),
  });

  return (
    <div className="max-w-md space-y-6" data-ocid="admin.admin_mgmt.form">
      <div
        className="rounded-xl p-6 space-y-4"
        style={{
          backgroundColor: "#FAF7E6",
          border: "1px solid rgba(212,175,55,0.4)",
        }}
      >
        <h3 className="font-semibold" style={{ color: "#0B5A3A" }}>
          🔑 Assign Admin or User Role
        </h3>
        <p className="text-xs" style={{ color: "#555" }}>
          Ask the person to log in, go to their profile, and share their
          Principal ID.
        </p>
        <div className="space-y-1">
          <Label style={{ color: "#0B5A3A" }}>Principal ID</Label>
          <Input
            placeholder="e.g. aaaaa-aa or xlmdg-vqaaa-..."
            value={principalInput}
            onChange={(e) => setPrincipalInput(e.target.value)}
            data-ocid="admin.admin_mgmt.principal.input"
          />
        </div>
        <div className="space-y-1">
          <Label style={{ color: "#0B5A3A" }}>Role to Assign</Label>
          <select
            value={selectedRole}
            onChange={(e) =>
              setSelectedRole(e.target.value as "admin" | "user")
            }
            className="w-full border rounded-md px-3 py-2 text-sm"
            style={{ borderColor: "rgba(212,175,55,0.4)", color: "#0B5A3A" }}
            data-ocid="admin.admin_mgmt.role.select"
          >
            <option value="admin">Admin (Super Admin)</option>
            <option value="user">User (Regular User)</option>
          </select>
        </div>
        <Button
          onClick={() => assignRole.mutate()}
          disabled={!principalInput.trim() || assignRole.isPending}
          style={{ backgroundColor: "#0B5A3A", color: "white" }}
          data-ocid="admin.admin_mgmt.assign.button"
        >
          {assignRole.isPending ? "Assigning..." : "Assign Role"}
        </Button>
      </div>

      <div
        className="rounded-xl p-5"
        style={{
          backgroundColor: "#E8F5E9",
          border: "1px solid rgba(30,122,82,0.3)",
        }}
      >
        <h4 className="font-semibold mb-2 text-sm" style={{ color: "#0B5A3A" }}>
          📋 How to find a Principal ID
        </h4>
        <ol className="text-xs space-y-1" style={{ color: "#333" }}>
          <li>
            1. Ask the person to log into the app using Internet Identity.
          </li>
          <li>2. Their Principal ID appears in the header after login.</li>
          <li>3. They copy and share it with you.</li>
          <li>4. Paste it above and assign the desired role.</li>
        </ol>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1.5px solid #c62828" }}
        data-ocid="admin.danger_zone.panel"
      >
        <div
          className="flex items-center gap-2 px-5 py-3"
          style={{ backgroundColor: "#c62828" }}
        >
          <AlertTriangle className="h-4 w-4 text-white flex-shrink-0" />
          <h3 className="font-bold text-white text-sm tracking-wide">
            DANGER ZONE — Reset All Roles
          </h3>
        </div>
        <div className="p-5 space-y-4" style={{ backgroundColor: "#fff5f5" }}>
          <p className="text-xs leading-relaxed" style={{ color: "#7f1d1d" }}>
            ⚠️ This will{" "}
            <strong>permanently remove ALL admin and user roles</strong> from
            the system. The very next person who logs in will become the new
            Admin. This cannot be undone.
          </p>
          <div className="space-y-1">
            <Label style={{ color: "#7f1d1d" }}>Reset Token</Label>
            <Input
              type="password"
              placeholder="Enter reset token"
              value={resetToken}
              onChange={(e) => {
                setResetToken(e.target.value);
                setConfirmReset(false);
              }}
              style={{ borderColor: "#fca5a5", backgroundColor: "white" }}
              data-ocid="admin.danger_zone.input"
            />
          </div>
          {!confirmReset ? (
            <Button
              variant="outline"
              disabled={!resetToken.trim()}
              onClick={() => setConfirmReset(true)}
              className="w-full font-semibold"
              style={{
                borderColor: "#c62828",
                color: "#c62828",
                backgroundColor: "transparent",
              }}
              data-ocid="admin.danger_zone.button"
            >
              Reset All Roles
            </Button>
          ) : (
            <div
              className="rounded-lg p-4 space-y-3"
              style={{
                backgroundColor: "#fee2e2",
                border: "1px solid #fca5a5",
              }}
              data-ocid="admin.danger_zone.dialog"
            >
              <p className="text-xs font-semibold" style={{ color: "#7f1d1d" }}>
                Are you absolutely sure? This will log out all admins
                immediately.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={resetAllRoles.isPending}
                  onClick={() => resetAllRoles.mutate()}
                  className="font-semibold"
                  style={{ backgroundColor: "#c62828", color: "white" }}
                  data-ocid="admin.danger_zone.confirm_button"
                >
                  {resetAllRoles.isPending
                    ? "Resetting..."
                    : "Yes, Reset All Roles"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmReset(false)}
                  data-ocid="admin.danger_zone.cancel_button"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Registration Settings Card ──────────────────────────────────────────────
function RegistrationSettingsCard() {
  const { actor, isFetching } = useActor();
  const [upiId, setUpiId] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

  useEffect(() => {
    if (!actor || isFetching || loaded) return;
    actor
      .getRegistrationSettings()
      .then((result) => {
        let settings: { upiId: string; feeAmount: bigint } | null = null;
        if (Array.isArray(result)) {
          settings =
            result.length > 0
              ? (result[0] as { upiId: string; feeAmount: bigint })
              : null;
        } else {
          settings = (result as { upiId: string; feeAmount: bigint }) ?? null;
        }
        if (settings) {
          setUpiId(settings.upiId);
          setFeeAmount(settings.feeAmount.toString());
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [actor, isFetching, loaded]);

  const handleSaveSettings = async () => {
    if (!actor) return;
    setSaving(true);
    setSaveStatus("idle");
    try {
      const amount = Number.parseInt(feeAmount) || 0;
      await actor.setRegistrationSettings(upiId, BigInt(amount));
      setSaveStatus("success");
      toast.success("Registration settings saved!");
      setTimeout(() => setSaveStatus("idle"), 4000);
    } catch {
      setSaveStatus("error");
      toast.error("Failed to save settings.");
      setTimeout(() => setSaveStatus("idle"), 4000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="rounded-xl p-5 mb-6"
      style={{
        backgroundColor: "#FFFDF0",
        border: "2px solid #D4AF37",
      }}
      data-ocid="admin.reg_settings.card"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">💳</span>
        <h3
          className="font-bold text-base"
          style={{ color: "#0B5A3A", fontFamily: "'Playfair Display', serif" }}
        >
          Registration Payment Settings
        </h3>
      </div>
      <p className="text-xs mb-4" style={{ color: "#1E7A52" }}>
        Set the UPI ID and fee amount that will be displayed to Masjids during
        registration.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label style={{ color: "#0B5A3A" }}>
            UPI ID for Registration Payment
          </Label>
          <Input
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="example@upi"
            data-ocid="admin.reg_settings.upi.input"
          />
        </div>
        <div className="space-y-1">
          <Label style={{ color: "#0B5A3A" }}>
            Registration Fee Amount (₹)
          </Label>
          <Input
            type="number"
            min="0"
            value={feeAmount}
            onChange={(e) => setFeeAmount(e.target.value)}
            placeholder="500"
            data-ocid="admin.reg_settings.fee.input"
          />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <Button
          onClick={handleSaveSettings}
          disabled={!upiId.trim() || !feeAmount.trim() || saving}
          data-ocid="admin.reg_settings.save_button"
          style={{ backgroundColor: "#0B5A3A", color: "white" }}
        >
          {saving ? "Saving..." : "Save Settings"}
        </Button>
        {saveStatus === "success" && (
          <span className="text-sm font-medium" style={{ color: "#0B5A3A" }}>
            ✅ Settings saved successfully!
          </span>
        )}
        {saveStatus === "error" && (
          <span className="text-sm font-medium" style={{ color: "#c0392b" }}>
            ❌ Failed to save. Please try again.
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Access Denied Screen ─────────────────────────────────────────────────
function AccessDeniedScreen({
  actor,
  isAuthenticated,
  qc,
}: {
  actor: any;
  isAuthenticated: boolean;
  qc: ReturnType<typeof useQueryClient>;
}) {
  const [claimToken, setClaimToken] = useState("");
  const [tokenVerified, setTokenVerified] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  const { data: adminAssigned, isLoading: checkingAdmin } = useQuery({
    queryKey: ["isAdminAssigned"],
    queryFn: () => actor.isAdminAssigned() as Promise<boolean>,
    enabled: !!actor,
    retry: false,
  });

  const claimAdminMutation = useMutation({
    mutationFn: () => {
      if (!actor) throw new Error("Not connected to backend");
      return actor.claimAdminIfUnassigned() as Promise<boolean>;
    },
    onSuccess: (result: boolean) => {
      if (result) {
        toast.success("You are now the admin! Reloading...");
        qc.invalidateQueries({ queryKey: ["isAdmin"] });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error("Could not claim admin. An admin may already be assigned.");
      }
    },
    onError: () => toast.error("Failed to claim admin role."),
  });

  const handleVerifyToken = () => {
    if (claimToken.trim() === ADMIN_CLAIM_TOKEN) {
      setTokenVerified(true);
      setTokenError(false);
    } else {
      setTokenError(true);
      setTokenVerified(false);
    }
  };

  if (checkingAdmin && isAuthenticated) {
    return (
      <div
        className="max-w-xl mx-auto px-4 py-12 text-center"
        data-ocid="admin.loading_state"
        style={{ color: "#1E7A52" }}
      >
        Checking system status...
      </div>
    );
  }

  if (!adminAssigned) {
    return (
      <div
        className="max-w-xl mx-auto px-4 py-12 text-center space-y-4"
        data-ocid="admin.claim_admin.panel"
      >
        <div
          className="rounded-xl p-8"
          style={{
            backgroundColor: "#FAF7E6",
            border: "1px solid rgba(212,175,55,0.4)",
          }}
        >
          <p className="text-3xl mb-4">🕌</p>
          <h2
            className="text-xl font-bold mb-2"
            style={{
              color: "#0B5A3A",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Claim Admin Role
          </h2>
          <p className="text-sm mb-6" style={{ color: "#1E7A52" }}>
            Enter the secret reset token to proceed.
          </p>
          {!tokenVerified ? (
            <div className="space-y-3 text-left">
              <div className="space-y-1">
                <Label style={{ color: "#0B5A3A" }}>Secret Token</Label>
                <Input
                  type="password"
                  placeholder="Enter secret token"
                  value={claimToken}
                  onChange={(e) => {
                    setClaimToken(e.target.value);
                    setTokenError(false);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyToken()}
                  data-ocid="admin.claim_admin.token.input"
                  style={{ borderColor: tokenError ? "#c62828" : undefined }}
                />
                {tokenError && (
                  <p className="text-xs" style={{ color: "#c62828" }}>
                    Invalid token. Please check and try again.
                  </p>
                )}
              </div>
              <Button
                onClick={handleVerifyToken}
                disabled={!claimToken.trim()}
                className="w-full"
                data-ocid="admin.claim_admin.verify_button"
                style={{ backgroundColor: "#0B5A3A", color: "white" }}
              >
                Verify Token
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                className="rounded-lg px-4 py-2 text-sm"
                style={{
                  backgroundColor: "#E8F5E9",
                  color: "#1E7A52",
                  border: "1px solid rgba(30,122,82,0.3)",
                }}
              >
                ✓ Token verified. You may now claim admin.
              </div>
              <Button
                onClick={() => claimAdminMutation.mutate()}
                disabled={claimAdminMutation.isPending}
                className="w-full"
                data-ocid="admin.claim_admin.primary_button"
                style={{
                  backgroundColor: "#0B5A3A",
                  color: "white",
                  padding: "0.75rem 2rem",
                }}
              >
                {claimAdminMutation.isPending
                  ? "Claiming..."
                  : "Claim Admin Role"}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="max-w-xl mx-auto px-4 py-12 text-center"
      data-ocid="admin.error_state"
    >
      <div
        className="rounded-xl p-8"
        style={{
          backgroundColor: "#FAF7E6",
          border: "1px solid rgba(212,175,55,0.4)",
        }}
      >
        <p className="text-3xl mb-3">🔒</p>
        <p className="text-lg font-semibold" style={{ color: "#c62828" }}>
          Access Denied
        </p>
        <p className="text-sm mt-2" style={{ color: "#1E7A52" }}>
          An admin is already assigned. Contact the current admin to be granted
          access.
        </p>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────
export default function AdminPage() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const qc = useQueryClient();
  const [zakatForm, setZakatForm] = useState<ZakatSettings>({
    goldRatePerGram: 6000,
    silverRatePerGram: 75,
    nisabGoldGrams: 87.48,
    nisabSilverGrams: 612.36,
  });

  const { data: isAdmin, isLoading: adminLoading } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: () => actor!.isCallerAdmin().catch(() => false),
    enabled: !!actor && isAuthenticated,
    retry: false,
  });

  const { data: pending = [] } = useQuery<NikahRegistration[]>({
    queryKey: ["pending"],
    queryFn: () => actor!.getPendingNikahRegistrations(),
    enabled: !!actor && !!isAdmin,
  });

  const { data: all = [] } = useQuery<NikahRegistration[]>({
    queryKey: ["all-regs"],
    queryFn: () => actor!.getAllNikahRegistrations(),
    enabled: !!actor && !!isAdmin,
  });

  const { data: pendingMasjids = [] } = useQuery<LocalMasjidProfile[]>({
    queryKey: ["pendingMasjids"],
    queryFn: () => actor!.getPendingMasjidRegistrations() as any,
    enabled: !!actor && !!isAdmin,
  });

  const { data: allMasjids = [] } = useQuery<LocalMasjidProfile[]>({
    queryKey: ["allMasjids"],
    queryFn: () => actor!.getAllMasjidRegistrations() as any,
    enabled: !!actor && !!isAdmin,
  });

  const { data: zakatSettings } = useQuery<ZakatSettings | null>({
    queryKey: ["zakatSettings"],
    queryFn: () => actor!.getZakatSettings(),
    enabled: !!actor && !!isAdmin,
    select: (data) => {
      if (data) setZakatForm(data);
      return data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: bigint) => actor!.approveNikahRegistration(id),
    onSuccess: () => {
      toast.success("Approved!");
      qc.invalidateQueries({ queryKey: ["pending"] });
      qc.invalidateQueries({ queryKey: ["all-regs"] });
    },
    onError: () => toast.error("Failed to approve"),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: bigint) => actor!.rejectNikahRegistration(id),
    onSuccess: () => {
      toast.success("Rejected.");
      qc.invalidateQueries({ queryKey: ["pending"] });
      qc.invalidateQueries({ queryKey: ["all-regs"] });
    },
    onError: () => toast.error("Failed to reject"),
  });

  const approveMasjidMutation = useMutation({
    mutationFn: (id: bigint) => actor!.approveMasjidRegistration(id),
    onSuccess: () => {
      toast.success("Masjid approved!");
      qc.invalidateQueries({ queryKey: ["pendingMasjids"] });
      qc.invalidateQueries({ queryKey: ["allMasjids"] });
    },
    onError: () => toast.error("Failed to approve"),
  });

  const rejectMasjidMutation = useMutation({
    mutationFn: (id: bigint) => actor!.rejectMasjidRegistration(id),
    onSuccess: () => {
      toast.success("Masjid rejected.");
      qc.invalidateQueries({ queryKey: ["pendingMasjids"] });
      qc.invalidateQueries({ queryKey: ["allMasjids"] });
    },
    onError: () => toast.error("Failed to reject"),
  });

  const updateZakat = useMutation({
    mutationFn: () => actor!.updateZakatSettings(zakatForm),
    onSuccess: () => {
      toast.success("Zakat settings saved!");
      qc.invalidateQueries({ queryKey: ["zakatSettings"] });
    },
    onError: () => toast.error("Failed to save"),
  });

  const adminUpdateMasjidMutation = useMutation({
    mutationFn: ({
      id,
      profile,
    }: { id: bigint; profile: LocalMasjidProfile }) =>
      (actor as any).adminUpdateMasjidProfile(id, profile as any),
    onSuccess: () => {
      toast.success("Masjid updated!");
      qc.invalidateQueries({ queryKey: ["allMasjids"] });
      qc.invalidateQueries({ queryKey: ["pendingMasjids"] });
    },
    onError: () => toast.error("Failed to update Masjid"),
  });

  const adminDeleteMasjidMutation = useMutation({
    mutationFn: (id: bigint) =>
      (actor as any).adminDeleteMasjidRegistration(id),
    onSuccess: () => {
      toast.success("Masjid deleted.");
      qc.invalidateQueries({ queryKey: ["allMasjids"] });
      qc.invalidateQueries({ queryKey: ["pendingMasjids"] });
    },
    onError: () => toast.error("Failed to delete Masjid"),
  });

  const adminDeleteNikahMutation = useMutation({
    mutationFn: (id: bigint) => (actor as any).adminDeleteNikahRegistration(id),
    onSuccess: () => {
      toast.success("Nikah registration deleted.");
      qc.invalidateQueries({ queryKey: ["all-regs"] });
      qc.invalidateQueries({ queryKey: ["pending"] });
    },
    onError: () => toast.error("Failed to delete registration"),
  });

  const adminUpdateNikahMutation = useMutation({
    mutationFn: ({ id, reg }: { id: bigint; reg: NikahRegistration }) =>
      (actor as any).adminUpdateNikahRegistration(id, reg),
    onSuccess: () => {
      toast.success("Registration updated.");
      qc.invalidateQueries({ queryKey: ["all-regs"] });
      qc.invalidateQueries({ queryKey: ["pending"] });
    },
    onError: () => toast.error("Failed to update registration"),
  });

  if (!isAuthenticated) {
    return (
      <div
        className="max-w-xl mx-auto px-4 py-12 text-center"
        data-ocid="admin.error_state"
      >
        <p style={{ color: "#0B5A3A" }} className="text-lg font-semibold">
          Please login to access admin panel
        </p>
      </div>
    );
  }

  if (!actor || actorFetching) {
    return (
      <div
        className="text-center py-12"
        data-ocid="admin.loading_state"
        style={{ color: "#1E7A52" }}
      >
        Connecting...
      </div>
    );
  }

  if (adminLoading) {
    return (
      <div
        className="text-center py-12"
        data-ocid="admin.loading_state"
        style={{ color: "#1E7A52" }}
      >
        Checking access...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <AccessDeniedScreen
        actor={actor}
        isAuthenticated={isAuthenticated}
        qc={qc}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "'Playfair Display', serif", color: "#0B5A3A" }}
      >
        Admin Panel
      </h2>

      <Tabs defaultValue="pending" data-ocid="admin.panel">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="pending" data-ocid="admin.pending.tab">
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="all" data-ocid="admin.all.tab">
            All Nikah
          </TabsTrigger>
          <TabsTrigger value="matrimony" data-ocid="admin.matrimony.tab">
            Matrimony
          </TabsTrigger>
          <TabsTrigger value="jobs" data-ocid="admin.jobs.tab">
            Jobs
          </TabsTrigger>
          <TabsTrigger value="masjids" data-ocid="admin.masjids.tab">
            Masjid Applications ({pendingMasjids.length})
          </TabsTrigger>
          <TabsTrigger
            value="zakat_profiles"
            data-ocid="admin.zakat_profiles.tab"
          >
            Zakat Profiles
          </TabsTrigger>
          <TabsTrigger value="zakat" data-ocid="admin.zakat.tab">
            Zakat Settings
          </TabsTrigger>
          <TabsTrigger value="admin_mgmt" data-ocid="admin.admin_mgmt.tab">
            Admin Management
          </TabsTrigger>
        </TabsList>

        {/* Pending Nikah */}
        <TabsContent value="pending" data-ocid="admin.pending.panel">
          {pending.length === 0 ? (
            <p
              style={{ color: "#1E7A52" }}
              data-ocid="admin.pending.empty_state"
            >
              No pending registrations.
            </p>
          ) : (
            <div className="space-y-4">
              {pending.map((reg, i) => (
                <div
                  key={reg.id.toString()}
                  data-ocid={`admin.pending.item.${i + 1}`}
                  className="rounded-xl p-5"
                  style={{
                    backgroundColor: "#FAF7E6",
                    border: "1px solid rgba(212,175,55,0.4)",
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold" style={{ color: "#0B5A3A" }}>
                        ID: {reg.id.toString()} — {reg.brideName} &amp;{" "}
                        {reg.groomName}
                      </p>
                      <p className="text-sm" style={{ color: "#1E7A52" }}>
                        {reg.city} • {reg.nikahDate} • Qazi: {reg.qaziName}
                      </p>
                    </div>
                    <Badge
                      style={{
                        backgroundColor: statusColor(reg.status),
                        color: "white",
                      }}
                    >
                      {reg.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(reg.id)}
                      data-ocid={`admin.approve.button.${i + 1}`}
                      style={{ backgroundColor: "#1E7A52", color: "white" }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectMutation.mutate(reg.id)}
                      data-ocid={`admin.reject.button.${i + 1}`}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* All Nikah Registrations — with edit/delete */}
        <TabsContent value="all" data-ocid="admin.all.panel">
          <div className="space-y-3">
            {all.map((reg) => (
              <NikahEditRow
                key={reg.id.toString()}
                reg={reg}
                onSave={(updated) =>
                  adminUpdateNikahMutation.mutate({
                    id: updated.id,
                    reg: updated,
                  })
                }
                onDelete={(id) => adminDeleteNikahMutation.mutate(id)}
              />
            ))}
            {all.length === 0 && (
              <p style={{ color: "#1E7A52" }} data-ocid="admin.all.empty_state">
                No registrations yet.
              </p>
            )}
          </div>
        </TabsContent>

        {/* Matrimony */}
        <TabsContent value="matrimony" data-ocid="admin.matrimony.panel">
          <h3 className="font-semibold mb-4" style={{ color: "#0B5A3A" }}>
            💍 All Matrimony Proposals
          </h3>
          <MatrimonyAdminTab />
        </TabsContent>

        {/* Jobs */}
        <TabsContent value="jobs" data-ocid="admin.jobs.panel">
          <h3 className="font-semibold mb-4" style={{ color: "#0B5A3A" }}>
            💼 All Job Postings
          </h3>
          <JobsAdminTab />
        </TabsContent>

        {/* Masjid Applications */}
        <TabsContent value="masjids" data-ocid="admin.masjids.panel">
          <RegistrationSettingsCard />
          <h3 className="font-semibold mb-3" style={{ color: "#0B5A3A" }}>
            Pending Applications
          </h3>
          {pendingMasjids.length === 0 ? (
            <p
              style={{ color: "#1E7A52" }}
              data-ocid="admin.masjids.empty_state"
            >
              No pending Masjid applications.
            </p>
          ) : (
            <div className="space-y-4 mb-8">
              {pendingMasjids.map((m, i) => (
                <div
                  key={m.id.toString()}
                  data-ocid={`admin.masjids.item.${i + 1}`}
                  className="rounded-xl p-5"
                  style={{
                    backgroundColor: "#FAF7E6",
                    border: "1px solid rgba(212,175,55,0.4)",
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold" style={{ color: "#0B5A3A" }}>
                        {m.masjidName}
                      </p>
                      <p className="text-sm" style={{ color: "#1E7A52" }}>
                        {m.address}, {m.city}, {m.state}
                      </p>
                      <p className="text-xs mt-1" style={{ color: "#1E7A52" }}>
                        Contact: {m.contactPerson} · {m.phone} · {m.email}
                      </p>
                      <p className="text-xs" style={{ color: "#1E7A52" }}>
                        Reg#: {m.registrationNumber} · Capacity:{" "}
                        {m.capacity.toString()}
                      </p>
                      {m.upiId && (
                        <p className="text-xs" style={{ color: "#1E7A52" }}>
                          UPI: {m.upiId}
                        </p>
                      )}
                      {m.utrNumber && (
                        <p
                          className="text-xs font-medium"
                          style={{ color: "#0B5A3A" }}
                        >
                          UTR: {m.utrNumber}
                        </p>
                      )}
                      {m.masjidRegistrationId && (
                        <p
                          className="text-xs font-medium"
                          style={{ color: "#0B5A3A" }}
                        >
                          Reg ID: {m.masjidRegistrationId}
                        </p>
                      )}
                      {(m.presidentName ||
                        m.secretaryName ||
                        m.treasurerName) && (
                        <div className="mt-1 text-xs" style={{ color: "#555" }}>
                          {m.presidentName && (
                            <span>
                              Pres: {m.presidentName} ({m.presidentPhone}) |{" "}
                            </span>
                          )}
                          {m.secretaryName && (
                            <span>
                              Sec: {m.secretaryName} ({m.secretaryPhone}) |{" "}
                            </span>
                          )}
                          {m.treasurerName && (
                            <span>
                              Treas: {m.treasurerName} ({m.treasurerPhone})
                            </span>
                          )}
                        </div>
                      )}
                      {m.facilities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {m.facilities.map((f) => (
                            <span
                              key={f}
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: "#0B5A3A",
                                color: "white",
                              }}
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Badge
                      style={{
                        backgroundColor: masjidStatusColor(m.status),
                        color: "white",
                      }}
                    >
                      {m.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() => approveMasjidMutation.mutate(m.id)}
                      data-ocid={`admin.masjid_approve.button.${i + 1}`}
                      style={{ backgroundColor: "#1E7A52", color: "white" }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectMasjidMutation.mutate(m.id)}
                      data-ocid={`admin.masjid_reject.button.${i + 1}`}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h3 className="font-semibold mb-3" style={{ color: "#0B5A3A" }}>
            All Masjids
          </h3>
          <div className="space-y-3">
            {allMasjids.map((m) => (
              <MasjidEditRow
                key={m.id.toString()}
                m={m}
                onSave={(id, profile) =>
                  adminUpdateMasjidMutation.mutate({ id, profile })
                }
                onDelete={(id) => adminDeleteMasjidMutation.mutate(id)}
              />
            ))}
            {allMasjids.length === 0 && (
              <p style={{ color: "#1E7A52" }}>No Masjids registered yet.</p>
            )}
          </div>
        </TabsContent>

        {/* Zakat Profiles */}
        <TabsContent
          value="zakat_profiles"
          data-ocid="admin.zakat_profiles.panel"
        >
          <h3 className="font-semibold mb-4" style={{ color: "#0B5A3A" }}>
            🤲 All Zakat Profiles
          </h3>
          <ZakatProfilesAdminTab />
        </TabsContent>

        {/* Zakat Settings */}
        <TabsContent value="zakat" data-ocid="admin.zakat.panel">
          <div
            className="max-w-md rounded-xl p-6"
            style={{
              backgroundColor: "#FAF7E6",
              border: "1px solid rgba(212,175,55,0.4)",
            }}
          >
            <h3 className="font-semibold mb-4" style={{ color: "#0B5A3A" }}>
              ⭐ Zakat Rate Settings
            </h3>
            {zakatSettings === undefined && (
              <p className="text-xs mb-3" style={{ color: "#1E7A52" }}>
                Loading current settings...
              </p>
            )}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label style={{ color: "#0B5A3A" }}>
                  Gold Rate (₹ per gram)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={zakatForm.goldRatePerGram}
                  onChange={(e) =>
                    setZakatForm((p) => ({
                      ...p,
                      goldRatePerGram: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                  data-ocid="admin.zakat_gold_rate.input"
                />
              </div>
              <div className="space-y-1">
                <Label style={{ color: "#0B5A3A" }}>
                  Silver Rate (₹ per gram)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={zakatForm.silverRatePerGram}
                  onChange={(e) =>
                    setZakatForm((p) => ({
                      ...p,
                      silverRatePerGram: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                  data-ocid="admin.zakat_silver_rate.input"
                />
              </div>
              <div className="space-y-1">
                <Label style={{ color: "#0B5A3A" }}>Nisab — Gold (grams)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={zakatForm.nisabGoldGrams}
                  onChange={(e) =>
                    setZakatForm((p) => ({
                      ...p,
                      nisabGoldGrams: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                  data-ocid="admin.zakat_nisab_gold.input"
                />
              </div>
              <div className="space-y-1">
                <Label style={{ color: "#0B5A3A" }}>
                  Nisab — Silver (grams)
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={zakatForm.nisabSilverGrams}
                  onChange={(e) =>
                    setZakatForm((p) => ({
                      ...p,
                      nisabSilverGrams: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                  data-ocid="admin.zakat_nisab_silver.input"
                />
              </div>
              <Button
                onClick={() => updateZakat.mutate()}
                disabled={updateZakat.isPending}
                data-ocid="admin.zakat.save_button"
                style={{ backgroundColor: "#0B5A3A", color: "white" }}
              >
                {updateZakat.isPending ? "Saving..." : "Save Zakat Settings"}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Admin Management */}
        <TabsContent value="admin_mgmt" data-ocid="admin.admin_mgmt.panel">
          <AdminManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
