import type { JobPosting } from "@/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function JobsPage() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    contact: "",
  });

  const { data: jobs = [], isLoading } = useQuery<JobPosting[]>({
    queryKey: ["jobs"],
    queryFn: () => actor!.getAllJobPostings(),
    enabled: !!actor,
  });

  const postMutation = useMutation({
    mutationFn: async () => {
      if (!identity || !actor) throw new Error("Not ready");
      await actor.postJobPosting({
        id: 0n,
        title: form.title,
        company: form.company,
        location: form.location,
        description: form.description,
        contact: form.contact,
        postedBy: identity.getPrincipal(),
        timestamp: BigInt(Date.now()),
      });
    },
    onSuccess: () => {
      toast.success("Job posted!");
      qc.invalidateQueries({ queryKey: ["jobs"] });
      setShowForm(false);
      setForm({
        title: "",
        company: "",
        location: "",
        description: "",
        contact: "",
      });
    },
    onError: () => toast.error("Failed to post job"),
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#0B5A3A" }}>
            Jobs Board
          </h2>
          <p className="text-sm" style={{ color: "#1E7A52" }}>
            Islamic community job postings
          </p>
        </div>
        {isAuthenticated && (
          <Button
            onClick={() => setShowForm(!showForm)}
            data-ocid="jobs.open_modal_button"
            style={{ backgroundColor: "#0B5A3A", color: "white" }}
          >
            {showForm ? "Cancel" : "+ Post Job"}
          </Button>
        )}
      </div>

      {showForm && (
        <div
          className="rounded-xl p-6 mb-8"
          style={{ backgroundColor: "#FAF7E6", border: "2px solid #D4AF37" }}
          data-ocid="jobs.modal"
        >
          <h3 className="font-semibold mb-4" style={{ color: "#0B5A3A" }}>
            Post a Job
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Job Title</Label>
              <Input
                data-ocid="jobs.title.input"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Software Engineer"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Company</Label>
              <Input
                data-ocid="jobs.company.input"
                value={form.company}
                onChange={(e) =>
                  setForm((p) => ({ ...p, company: e.target.value }))
                }
                placeholder="Company name"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>Location</Label>
              <Input
                data-ocid="jobs.location.input"
                value={form.location}
                onChange={(e) =>
                  setForm((p) => ({ ...p, location: e.target.value }))
                }
                placeholder="City, State"
              />
            </div>
            <div className="space-y-1">
              <Label style={{ color: "#0B5A3A" }}>WhatsApp Contact</Label>
              <Input
                data-ocid="jobs.contact.input"
                value={form.contact}
                onChange={(e) =>
                  setForm((p) => ({ ...p, contact: e.target.value }))
                }
                placeholder="91XXXXXXXXXX"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label style={{ color: "#0B5A3A" }}>Description</Label>
              <Textarea
                data-ocid="jobs.description.textarea"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Job description, requirements..."
                rows={3}
              />
            </div>
          </div>
          <Button
            onClick={() => postMutation.mutate()}
            disabled={postMutation.isPending}
            className="mt-4"
            data-ocid="jobs.submit_button"
            style={{ backgroundColor: "#0B5A3A", color: "white" }}
          >
            {postMutation.isPending ? "Posting..." : "Post Job"}
          </Button>
        </div>
      )}

      {isLoading ? (
        <div
          className="text-center py-12"
          data-ocid="jobs.loading_state"
          style={{ color: "#1E7A52" }}
        >
          Loading jobs...
        </div>
      ) : jobs.length === 0 ? (
        <div
          className="text-center py-12"
          data-ocid="jobs.empty_state"
          style={{ color: "#1E7A52" }}
        >
          No jobs posted yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job, i) => (
            <div
              key={job.id.toString()}
              className="rounded-xl p-5"
              data-ocid={`jobs.item.${i + 1}`}
              style={{
                backgroundColor: "#FAF7E6",
                border: "1px solid rgba(212,175,55,0.4)",
              }}
            >
              <h3
                className="font-semibold text-lg mb-1"
                style={{ color: "#0B5A3A" }}
              >
                {job.title}
              </h3>
              <p
                className="font-medium text-sm mb-2"
                style={{ color: "#1E7A52" }}
              >
                {job.company}
              </p>
              <p className="text-sm mb-1" style={{ color: "#1E7A52" }}>
                📍 {job.location}
              </p>
              <p
                className="text-sm mt-2 opacity-80"
                style={{ color: "#1E7A52" }}
              >
                {job.description}
              </p>
              {job.contact && (
                <a
                  href={`https://wa.me/${job.contact}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid={`jobs.whatsapp.button.${i + 1}`}
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
