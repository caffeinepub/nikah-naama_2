import { NikahStatus } from "@/backend";
import type {
  Gender,
  JobPosting,
  MatrimonyProposal,
  NikahRegistration,
} from "@/backend";
import SignaturePad, {
  type SignaturePadHandle,
} from "@/components/SignaturePad";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  Heart,
  Landmark,
  Loader2,
  ScrollText,
  User,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
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

// ─── Nikah Form Types ────────────────────────────────────────────────────────

interface PersonDetails {
  name: string;
  fatherName: string;
  address: string;
  aadhaar: string;
  phone: string;
  photoUrl: string;
}

interface CeremonyDetails {
  date: string;
  venue: string;
  city: string;
  qaziName: string;
  qaziContact: string;
}

interface WitnessDetails {
  name: string;
  contact: string;
}

interface NikahFormState {
  groom: PersonDetails;
  bride: PersonDetails;
  ceremony: CeremonyDetails;
  witness1: WitnessDetails;
  witness2: WitnessDetails;
  maher: string;
  termsAccepted: boolean;
}

const emptyPerson = (): PersonDetails => ({
  name: "",
  fatherName: "",
  address: "",
  aadhaar: "",
  phone: "",
  photoUrl: "",
});

const initialNikahForm: NikahFormState = {
  groom: emptyPerson(),
  bride: emptyPerson(),
  ceremony: { date: "", venue: "", city: "", qaziName: "", qaziContact: "" },
  witness1: { name: "", contact: "" },
  witness2: { name: "", contact: "" },
  maher: "",
  termsAccepted: false,
};

// ─── Nikah Section Accordion ─────────────────────────────────────────────────

interface NikahSectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isComplete?: boolean;
}

