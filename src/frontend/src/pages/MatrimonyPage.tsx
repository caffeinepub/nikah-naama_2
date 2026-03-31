import { Gender } from "@/backend";
import type { MatrimonyProposal } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function MatrimonyPage() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    age: "",
    city: "",
    education: "",
    profession: "",
    contact: "",
    gender: "male" as "male" | "female",
    description: "",
  });

  const { data: proposals = [], isLoading } = useQuery<MatrimonyProposal[]>({
    queryKey: ["matrimony"],
    queryFn: () => actor!.getAllMatrimonyProposals(),
    enabled: !!actor,
  });

  const postMutation = useMutation({
    mutationFn: async () => {
      if (!identity || !actor) throw new Error("Not ready");
      await actor.postMatrimonyProposal({
        id: 0n,
        name: form.name,
        age: BigInt(form.age),
        city: form.city,
        education: form.education,
        profession: form.profession,
        contact: form.contact,
        gender: form.gender === "male" ? Gender.male : Gender.female,
        description: form.description,
        postedBy: identity.getPrincipal(),
        timestamp: BigInt(Date.now()),
      });
    },
    onSuccess: () => {
      toast.success("Proposal posted!");
      qc.invalidateQueries({ queryKey: ["matrimony"] });
      setShowForm(false);
      setForm({
        name: "",
        age: "",
        city: "",
        education: "",
        profession: "",
        contact: "",
        gender: "male",
        description: "",
      });
    },
    onError: () => toast.error("Failed to post proposal"),
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#0B5A3A" }}>
            Matrimony Board
          </h2>
          <p className="text-sm" style={{ color: "#1E7A52" }}>
            Find your compatible match through our community proposals
          </p>
        </div>
        {isAuthenticated && (
          <Button
            onClick={() => setShowForm(!showForm)}
            data-ocid="matrimony.open_modal_button"
            style={{ backgroundColor: "#0B5A3A", color: "white" }}
          >
            {showForm ? "Cancel" : "+ Post Proposal"}
          </Button>
        )}
      </div>

      {showForm && (
        <div
          className="rounded-xl p-6 mb-8"
          style={{ backgroundColor: "#FAF7E6", border: "2px solid #D4AF37" }}
          data-ocid="matrimony.modal"
        >
          <h3 className="font-semibold mb-4" style={{ color: "#0B5A3A" }}>
            Post Matrimony Proposal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Name</Label>
              <Input
                data-ocid="matrimony.name.input"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Full name"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Age</Label>
              <Input
                data-ocid="matrimony.age.input"
                type="number"
                value={form.age}
                onChange={(e) =>
                  setForm((p) => ({ ...p, age: e.target.value }))
                }
                placeholder="Age"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>City</Label>
              <Input
                data-ocid="matrimony.city.input"
                value={form.city}
                onChange={(e) =>
                  setForm((p) => ({ ...p, city: e.target.value }))
                }
                placeholder="City"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Education</Label>
              <Input
                data-ocid="matrimony.education.input"
                value={form.education}
                onChange={(e) =>
                  setForm((p) => ({ ...p, education: e.target.value }))
                }
                placeholder="Highest qualification"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Profession</Label>
              <Input
                data-ocid="matrimony.profession.input"
                value={form.profession}
                onChange={(e) =>
                  setForm((p) => ({ ...p, profession: e.target.value }))
                }
                placeholder="Profession"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>WhatsApp Number</Label>
              <Input
                data-ocid="matrimony.contact.input"
                value={form.contact}
                onChange={(e) =>
                  setForm((p) => ({ ...p, contact: e.target.value }))
                }
                placeholder="91XXXXXXXXXX"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Gender</Label>
              <Select
                value={form.gender}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, gender: v as "male" | "female" }))
                }
              >
                <SelectTrigger data-ocid="matrimony.gender.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label style={{ color: "#0B5A3A" }}>Description</Label>
              <Textarea
                data-ocid="matrimony.description.textarea"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Brief description about yourself..."
                rows={3}
              />
            </div>
          </div>
          <Button
            onClick={() => postMutation.mutate()}
            disabled={postMutation.isPending}
            className="mt-4"
            data-ocid="matrimony.submit_button"
            style={{ backgroundColor: "#0B5A3A", color: "white" }}
          >
            {postMutation.isPending ? "Posting..." : "Post Proposal"}
          </Button>
        </div>
      )}

      {isLoading ? (
        <div
          className="text-center py-12"
          data-ocid="matrimony.loading_state"
          style={{ color: "#1E7A52" }}
        >
          Loading proposals...
        </div>
      ) : proposals.length === 0 ? (
        <div
          className="text-center py-12"
          data-ocid="matrimony.empty_state"
          style={{ color: "#1E7A52" }}
        >
          No proposals yet. Be the first to post!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proposals.map((p, i) => (
            <div
              key={p.id.toString()}
              className="rounded-xl p-5"
              data-ocid={`matrimony.item.${i + 1}`}
              style={{
                backgroundColor: "#FAF7E6",
                border: "1px solid rgba(212,175,55,0.4)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold" style={{ color: "#0B5A3A" }}>
                  {p.name}
                </h3>
                <Badge
                  style={{
                    backgroundColor:
                      p.gender === Gender.male ? "#1E7A52" : "#c2185b",
                    color: "white",
                  }}
                >
                  {p.gender === Gender.male ? "Male" : "Female"}
                </Badge>
              </div>
              <div className="space-y-1 text-sm" style={{ color: "#1E7A52" }}>
                <p>🎂 Age: {p.age.toString()}</p>
                <p>📍 {p.city}</p>
                <p>🎓 {p.education}</p>
                <p>💼 {p.profession}</p>
                {p.description && (
                  <p className="text-xs mt-2 opacity-80">{p.description}</p>
                )}
              </div>
              {p.contact && (
                <a
                  href={`https://wa.me/${p.contact}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid={`matrimony.whatsapp.button.${i + 1}`}
                  className="mt-3 flex items-center gap-2 w-full justify-center py-2 rounded-lg text-sm font-medium no-underline"
                  style={{ backgroundColor: "#25D366", color: "white" }}
                >
                  💬 WhatsApp
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
