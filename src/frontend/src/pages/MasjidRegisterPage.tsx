import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const FACILITIES = [
  "Nikah",
  "Janaza Prayer",
  "Quran Classes",
  "Islamic School",
  "Wuzu Facility",
  "Library",
  "Women's Section",
];

interface RegForm {
  masjidName: string;
  address: string;
  city: string;
  state: string;
  contactPerson: string;
  phone: string;
  email: string;
  registrationNumber: string;
  capacity: string;
  facilities: string[];
  upiId: string;
  presidentName: string;
  presidentPhone: string;
  secretaryName: string;
  secretaryPhone: string;
  treasurerName: string;
  treasurerPhone: string;
  utrNumber: string;
}

interface RegistrationSettings {
  upiId: string;
  feeAmount: bigint;
}

const INIT: RegForm = {
  masjidName: "",
  address: "",
  city: "",
  state: "",
  contactPerson: "",
  phone: "",
  email: "",
  registrationNumber: "",
  capacity: "",
  facilities: [],
  upiId: "",
  presidentName: "",
  presidentPhone: "",
  secretaryName: "",
  secretaryPhone: "",
  treasurerName: "",
  treasurerPhone: "",
  utrNumber: "",
};

export default function MasjidRegisterPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { actor } = useActor();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const navigate = useNavigate();

  const [form, setForm] = useState<RegForm>(INIT);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [registrationId, setRegistrationId] = useState("");
  const [regSettings, setRegSettings] = useState<RegistrationSettings | null>(
    null,
  );
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Load registration settings on mount
  useEffect(() => {
    if (!actor) return;
    setSettingsLoading(true);
    (actor as any)
      .getRegistrationSettings()
      .then((result: any) => {
        // ICP returns Option as [] for null, or [value] for Some
        if (Array.isArray(result)) {
          setRegSettings(
            result.length > 0 ? (result[0] as RegistrationSettings) : null,
          );
        } else {
          setRegSettings((result as RegistrationSettings) ?? null);
        }
      })
      .catch(() => setRegSettings(null))
      .finally(() => setSettingsLoading(false));
  }, [actor]);

  // Redirect to home after success with WhatsApp message
  useEffect(() => {
    if (!submitted || !registrationId) return;
    const timer = setTimeout(() => {
      const msg = encodeURIComponent(
        `Registration successfully submitted to Nikah Naama. Your Registration ID is: ${registrationId}. Your login credentials will be shared after verification and approval.`,
      );
      window.open(`https://wa.me/?text=${msg}`, "_blank");
      navigate({ to: "/" });
    }, 4000);
    return () => clearTimeout(timer);
  }, [submitted, registrationId, navigate]);

  const set =
    (field: keyof RegForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const toggleFacility = (f: string) =>
    setForm((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(f)
        ? prev.facilities.filter((x) => x !== f)
        : [...prev.facilities, f],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity || !actor) return;
    if (!form.utrNumber.trim()) {
      toast.error("UTR Number is required. Please complete the payment first.");
      return;
    }
    setLoading(true);
    try {
      const profile = {
        id: 0n,
        status: "pending" as any,
        masjidName: form.masjidName,
        address: form.address,
        city: form.city,
        state: form.state,
        contactPerson: form.contactPerson,
        phone: form.phone,
        email: form.email,
        registrationNumber: form.registrationNumber,
        capacity: BigInt(Number.parseInt(form.capacity) || 0),
        facilities: form.facilities,
        upiId: form.upiId,
        registeredBy: identity.getPrincipal(),
        timestamp: BigInt(Date.now()),
        presidentName: form.presidentName,
        presidentPhone: form.presidentPhone,
        secretaryName: form.secretaryName,
        secretaryPhone: form.secretaryPhone,
        treasurerName: form.treasurerName,
        treasurerPhone: form.treasurerPhone,
        utrNumber: form.utrNumber,
        masjidRegistrationId: "",
      };
      const result = await (actor as any).submitMasjidRegistration(profile);
      // result may be a string ID like "MASJID-2026-0001"
      const id = typeof result === "string" ? result : String(result);
      setRegistrationId(id);
      setSubmitted(true);
    } catch {
      toast.error("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div
        className="max-w-xl mx-auto px-4 py-16 text-center"
        data-ocid="masjid_register.success_state"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-10"
          style={{ backgroundColor: "#0B5A3A", border: "2px solid #D4AF37" }}
        >
          <p className="text-5xl mb-4">🕌</p>
          <h2
            className="text-2xl font-bold text-white mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Application Submitted!
          </h2>
          {registrationId && (
            <div
              className="rounded-xl px-6 py-4 mb-4 mx-auto max-w-xs"
              style={{
                backgroundColor: "rgba(212,175,55,0.2)",
                border: "1px solid #D4AF37",
              }}
            >
              <p className="text-xs text-white/70 mb-1">Your Registration ID</p>
              <p
                className="text-xl font-bold"
                style={{
                  color: "#D4AF37",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                {registrationId}
              </p>
            </div>
          )}
          <p className="text-white/80 leading-relaxed text-sm mb-4">
            Your application has been submitted. The admin will review and
            approve your registration. Your login credentials will be shared
            after verification and approval.
          </p>
          <p className="text-white/60 text-xs animate-pulse">
            Redirecting to home page and opening WhatsApp...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        className="max-w-xl mx-auto px-4 py-16 text-center"
        data-ocid="masjid_register.error_state"
      >
        <div
          className="rounded-2xl p-8"
          style={{ backgroundColor: "#FAF7E6", border: "2px solid #D4AF37" }}
        >
          <p className="text-4xl mb-4">🔐</p>
          <h2 className="text-xl font-bold mb-3" style={{ color: "#0B5A3A" }}>
            Login Required
          </h2>
          <p className="text-sm mb-6" style={{ color: "#1E7A52" }}>
            Please login to register your Masjid
          </p>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            data-ocid="masjid_register.login.button"
            style={{ backgroundColor: "#0B5A3A", color: "white" }}
          >
            {isLoggingIn ? "Connecting..." : "Login to Continue"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h2
          className="text-2xl font-bold"
          style={{ fontFamily: "'Playfair Display', serif", color: "#0B5A3A" }}
        >
          🕌 Register Your Masjid
        </h2>
        <p className="text-sm mt-1" style={{ color: "#1E7A52" }}>
          Fill in the details below. Your application will be reviewed by our
          admin team before approval.
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        onSubmit={handleSubmit}
        className="rounded-2xl p-6 space-y-6"
        style={{
          backgroundColor: "#FAF7E6",
          border: "1px solid rgba(212,175,55,0.5)",
        }}
        data-ocid="masjid_register.form"
      >
        {/* ── Masjid Basic Info ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 md:col-span-2">
            <Label style={{ color: "#0B5A3A" }}>Masjid Name *</Label>
            <Input
              value={form.masjidName}
              onChange={set("masjidName")}
              required
              placeholder="Masjid-e-..."
              data-ocid="masjid_register.masjid_name.input"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label style={{ color: "#0B5A3A" }}>Address *</Label>
            <Input
              value={form.address}
              onChange={set("address")}
              required
              placeholder="Street, Area"
              data-ocid="masjid_register.address.input"
            />
          </div>
          <div className="space-y-1">
            <Label style={{ color: "#0B5A3A" }}>City *</Label>
            <Input
              value={form.city}
              onChange={set("city")}
              required
              placeholder="Mumbai"
              data-ocid="masjid_register.city.input"
            />
          </div>
          <div className="space-y-1">
            <Label style={{ color: "#0B5A3A" }}>State *</Label>
            <Input
              value={form.state}
              onChange={set("state")}
              required
              placeholder="Maharashtra"
              data-ocid="masjid_register.state.input"
            />
          </div>
          <div className="space-y-1">
            <Label style={{ color: "#0B5A3A" }}>Contact Person *</Label>
            <Input
              value={form.contactPerson}
              onChange={set("contactPerson")}
              required
              placeholder="Imam / Secretary name"
              data-ocid="masjid_register.contact_person.input"
            />
          </div>
          <div className="space-y-1">
            <Label style={{ color: "#0B5A3A" }}>Phone *</Label>
            <Input
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              required
              placeholder="+91 XXXXX XXXXX"
              data-ocid="masjid_register.phone.input"
            />
          </div>
          <div className="space-y-1">
            <Label style={{ color: "#0B5A3A" }}>Email *</Label>
            <Input
              type="email"
              value={form.email}
              onChange={set("email")}
              required
              placeholder="masjid@example.com"
              data-ocid="masjid_register.email.input"
            />
          </div>
          <div className="space-y-1">
            <Label style={{ color: "#0B5A3A" }}>Registration Number *</Label>
            <Input
              value={form.registrationNumber}
              onChange={set("registrationNumber")}
              required
              placeholder="REG/2024/XXXX"
              data-ocid="masjid_register.reg_number.input"
            />
          </div>
          <div className="space-y-1">
            <Label style={{ color: "#0B5A3A" }}>Capacity (persons)</Label>
            <Input
              type="number"
              min="1"
              value={form.capacity}
              onChange={set("capacity")}
              placeholder="500"
              data-ocid="masjid_register.capacity.input"
            />
          </div>
          <div className="space-y-1">
            <Label style={{ color: "#0B5A3A" }}>UPI ID for Donations</Label>
            <Input
              value={form.upiId}
              onChange={set("upiId")}
              placeholder="example@upi"
              data-ocid="masjid_register.upi_id.input"
            />
            <p className="text-xs" style={{ color: "#1E7A52" }}>
              General users will donate directly to this UPI ID
            </p>
          </div>
        </div>

        {/* ── Committee Details ── */}
        <div className="space-y-3">
          <div
            className="flex items-center gap-3 pb-2"
            style={{ borderBottom: "1px solid rgba(212,175,55,0.4)" }}
          >
            <span className="text-lg">👥</span>
            <h3
              className="font-semibold text-base"
              style={{
                color: "#0B5A3A",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Committee Details
            </h3>
          </div>
          <p className="text-xs" style={{ color: "#1E7A52" }}>
            Provide the names and contact numbers of key committee members.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>President Name *</Label>
              <Input
                value={form.presidentName}
                onChange={set("presidentName")}
                required
                placeholder="Full Name"
                data-ocid="masjid_register.president_name.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>President Phone *</Label>
              <Input
                type="tel"
                value={form.presidentPhone}
                onChange={set("presidentPhone")}
                required
                placeholder="+91 XXXXX XXXXX"
                data-ocid="masjid_register.president_phone.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Secretary Name *</Label>
              <Input
                value={form.secretaryName}
                onChange={set("secretaryName")}
                required
                placeholder="Full Name"
                data-ocid="masjid_register.secretary_name.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Secretary Phone *</Label>
              <Input
                type="tel"
                value={form.secretaryPhone}
                onChange={set("secretaryPhone")}
                required
                placeholder="+91 XXXXX XXXXX"
                data-ocid="masjid_register.secretary_phone.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Treasurer Name *</Label>
              <Input
                value={form.treasurerName}
                onChange={set("treasurerName")}
                required
                placeholder="Full Name"
                data-ocid="masjid_register.treasurer_name.input"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Treasurer Phone *</Label>
              <Input
                type="tel"
                value={form.treasurerPhone}
                onChange={set("treasurerPhone")}
                required
                placeholder="+91 XXXXX XXXXX"
                data-ocid="masjid_register.treasurer_phone.input"
              />
            </div>
          </div>
        </div>

        {/* ── Facilities ── */}
        <div className="space-y-2">
          <Label style={{ color: "#0B5A3A" }}>Facilities Offered</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {FACILITIES.map((f) => (
              <div key={f} className="flex items-center gap-2">
                <Checkbox
                  id={`facility-${f}`}
                  checked={form.facilities.includes(f)}
                  onCheckedChange={() => toggleFacility(f)}
                  data-ocid="masjid_register.facilities.checkbox"
                />
                <Label
                  htmlFor={`facility-${f}`}
                  className="cursor-pointer text-sm"
                  style={{ color: "#0B5A3A" }}
                >
                  {f}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* ── Registration Fee Payment Block ── */}
        <div
          className="rounded-xl p-5 space-y-4"
          style={{
            backgroundColor: "#FFFDF0",
            border: "2px solid #D4AF37",
          }}
          data-ocid="masjid_register.payment.card"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">💳</span>
            <h3
              className="font-bold text-base"
              style={{
                color: "#0B5A3A",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Registration Fee Payment
            </h3>
          </div>

          {settingsLoading ? (
            <p
              className="text-sm"
              style={{ color: "#1E7A52" }}
              data-ocid="masjid_register.payment.loading_state"
            >
              Loading payment details...
            </p>
          ) : regSettings ? (
            <div className="space-y-2">
              <div
                className="rounded-lg px-4 py-3"
                style={{
                  backgroundColor: "rgba(212,175,55,0.1)",
                  border: "1px solid rgba(212,175,55,0.4)",
                }}
              >
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#0B5A3A" }}
                >
                  Please pay{" "}
                  <span style={{ color: "#D4AF37", fontSize: "1.1em" }}>
                    ₹{regSettings.feeAmount.toString()}
                  </span>{" "}
                  to UPI ID:{" "}
                  <span
                    className="font-bold select-all"
                    style={{ color: "#0B5A3A", letterSpacing: "0.03em" }}
                  >
                    {regSettings.upiId}
                  </span>
                </p>
                <p className="text-xs mt-1" style={{ color: "#1E7A52" }}>
                  After completing the payment, enter the UTR/Transaction
                  reference number below.
                </p>
              </div>
            </div>
          ) : (
            <div
              className="rounded-lg px-4 py-3 text-sm"
              style={{
                backgroundColor: "rgba(212,175,55,0.08)",
                color: "#7a6020",
              }}
              data-ocid="masjid_register.payment.error_state"
            >
              ⚠️ Registration fee details not configured. Please contact admin.
            </div>
          )}

          <div className="space-y-1">
            <Label style={{ color: "#0B5A3A" }}>
              UTR Number (Transaction Reference) *
            </Label>
            <Input
              value={form.utrNumber}
              onChange={set("utrNumber")}
              required
              placeholder="e.g. 123456789012"
              data-ocid="masjid_register.utr_number.input"
            />
            <p className="text-xs" style={{ color: "#c62828" }}>
              This is mandatory. Enter the UTR/reference number from your UPI
              payment.
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto"
          data-ocid="masjid_register.submit_button"
          style={{ backgroundColor: "#0B5A3A", color: "white" }}
        >
          {loading ? "Submitting..." : "Submit Registration"}
        </Button>
      </motion.form>
    </div>
  );
}