function NikahSection({
  id,
  title,
  icon,
  isOpen,
  onToggle,
  children,
  isComplete,
}: NikahSectionProps) {
  return (
    <div
      className="rounded-xl overflow-hidden mb-4"
      style={{
        border: "1px solid rgba(212,175,55,0.4)",
        backgroundColor: "#FAF7E6",
        boxShadow: "0 2px 8px rgba(11,90,58,0.06)",
      }}
    >
      <button
        type="button"
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
        style={{
          backgroundColor: isOpen ? "rgba(11,90,58,0.08)" : "transparent",
        }}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`nikahsec-${id}`}
        data-ocid={`masjid.nikah.${id}.toggle`}
      >
        <div className="flex items-center gap-3">
          <span style={{ color: "#0B5A3A" }}>{icon}</span>
          <span
            className="font-semibold text-sm"
            style={{
              color: "#0B5A3A",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            {title}
          </span>
          {isComplete && (
            <CheckCircle2 size={16} style={{ color: "#1E7A52" }} />
          )}
        </div>
        <ChevronDown
          size={18}
          style={{
            color: "#D4AF37",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s",
          }}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`nikahsec-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Nikah Field Helpers ──────────────────────────────────────────────────────

function NikahFieldGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  );
}

function NikahField({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`space-y-1 ${full ? "md:col-span-2" : ""}`}>
      <Label className="text-xs font-semibold" style={{ color: "#0B5A3A" }}>
        {label}
      </Label>
      {children}
    </div>
  );
}

// ─── Photo Upload ─────────────────────────────────────────────────────────────

function NikahPhotoUpload({
  value,
  onChange,
  label,
  ocid,
}: {
  value: string;
  onChange: (dataUrl: string) => void;
  label: string;
  ocid: string;
}) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) onChange(ev.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-3">
      {value ? (
        <img
          src={value}
          alt={label}
          className="w-14 h-14 rounded-full object-cover"
          style={{ border: "2px solid #D4AF37" }}
        />
      ) : (
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            border: "2px dashed #D4AF37",
            backgroundColor: "rgba(212,175,55,0.08)",
          }}
        >
          <User size={20} style={{ color: "#D4AF37" }} />
        </div>
      )}
      <div className="flex-1">
        <input
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFile}
          className="block w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:cursor-pointer"
          data-ocid={ocid}
        />
        <p className="text-xs mt-1" style={{ color: "#888" }}>
          Tap to take photo or upload from gallery
        </p>
      </div>
    </div>
  );
}

// ─── Person Sub-Form ──────────────────────────────────────────────────────────

function NikahPersonForm({
  data,
  onChange,
  prefix,
  sigRef,
}: {
  data: PersonDetails;
  onChange: (updated: PersonDetails) => void;
  prefix: string;
  sigRef: React.RefObject<SignaturePadHandle | null>;
}) {
  const set =
    (field: keyof PersonDetails) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...data, [field]: e.target.value });

  return (
    <div className="space-y-4">
      <NikahFieldGroup>
        <NikahField label="Full Name *">
          <Input
            value={data.name}
            onChange={set("name")}
            required
            placeholder="Full legal name"
            data-ocid={`masjid.nikah.${prefix}_name.input`}
          />
        </NikahField>
        <NikahField label="Father's Name *">
          <Input
            value={data.fatherName}
            onChange={set("fatherName")}
            required
            placeholder="Father's full name"
            data-ocid={`masjid.nikah.${prefix}_father.input`}
          />
        </NikahField>
        <NikahField label="Phone Number *">
          <Input
            type="tel"
            value={data.phone}
            onChange={set("phone")}
            required
            placeholder="+91 9876543210"
            data-ocid={`masjid.nikah.${prefix}_phone.input`}
          />
        </NikahField>
        <NikahField label="Aadhaar Number * (12 digits)">
          <Input
            type="password"
            maxLength={12}
            value={data.aadhaar}
            onChange={set("aadhaar")}
            required
            placeholder="············"
            data-ocid={`masjid.nikah.${prefix}_aadhaar.input`}
          />
        </NikahField>
        <NikahField label="Address *" full>
          <Textarea
            value={data.address}
            onChange={set("address")}
            required
            placeholder="Full residential address"
            rows={2}
            data-ocid={`masjid.nikah.${prefix}_address.textarea`}
          />
        </NikahField>
        <NikahField label="Photo (optional)" full>
          <NikahPhotoUpload
            value={data.photoUrl}
            onChange={(url) => onChange({ ...data, photoUrl: url })}
            label={`${prefix} photo`}
            ocid={`masjid.nikah.${prefix}_photo.upload_button`}
          />
        </NikahField>
      </NikahFieldGroup>
      <div className="mt-2">
        <SignaturePad ref={sigRef} label="Digital Signature *" />
      </div>
    </div>
  );
}

// ─── Nikah Registration Form Tab ─────────────────────────────────────────────

function NikahFormTab() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const navigate = useNavigate();

  const [form, setForm] = useState<NikahFormState>(initialNikahForm);
  const [loading, setLoading] = useState(false);
  const [openSection, setOpenSection] = useState<string>("groom");
  const [successData, setSuccessData] = useState<{
    id: bigint;
    nikahUniqueId: string;
  } | null>(null);

  // Signature refs
  const groomSigRef = useRef<SignaturePadHandle>(null);
  const brideSigRef = useRef<SignaturePadHandle>(null);
  const qaziSigRef = useRef<SignaturePadHandle>(null);
  const witness1SigRef = useRef<SignaturePadHandle>(null);
  const witness2SigRef = useRef<SignaturePadHandle>(null);
  const masjidSigRef = useRef<SignaturePadHandle>(null);

  const toggleSection = (id: string) =>
    setOpenSection((prev) => (prev === id ? "" : id));

  const setGroom = (updated: PersonDetails) =>
    setForm((prev) => ({ ...prev, groom: updated }));
  const setBride = (updated: PersonDetails) =>
    setForm((prev) => ({ ...prev, bride: updated }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity || !actor) {
      toast.error("Not connected to backend");
      return;
    }

    const groomAadhaarClean = form.groom.aadhaar.replace(/\s/g, "");
    const brideAadhaarClean = form.bride.aadhaar.replace(/\s/g, "");

    if (groomAadhaarClean.length !== 12 || !/^\d+$/.test(groomAadhaarClean)) {
      toast.error("Groom Aadhaar must be exactly 12 digits");
      return;
    }
    if (brideAadhaarClean.length !== 12 || !/^\d+$/.test(brideAadhaarClean)) {
      toast.error("Bride Aadhaar must be exactly 12 digits");
      return;
    }
    if (!form.termsAccepted) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    const groomSig = groomSigRef.current?.getSignatureDataUrl();
    const brideSig = brideSigRef.current?.getSignatureDataUrl();
    const qaziSig = qaziSigRef.current?.getSignatureDataUrl();
    const witness1Sig = witness1SigRef.current?.getSignatureDataUrl();
    const witness2Sig = witness2SigRef.current?.getSignatureDataUrl();
    const masjidSig = masjidSigRef.current?.getSignatureDataUrl();

    if (!groomSig) {
      toast.error("Groom signature is required");
      return;
    }
    if (!brideSig) {
      toast.error("Bride signature is required");
      return;
    }
    if (!qaziSig) {
      toast.error("Imam/Qazi signature is required");
      return;
    }
    if (!witness1Sig) {
      toast.error("Witness 1 signature is required");
      return;
    }
    if (!witness2Sig) {
      toast.error("Witness 2 signature is required");
      return;
    }

    setLoading(true);
    try {
      const registration: NikahRegistration = {
        id: 0n,
        nikahUniqueId: "",
        status: NikahStatus.pending,
        groomName: form.groom.name,
        groomFatherName: form.groom.fatherName,
        groomAddress: form.groom.address,
        groomAadhaarHash: btoa(groomAadhaarClean),
        groomPhone: form.groom.phone,
        groomPhotoUrl: form.groom.photoUrl,
        groomSignature: groomSig,
        brideName: form.bride.name,
        brideFatherName: form.bride.fatherName,
        brideAddress: form.bride.address,
        brideAadhaarHash: btoa(brideAadhaarClean),
        bridePhone: form.bride.phone,
        bridePhotoUrl: form.bride.photoUrl,
        brideSignature: brideSig,
        nikahDate: form.ceremony.date,
        masjidVenue: form.ceremony.venue,
        city: form.ceremony.city,
        qaziName: form.ceremony.qaziName,
        qaziContact: form.ceremony.qaziContact,
        qaziSignature: qaziSig,
        witness1: form.witness1.name,
        witness1Contact: form.witness1.contact,
        witness1Signature: witness1Sig,
        witness2: form.witness2.name,
        witness2Contact: form.witness2.contact,
        witness2Signature: witness2Sig,
        masjidSignature: masjidSig ?? "",
        maher: form.maher,
        registeredBy: identity.getPrincipal(),
        timestamp: BigInt(Date.now()),
      };

      const id = await actor.submitNikahRegistration(registration);
      const nikahUniqueId = `NIKAH-${new Date().getFullYear()}-${String(Number(id)).padStart(4, "0")}`;
      setSuccessData({ id, nikahUniqueId });
      setForm(initialNikahForm);
      toast.success("Nikah registered successfully!");
    } catch {
      toast.error("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl p-8 text-center"
        style={{
          backgroundColor: "#FAF7E6",
          border: "3px solid #D4AF37",
          boxShadow: "0 8px 32px rgba(11,90,58,0.15)",
        }}
        data-ocid="masjid.nikah.success_state"
      >
        <div className="text-5xl mb-4">✅</div>
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: "#0B5A3A", fontFamily: "'Playfair Display', serif" }}
        >
          Nikah Registered!
        </h2>
        <p className="text-sm mb-4" style={{ color: "#1E7A52" }}>
          Registration submitted successfully. Awaiting admin approval.
        </p>
        <div
          className="rounded-xl p-4 mb-5"
          style={{
            backgroundColor: "rgba(11,90,58,0.06)",
            border: "1px solid rgba(212,175,55,0.4)",
          }}
        >
          <p className="text-xs mb-1" style={{ color: "#1E7A52" }}>
            Unique Nikah ID
          </p>
          <p
            className="text-xl font-bold font-mono"
            style={{ color: "#0B5A3A" }}
          >
            {successData.nikahUniqueId}
          </p>
          <p className="text-xs mt-1" style={{ color: "#888" }}>
            Registration ID: {successData.id.toString()}
          </p>
        </div>
        <Button
          onClick={() =>
            navigate({ to: `/certificate/${successData.id.toString()}` })
          }
          className="w-full mb-3"
          style={{ backgroundColor: "#0B5A3A", color: "white" }}
          data-ocid="masjid.nikah.view_certificate.button"
        >
          Download Certificate
        </Button>
        <p className="text-xs" style={{ color: "#888" }}>
          Certificate will be available once the registration is approved.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} data-ocid="masjid.nikah.form">
      <div className="mb-5">
        <h3
          className="text-lg font-bold"
          style={{ color: "#0B5A3A", fontFamily: "'Playfair Display', serif" }}
        >
          📜 Nikah Registration
        </h3>
        <p className="text-xs mt-1" style={{ color: "#1E7A52" }}>
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم — Fill all sections to complete registration
        </p>
      </div>

      {/* ── Groom Section ── */}
      <NikahSection
        id="groom"
        title="Groom Details"
        icon={<User size={18} />}
        isOpen={openSection === "groom"}
        onToggle={() => toggleSection("groom")}
        isComplete={
          !!(
            form.groom.name &&
            form.groom.fatherName &&
            form.groom.aadhaar &&
            form.groom.phone &&
            form.groom.address
          )
        }
      >
        <NikahPersonForm
          data={form.groom}
          onChange={setGroom}
          prefix="groom"
          sigRef={groomSigRef}
        />
      </NikahSection>

      {/* ── Bride Section ── */}
      <NikahSection
        id="bride"
        title="Bride Details"
        icon={<Heart size={18} />}
        isOpen={openSection === "bride"}
        onToggle={() => toggleSection("bride")}
        isComplete={
          !!(
            form.bride.name &&
            form.bride.fatherName &&
            form.bride.aadhaar &&
            form.bride.phone &&
            form.bride.address
          )
        }
      >
        <NikahPersonForm
          data={form.bride}
          onChange={setBride}
          prefix="bride"
          sigRef={brideSigRef}
        />
      </NikahSection>

      {/* ── Ceremony Section ── */}
      <NikahSection
        id="ceremony"
        title="Ceremony Details"
        icon={<Landmark size={18} />}
        isOpen={openSection === "ceremony"}
        onToggle={() => toggleSection("ceremony")}
        isComplete={
          !!(
            form.ceremony.date &&
            form.ceremony.venue &&
            form.ceremony.qaziName &&
            form.ceremony.qaziContact
          )
        }
      >
        <div className="space-y-4">
          <NikahFieldGroup>
            <NikahField label="Date of Nikah *">
              <Input
                type="date"
                value={form.ceremony.date}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    ceremony: { ...prev.ceremony, date: e.target.value },
                  }))
                }
                required
                data-ocid="masjid.nikah.ceremony_date.input"
              />
            </NikahField>
            <NikahField label="Venue / Masjid Name *">
              <Input
                value={form.ceremony.venue}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    ceremony: { ...prev.ceremony, venue: e.target.value },
                  }))
                }
                required
                placeholder="Venue or Masjid name"
                data-ocid="masjid.nikah.ceremony_venue.input"
              />
            </NikahField>
            <NikahField label="City">
              <Input
                value={form.ceremony.city}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    ceremony: { ...prev.ceremony, city: e.target.value },
                  }))
                }
                placeholder="City"
                data-ocid="masjid.nikah.ceremony_city.input"
              />
            </NikahField>
            <NikahField label="Imam / Qazi Name *">
              <Input
                value={form.ceremony.qaziName}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    ceremony: { ...prev.ceremony, qaziName: e.target.value },
                  }))
                }
                required
                placeholder="Full name"
                data-ocid="masjid.nikah.qazi_name.input"
              />
            </NikahField>
            <NikahField label="Imam / Qazi Contact *">
              <Input
                type="tel"
                value={form.ceremony.qaziContact}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    ceremony: {
                      ...prev.ceremony,
                      qaziContact: e.target.value,
                    },
                  }))
                }
                required
                placeholder="+91 9876543210"
                data-ocid="masjid.nikah.qazi_contact.input"
              />
            </NikahField>
          </NikahFieldGroup>
          <div className="mt-2">
            <SignaturePad
              ref={qaziSigRef}
              label="Imam / Qazi Digital Signature *"
            />
          </div>
        </div>
      </NikahSection>

      {/* ── Witness 1 ── */}
      <NikahSection
        id="witness1"
        title="Witness 1"
        icon={<Users size={18} />}
        isOpen={openSection === "witness1"}
        onToggle={() => toggleSection("witness1")}
        isComplete={!!(form.witness1.name && form.witness1.contact)}
      >
        <div className="space-y-4">
          <NikahFieldGroup>
            <NikahField label="Witness 1 Name *">
              <Input
                value={form.witness1.name}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    witness1: { ...prev.witness1, name: e.target.value },
                  }))
                }
                required
                placeholder="Full name"
                data-ocid="masjid.nikah.witness1_name.input"
              />
            </NikahField>
            <NikahField label="Witness 1 Contact *">
              <Input
                type="tel"
                value={form.witness1.contact}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    witness1: { ...prev.witness1, contact: e.target.value },
                  }))
                }
                required
                placeholder="+91 9876543210"
                data-ocid="masjid.nikah.witness1_contact.input"
              />
            </NikahField>
          </NikahFieldGroup>
          <div className="mt-2">
            <SignaturePad
              ref={witness1SigRef}
              label="Witness 1 Digital Signature *"
            />
          </div>
        </div>
      </NikahSection>

      {/* ── Witness 2 ── */}
      <NikahSection
        id="witness2"
        title="Witness 2"
        icon={<Users size={18} />}
        isOpen={openSection === "witness2"}
        onToggle={() => toggleSection("witness2")}
        isComplete={!!(form.witness2.name && form.witness2.contact)}
      >
        <div className="space-y-4">
          <NikahFieldGroup>
            <NikahField label="Witness 2 Name *">
              <Input
                value={form.witness2.name}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    witness2: { ...prev.witness2, name: e.target.value },
                  }))
                }
                required
                placeholder="Full name"
                data-ocid="masjid.nikah.witness2_name.input"
              />
            </NikahField>
            <NikahField label="Witness 2 Contact *">
              <Input
                type="tel"
                value={form.witness2.contact}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    witness2: { ...prev.witness2, contact: e.target.value },
                  }))
                }
                required
                placeholder="+91 9876543210"
                data-ocid="masjid.nikah.witness2_contact.input"
              />
            </NikahField>
          </NikahFieldGroup>
          <div className="mt-2">
            <SignaturePad
              ref={witness2SigRef}
              label="Witness 2 Digital Signature *"
            />
          </div>
        </div>
      </NikahSection>

      {/* ── Masjid Authority ── */}
      <NikahSection
        id="masjid"
        title="Masjid Authority Signature"
        icon={<Building2 size={18} />}
        isOpen={openSection === "masjid"}
        onToggle={() => toggleSection("masjid")}
      >
        <div className="space-y-3">
          <p className="text-xs" style={{ color: "#1E7A52" }}>
            Masjid authority signature (optional)
          </p>
          <SignaturePad
            ref={masjidSigRef}
            label="Masjid Authority Digital Signature (optional)"
          />
        </div>
      </NikahSection>

      {/* ── Maher & Terms ── */}
      <NikahSection
        id="maher"
        title="Maher & Terms"
        icon={<ScrollText size={18} />}
        isOpen={openSection === "maher"}
        onToggle={() => toggleSection("maher")}
        isComplete={!!(form.maher && form.termsAccepted)}
      >
        <div className="space-y-5">
          <NikahField label="Maher Amount / Description *" full>
            <Input
              value={form.maher}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, maher: e.target.value }))
              }
              required
              placeholder="e.g. ₹50,000 cash / 10g gold"
              data-ocid="masjid.nikah.maher.input"
            />
          </NikahField>

          <div
            className="rounded-lg p-4"
            style={{
              backgroundColor: "rgba(11,90,58,0.04)",
              border: "1px solid rgba(212,175,55,0.3)",
            }}
          >
            <p
              className="text-xs font-semibold mb-3"
              style={{ color: "#0B5A3A" }}
            >
              Terms & Conditions
            </p>
            <div className="flex items-start gap-3">
              <Checkbox
                id="nikah-terms"
                checked={form.termsAccepted}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({
                    ...prev,
                    termsAccepted: checked === true,
                  }))
                }
                data-ocid="masjid.nikah.terms.checkbox"
                style={{ marginTop: "2px" }}
              />
              <label
                htmlFor="nikah-terms"
                className="text-xs leading-relaxed cursor-pointer"
                style={{ color: "#1E7A52" }}
              >
                I confirm all details are correct and this Nikah is conducted
                according to Islamic law (Shariah). I consent to digital
                registration on NikahNaama.org.
              </label>
            </div>
          </div>
        </div>
      </NikahSection>

      {/* ── Submit ── */}
      <div className="mt-2">
        <Button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-base font-semibold"
          data-ocid="masjid.nikah.submit_button"
          style={{ backgroundColor: "#0B5A3A", color: "white" }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Submitting...
            </span>
          ) : (
            "Submit Nikah Registration"
          )}
        </Button>
      </div>
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
