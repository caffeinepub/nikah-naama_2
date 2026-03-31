import { NikahStatus } from "@/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useState } from "react";
import { toast } from "sonner";

interface FormData {
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

const initialForm: FormData = {
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

export default function RegisterPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { actor } = useActor();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [registrationId, setRegistrationId] = useState<bigint | null>(null);

  const set =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !identity || !actor) {
      toast.error("Please login first");
      return;
    }
    if (
      form.brideAadhaar.replace(/\s/g, "").length !== 12 ||
      form.groomAadhaar.replace(/\s/g, "").length !== 12
    ) {
      toast.error("Aadhaar must be 12 digits");
      return;
    }
    setLoading(true);
    try {
      const brideAadhaarHash = btoa(form.brideAadhaar.replace(/\s/g, ""));
      const groomAadhaarHash = btoa(form.groomAadhaar.replace(/\s/g, ""));
      const id = await actor.submitNikahRegistration({
        id: 0n,
        status: NikahStatus.pending,
        brideAadhaarHash,
        groomAadhaarHash,
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
      setRegistrationId(id);
      setForm(initialForm);
      toast.success("Registration submitted successfully!");
    } catch {
      toast.error("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-2" style={{ color: "#0B5A3A" }}>
        Nikah Registration
      </h2>
      <p className="text-sm mb-6" style={{ color: "#1E7A52" }}>
        Register your Nikah digitally with official verification
      </p>

      {registrationId !== null && (
        <div
          className="rounded-xl p-5 mb-6"
          style={{ backgroundColor: "#FAF7E6", border: "2px solid #D4AF37" }}
          data-ocid="register.success_state"
        >
          <h3 className="font-semibold mb-1" style={{ color: "#0B5A3A" }}>
            ✅ Registration Submitted!
          </h3>
          <p className="text-sm" style={{ color: "#1E7A52" }}>
            Your registration ID: <strong>{registrationId.toString()}</strong>
          </p>
          <p className="text-xs mt-2" style={{ color: "#1E7A52" }}>
            Pending admin approval. You will receive your certificate once
            approved.
          </p>
        </div>
      )}

      {!isAuthenticated ? (
        <div
          className="rounded-xl p-8 text-center"
          style={{ backgroundColor: "#FAF7E6", border: "1px solid #D4AF37" }}
          data-ocid="register.login.card"
        >
          <p className="mb-4" style={{ color: "#0B5A3A" }}>
            Please login to submit a Nikah registration
          </p>
          <Button
            onClick={() => login()}
            disabled={isLoggingIn}
            data-ocid="register.login.button"
            style={{ backgroundColor: "#0B5A3A", color: "white" }}
          >
            {isLoggingIn ? "Logging in..." : "Login to Continue"}
          </Button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl p-6"
          style={{
            backgroundColor: "#FAF7E6",
            border: "1px solid rgba(212,175,55,0.5)",
          }}
          data-ocid="register.form"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Bride Name *</Label>
              <Input
                data-ocid="register.bride_name.input"
                value={form.brideName}
                onChange={set("brideName")}
                required
                placeholder="Full name of bride"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Groom Name *</Label>
              <Input
                data-ocid="register.groom_name.input"
                value={form.groomName}
                onChange={set("groomName")}
                required
                placeholder="Full name of groom"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>
                Bride Aadhaar (12 digits) *
              </Label>
              <Input
                data-ocid="register.bride_aadhaar.input"
                value={form.brideAadhaar}
                onChange={set("brideAadhaar")}
                required
                type="password"
                maxLength={12}
                placeholder="123456789012"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>
                Groom Aadhaar (12 digits) *
              </Label>
              <Input
                data-ocid="register.groom_aadhaar.input"
                value={form.groomAadhaar}
                onChange={set("groomAadhaar")}
                required
                type="password"
                maxLength={12}
                placeholder="123456789012"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Date of Nikah *</Label>
              <Input
                data-ocid="register.nikah_date.input"
                value={form.nikahDate}
                onChange={set("nikahDate")}
                required
                type="date"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>City *</Label>
              <Input
                data-ocid="register.city.input"
                value={form.city}
                onChange={set("city")}
                required
                placeholder="City"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Masjid / Venue *</Label>
              <Input
                data-ocid="register.masjid_venue.input"
                value={form.masjidVenue}
                onChange={set("masjidVenue")}
                required
                placeholder="Masjid or venue name"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Qazi Name *</Label>
              <Input
                data-ocid="register.qazi_name.input"
                value={form.qaziName}
                onChange={set("qaziName")}
                required
                placeholder="Name of the Qazi"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Witness 1 *</Label>
              <Input
                data-ocid="register.witness1.input"
                value={form.witness1}
                onChange={set("witness1")}
                required
                placeholder="First witness name"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Witness 2 *</Label>
              <Input
                data-ocid="register.witness2.input"
                value={form.witness2}
                onChange={set("witness2")}
                required
                placeholder="Second witness name"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="mt-6 w-full font-semibold"
            data-ocid="register.submit_button"
            style={{ backgroundColor: "#0B5A3A", color: "white" }}
          >
            {loading ? "Submitting..." : "Submit Nikah Registration"}
          </Button>
        </form>
      )}
    </div>
  );
}
