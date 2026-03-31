import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { motion } from "motion/react";
import { useState } from "react";
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
};

export default function MasjidRegisterPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { actor } = useActor();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const [form, setForm] = useState<RegForm>(INIT);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
      };
      await (actor as any).submitMasjidRegistration(profile);
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
          <p className="text-white/80 leading-relaxed">
            Your application has been submitted. The admin will review and
            approve your registration. You will be able to manage your Masjid
            profile once approved.
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
        className="rounded-2xl p-6 space-y-5"
        style={{
          backgroundColor: "#FAF7E6",
          border: "1px solid rgba(212,175,55,0.5)",
        }}
        data-ocid="masjid_register.form"
      >
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
