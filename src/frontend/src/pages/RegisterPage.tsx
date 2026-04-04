import { NikahStatus } from "@/backend";
import SignaturePad, {
  type SignaturePadHandle,
} from "@/components/SignaturePad";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
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

// --- Form State Types ---
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

// Signatures stored as base64 strings in state so they survive section collapse/unmount
interface SignatureState {
  groom: string | null;
  bride: string | null;
  qazi: string | null;
  witness1: string | null;
  witness2: string | null;
  masjid: string | null;
}

interface FormState {
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

const initialForm: FormState = {
  groom: emptyPerson(),
  bride: emptyPerson(),
  ceremony: { date: "", venue: "", city: "", qaziName: "", qaziContact: "" },
  witness1: { name: "", contact: "" },
  witness2: { name: "", contact: "" },
  maher: "",
  termsAccepted: false,
};

const initialSignatures: SignatureState = {
  groom: null,
  bride: null,
  qazi: null,
  witness1: null,
  witness2: null,
  masjid: null,
};

// --- Section Component ---
interface SectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isComplete?: boolean;
}

function Section({
  id,
  title,
  icon,
  isOpen,
  onToggle,
  children,
  isComplete,
}: SectionProps) {
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
        aria-controls={`section-${id}`}
        data-ocid={`register.${id}.toggle`}
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
            id={`section-${id}`}
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

// --- Field helpers ---
function FieldGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  );
}

function Field({
  label,
  children,
  full,
}: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`space-y-1 ${full ? "md:col-span-2" : ""}`}>
      <Label className="text-xs font-semibold" style={{ color: "#0B5A3A" }}>
        {label}
      </Label>
      {children}
    </div>
  );
}

// --- Photo Upload ---
function PhotoUpload({
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

// --- Person Section Content ---
function PersonForm({
  data,
  onChange,
  prefix,
  sigRef,
  sigValue,
  onSigChange,
}: {
  data: PersonDetails;
  onChange: (updated: PersonDetails) => void;
  prefix: string;
  sigRef: React.RefObject<SignaturePadHandle | null>;
  sigValue: string | null;
  onSigChange: (dataUrl: string | null) => void;
}) {
  const set =
    (field: keyof PersonDetails) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...data, [field]: e.target.value });

  return (
    <div className="space-y-4">
      <FieldGroup>
        <Field label="Full Name *">
          <Input
            value={data.name}
            onChange={set("name")}
            required
            placeholder="Full legal name"
            data-ocid={`register.${prefix}_name.input`}
          />
        </Field>
        <Field label="Father's Name *">
          <Input
            value={data.fatherName}
            onChange={set("fatherName")}
            required
            placeholder="Father's full name"
            data-ocid={`register.${prefix}_father_name.input`}
          />
        </Field>
        <Field label="Phone Number *">
          <Input
            value={data.phone}
            onChange={set("phone")}
            required
            type="tel"
            placeholder="+91 9876543210"
            data-ocid={`register.${prefix}_phone.input`}
          />
        </Field>
        <Field label="Aadhaar Number * (12 digits)">
          <Input
            value={data.aadhaar}
            onChange={set("aadhaar")}
            required
            type="password"
            maxLength={12}
            placeholder="xxxxxxxxxxxx"
            autoComplete="off"
            data-ocid={`register.${prefix}_aadhaar.input`}
          />
        </Field>
        <Field label="Address *" full>
          <Textarea
            value={data.address}
            onChange={set("address")}
            required
            placeholder="Full residential address"
            rows={2}
            data-ocid={`register.${prefix}_address.textarea`}
          />
        </Field>
        <Field label="Photo (optional)" full>
          <PhotoUpload
            value={data.photoUrl}
            onChange={(url) => onChange({ ...data, photoUrl: url })}
            label={`${prefix} photo`}
            ocid={`register.${prefix}_photo.upload_button`}
          />
        </Field>
      </FieldGroup>
      <div className="mt-2">
        <SignaturePad
          ref={sigRef}
          label="Digital Signature *"
          value={sigValue}
          onChange={onSigChange}
        />
      </div>
    </div>
  );
}

