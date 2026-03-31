import { NikahStatus } from "@/backend";
import type { NikahRegistration, ZakatSettings } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

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
}

function MasjidEditRow({
  m,
  onSave,
}: {
  m: LocalMasjidProfile;
  onSave: (id: bigint, profile: LocalMasjidProfile) => void;
}) {
  const [editing, setEditing] = useState(false);
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
          <div>
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
              onClick={() => setEditing(true)}
              data-ocid="admin.masjid.edit_button"
              style={{ backgroundColor: "#D4AF37", color: "#0B5A3A" }}
            >
              Edit
            </Button>
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
              <Label style={{ color: "#0B5A3A" }}>UPI ID for Donations</Label>
              <Input
                value={form.upiId}
                onChange={set("upiId")}
                placeholder="example@upi"
                data-ocid="admin.edit_masjid.upi.input"
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

export default function AdminPage() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
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
    queryFn: () => actor!.isCallerAdmin(),
    enabled: !!actor && isAuthenticated,
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
      (actor as any).adminUpdateMasjidProfile(id, profile),
    onSuccess: () => {
      toast.success("Masjid updated!");
      qc.invalidateQueries({ queryKey: ["allMasjids"] });
      qc.invalidateQueries({ queryKey: ["pendingMasjids"] });
    },
    onError: () => toast.error("Failed to update Masjid"),
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
      <div
        className="max-w-xl mx-auto px-4 py-12 text-center"
        data-ocid="admin.error_state"
      >
        <p className="text-lg font-semibold" style={{ color: "#c62828" }}>
          Access Denied
        </p>
        <p className="text-sm mt-2" style={{ color: "#1E7A52" }}>
          You do not have admin privileges.
        </p>
      </div>
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
            All Registrations
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
        </TabsList>

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

        <TabsContent value="all" data-ocid="admin.all.panel">
          <div className="space-y-3">
            {all.map((reg, i) => (
              <div
                key={reg.id.toString()}
                data-ocid={`admin.all.item.${i + 1}`}
                className="flex items-center justify-between rounded-xl px-5 py-3"
                style={{
                  backgroundColor: "#FAF7E6",
                  border: "1px solid rgba(212,175,55,0.3)",
                }}
              >
                <div>
                  <p
                    className="font-medium text-sm"
                    style={{ color: "#0B5A3A" }}
                  >
                    #{reg.id.toString()} — {reg.brideName} &amp; {reg.groomName}
                  </p>
                  <p className="text-xs" style={{ color: "#1E7A52" }}>
                    {reg.city} • {reg.nikahDate}
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
            ))}
            {all.length === 0 && (
              <p style={{ color: "#1E7A52" }} data-ocid="admin.all.empty_state">
                No registrations yet.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="masjids" data-ocid="admin.masjids.panel">
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
              />
            ))}
            {allMasjids.length === 0 && (
              <p style={{ color: "#1E7A52" }}>No Masjids registered yet.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent
          value="zakat_profiles"
          data-ocid="admin.zakat_profiles.panel"
        >
          <h3 className="font-semibold mb-4" style={{ color: "#0B5A3A" }}>
            🤲 All Zakat Profiles
          </h3>
          <ZakatProfilesAdminTab />
        </TabsContent>

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
      </Tabs>
    </div>
  );
}