// --- Main Page ---
export default function RegisterPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { actor } = useActor();
  const navigate = useNavigate();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const [form, setForm] = useState<FormState>(initialForm);
  // Persist all signatures as state so they survive section collapse/unmount
  const [signatures, setSignatures] =
    useState<SignatureState>(initialSignatures);
  const [loading, setLoading] = useState(false);
  const [openSection, setOpenSection] = useState<string>("groom");
  const [successData, setSuccessData] = useState<{
    id: bigint;
    nikahUniqueId: string;
  } | null>(null);

  // Refs are still used so we can call getSignatureDataUrl() at submit time for the currently-open section
  const groomSigRef = useRef<SignaturePadHandle>(null);
  const brideSigRef = useRef<SignaturePadHandle>(null);
  const qaziSigRef = useRef<SignaturePadHandle>(null);
  const witness1SigRef = useRef<SignaturePadHandle>(null);
  const witness2SigRef = useRef<SignaturePadHandle>(null);
  const masjidSigRef = useRef<SignaturePadHandle>(null);

  const setSig = (key: keyof SignatureState) => (dataUrl: string | null) =>
    setSignatures((prev) => ({ ...prev, [key]: dataUrl }));

  const toggleSection = (id: string) =>
    setOpenSection((prev) => (prev === id ? "" : id));

  const setGroom = (updated: PersonDetails) =>
    setForm((prev) => ({ ...prev, groom: updated }));
  const setBride = (updated: PersonDetails) =>
    setForm((prev) => ({ ...prev, bride: updated }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !identity || !actor) {
      toast.error("Please login first");
      return;
    }

    // Validation
    const groomAadhaarClean = form.groom.aadhaar.replace(/\s/g, "");
    const brideAadhaarClean = form.bride.aadhaar.replace(/\s/g, "");
    if (groomAadhaarClean.length !== 12 || !/^\d+$/.test(groomAadhaarClean)) {
      toast.error("Groom Aadhaar must be 12 digits");
      return;
    }
    if (brideAadhaarClean.length !== 12 || !/^\d+$/.test(brideAadhaarClean)) {
      toast.error("Bride Aadhaar must be 12 digits");
      return;
    }
    if (!form.termsAccepted) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    // Read signatures: for the currently-open section use the live ref,
    // for all others use the persisted state value.
    const getOrState = (
      key: keyof SignatureState,
      ref: React.RefObject<SignaturePadHandle | null>,
    ) => ref.current?.getSignatureDataUrl() ?? signatures[key];

    const groomSig = getOrState("groom", groomSigRef);
    const brideSig = getOrState("bride", brideSigRef);
    const qaziSig = getOrState("qazi", qaziSigRef);
    const witness1Sig = getOrState("witness1", witness1SigRef);
    const witness2Sig = getOrState("witness2", witness2SigRef);
    const masjidSig = getOrState("masjid", masjidSigRef);

    if (!groomSig) {
      toast.error("Groom signature is required");
      setOpenSection("groom");
      return;
    }
    if (!brideSig) {
      toast.error("Bride signature is required");
      setOpenSection("bride");
      return;
    }
    if (!qaziSig) {
      toast.error("Imam/Qazi signature is required");
      setOpenSection("ceremony");
      return;
    }
    if (!witness1Sig) {
      toast.error("Witness 1 signature is required");
      setOpenSection("witness1");
      return;
    }
    if (!witness2Sig) {
      toast.error("Witness 2 signature is required");
      setOpenSection("witness2");
      return;
    }

    setLoading(true);
    try {
      const registration: any = {
        id: 0n,
        nikahUniqueId: "",
        status: NikahStatus.pending,
        // Groom
        groomName: form.groom.name,
        groomFatherName: form.groom.fatherName,
        groomAddress: form.groom.address,
        groomAadhaarHash: btoa(groomAadhaarClean),
        groomPhone: form.groom.phone,
        groomPhotoUrl: form.groom.photoUrl,
        groomSignature: groomSig,
        // Bride
        brideName: form.bride.name,
        brideFatherName: form.bride.fatherName,
        brideAddress: form.bride.address,
        brideAadhaarHash: btoa(brideAadhaarClean),
        bridePhone: form.bride.phone,
        bridePhotoUrl: form.bride.photoUrl,
        brideSignature: brideSig,
        // Ceremony
        nikahDate: form.ceremony.date,
        masjidVenue: form.ceremony.venue,
        city: form.ceremony.city,
        qaziName: form.ceremony.qaziName,
        qaziContact: form.ceremony.qaziContact,
        qaziSignature: qaziSig,
        // Witnesses
        witness1: form.witness1.name,
        witness1Contact: form.witness1.contact,
        witness1Signature: witness1Sig,
        witness2: form.witness2.name,
        witness2Contact: form.witness2.contact,
        witness2Signature: witness2Sig,
        // Masjid
        masjidSignature: masjidSig ?? "",
        // Maher
        maher: form.maher,
        registeredBy: identity.getPrincipal(),
        timestamp: BigInt(Date.now()),
      };

      const id = await actor.submitNikahRegistration(registration);

      const nikahUniqueId = `NIKAH-${new Date().getFullYear()}-${String(Number(id)).padStart(4, "0")}`;
      setSuccessData({ id, nikahUniqueId });
      setForm(initialForm);
      setSignatures(initialSignatures);
      toast.success("Nikah registered successfully!");
    } catch {
      toast.error("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div
          className="rounded-2xl p-10 text-center"
          style={{
            backgroundColor: "#FAF7E6",
            border: "2px solid rgba(212,175,55,0.5)",
          }}
          data-ocid="register.login.card"
        >
          <div className="text-4xl mb-4">🕌</div>
          <h2
            className="text-2xl font-bold mb-2"
            style={{
              color: "#0B5A3A",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Nikah Registration
          </h2>
          <p className="text-sm mb-6" style={{ color: "#1E7A52" }}>
            Please login to submit a Nikah registration
          </p>
          <Button
            onClick={() => login()}
            disabled={isLoggingIn}
            className="px-8"
            data-ocid="register.login.button"
            style={{ backgroundColor: "#0B5A3A", color: "white" }}
          >
            {isLoggingIn ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login to Continue"
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (successData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
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
          data-ocid="register.success_state"
        >
          <div className="text-5xl mb-4">✅</div>
          <h2
            className="text-2xl font-bold mb-2"
            style={{
              color: "#0B5A3A",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Nikah Registered!
          </h2>
          <p className="text-sm mb-4" style={{ color: "#1E7A52" }}>
            Your Nikah has been registered successfully.
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
            data-ocid="register.view_certificate.button"
          >
            Download Certificate
          </Button>

          <p className="text-xs" style={{ color: "#888" }}>
            Pending admin approval. Certificate will be available once approved.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2
          className="text-3xl font-bold mb-1"
          style={{ color: "#0B5A3A", fontFamily: "'Playfair Display', serif" }}
        >
          Nikah Registration
        </h2>
        <p className="text-sm" style={{ color: "#1E7A52" }}>
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم — Fill all sections to complete your digital
          Nikah registration
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        data-ocid="register.form"
        className="space-y-0"
      >
        {/* Groom Section */}
        <Section
          id="groom"
          title="Groom Details"
          icon={<User size={18} />}
          isOpen={openSection === "groom"}
          onToggle={() => toggleSection("groom")}
          isComplete={
            !!form.groom.name &&
            !!form.groom.fatherName &&
            !!form.groom.aadhaar &&
            !!signatures.groom
          }
        >
          <PersonForm
            data={form.groom}
            onChange={setGroom}
            prefix="groom"
            sigRef={groomSigRef}
            sigValue={signatures.groom}
            onSigChange={setSig("groom")}
          />
        </Section>

        {/* Bride Section */}
        <Section
          id="bride"
          title="Bride Details"
          icon={<Heart size={18} />}
          isOpen={openSection === "bride"}
          onToggle={() => toggleSection("bride")}
          isComplete={
            !!form.bride.name &&
            !!form.bride.fatherName &&
            !!form.bride.aadhaar &&
            !!signatures.bride
          }
        >
          <PersonForm
            data={form.bride}
            onChange={setBride}
            prefix="bride"
            sigRef={brideSigRef}
            sigValue={signatures.bride}
            onSigChange={setSig("bride")}
          />
        </Section>

        {/* Ceremony Section */}
        <Section
          id="ceremony"
          title="Ceremony Details"
          icon={<Building2 size={18} />}
          isOpen={openSection === "ceremony"}
          onToggle={() => toggleSection("ceremony")}
          isComplete={
            !!form.ceremony.date &&
            !!form.ceremony.qaziName &&
            !!signatures.qazi
          }
        >
          <div className="space-y-4">
            <FieldGroup>
              <Field label="Date of Nikah *">
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
                  data-ocid="register.nikah_date.input"
                />
              </Field>
              <Field label="City *">
                <Input
                  value={form.ceremony.city}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      ceremony: { ...prev.ceremony, city: e.target.value },
                    }))
                  }
                  required
                  placeholder="City"
                  data-ocid="register.city.input"
                />
              </Field>
              <Field label="Venue / Masjid Name *" full>
                <Input
                  value={form.ceremony.venue}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      ceremony: { ...prev.ceremony, venue: e.target.value },
                    }))
                  }
                  required
                  placeholder="Name of Masjid or venue"
                  data-ocid="register.venue.input"
                />
              </Field>
              <Field label="Imam / Qazi Name *">
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
                  data-ocid="register.qazi_name.input"
                />
              </Field>
              <Field label="Imam / Qazi Contact *">
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
                  data-ocid="register.qazi_contact.input"
                />
              </Field>
            </FieldGroup>
            <div className="mt-2">
              <SignaturePad
                ref={qaziSigRef}
                label="Imam / Qazi Digital Signature *"
                value={signatures.qazi}
                onChange={setSig("qazi")}
              />
            </div>
          </div>
        </Section>

        {/* Witness 1 Section */}
        <Section
          id="witness1"
          title="Witness 1"
          icon={<Users size={18} />}
          isOpen={openSection === "witness1"}
          onToggle={() => toggleSection("witness1")}
          isComplete={!!form.witness1.name && !!signatures.witness1}
        >
          <div className="space-y-4">
            <FieldGroup>
              <Field label="Witness 1 Name *">
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
                  data-ocid="register.witness1_name.input"
                />
              </Field>
              <Field label="Witness 1 Contact *">
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
                  data-ocid="register.witness1_contact.input"
                />
              </Field>
            </FieldGroup>
            <SignaturePad
              ref={witness1SigRef}
              label="Witness 1 Digital Signature *"
              value={signatures.witness1}
              onChange={setSig("witness1")}
            />
          </div>
        </Section>

        {/* Witness 2 Section */}
        <Section
          id="witness2"
          title="Witness 2"
          icon={<Users size={18} />}
          isOpen={openSection === "witness2"}
          onToggle={() => toggleSection("witness2")}
          isComplete={!!form.witness2.name && !!signatures.witness2}
        >
          <div className="space-y-4">
            <FieldGroup>
              <Field label="Witness 2 Name *">
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
                  data-ocid="register.witness2_name.input"
                />
              </Field>
              <Field label="Witness 2 Contact *">
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
                  data-ocid="register.witness2_contact.input"
                />
              </Field>
            </FieldGroup>
            <SignaturePad
              ref={witness2SigRef}
              label="Witness 2 Digital Signature *"
              value={signatures.witness2}
              onChange={setSig("witness2")}
            />
          </div>
        </Section>

        {/* Masjid Authority Section */}
        <Section
          id="masjid"
          title="Masjid Authority"
          icon={<Landmark size={18} />}
          isOpen={openSection === "masjid"}
          onToggle={() => toggleSection("masjid")}
        >
          <div className="space-y-2">
            <p className="text-xs" style={{ color: "#1E7A52" }}>
              Masjid authority signature block (optional if not present at
              registration)
            </p>
            <SignaturePad
              ref={masjidSigRef}
              label="Masjid Authority Signature"
              value={signatures.masjid}
              onChange={setSig("masjid")}
            />
          </div>
        </Section>

        {/* Maher & Terms Section */}
        <Section
          id="maher"
          title="Maher & Terms"
          icon={<ScrollText size={18} />}
          isOpen={openSection === "maher"}
          onToggle={() => toggleSection("maher")}
          isComplete={!!form.maher && form.termsAccepted}
        >
          <div className="space-y-4">
            <Field label="Maher Amount / Description *">
              <Input
                value={form.maher}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, maher: e.target.value }))
                }
                required
                placeholder="e.g. ₹51,000 in gold coins"
                data-ocid="register.maher.input"
              />
            </Field>

            <div
              className="rounded-lg p-4"
              style={{
                backgroundColor: "rgba(11,90,58,0.05)",
                border: "1px solid rgba(212,175,55,0.3)",
              }}
            >
              <p
                className="text-xs font-semibold mb-2"
                style={{ color: "#0B5A3A" }}
              >
                Terms & Conditions
              </p>
              <p
                className="text-xs leading-relaxed mb-3"
                style={{ color: "#555" }}
              >
                By registering this Nikah on NikahNaama.org, I confirm that:
              </p>
              <ul className="text-xs space-y-1 mb-4" style={{ color: "#555" }}>
                <li>
                  ✓ All details provided are accurate and true to the best of my
                  knowledge.
                </li>
                <li>
                  ✓ This Nikah is conducted according to Islamic law (Shariah).
                </li>
                <li>
                  ✓ Both parties have given their free and willing consent.
                </li>
                <li>
                  ✓ The Mehr (dower) stated is agreed upon by both parties.
                </li>
                <li>
                  ✓ I consent to digital registration of this Nikah on
                  NikahNaama.org.
                </li>
              </ul>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={form.termsAccepted}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({
                      ...prev,
                      termsAccepted: checked === true,
                    }))
                  }
                  data-ocid="register.terms.checkbox"
                  style={{ marginTop: "2px" }}
                />
                <label
                  htmlFor="terms"
                  className="text-xs cursor-pointer leading-relaxed"
                  style={{ color: "#0B5A3A" }}
                >
                  I confirm all details are correct and this Nikah is conducted
                  according to Islamic law (Shariah). I consent to digital
                  registration on NikahNaama.org.
                </label>
              </div>
            </div>
          </div>
        </Section>

        {/* Submit */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-base font-semibold rounded-xl"
            data-ocid="register.submit_button"
            style={{
              backgroundColor: "#0B5A3A",
              color: "white",
              fontSize: "1rem",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Nikah Registration"
            )}
          </Button>
          <p className="text-center text-xs mt-2" style={{ color: "#888" }}>
            After submission, a unique Nikah ID will be generated and a
            certificate will be available upon admin approval.
          </p>
        </div>
      </form>
    </div>
  );
}
