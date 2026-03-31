import { Button } from "@/components/ui/button";
import { useActor } from "@/hooks/useActor";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface MasjidWithUpi {
  id: bigint;
  masjidName: string;
  address: string;
  city: string;
  state: string;
  contactPerson: string;
  phone: string;
  upiId: string;
  facilities: string[];
}

export default function DonationsPage() {
  const { actor, isFetching } = useActor();
  const [selected, setSelected] = useState<MasjidWithUpi | null>(null);

  const { data: masjids = [], isLoading } = useQuery<MasjidWithUpi[]>({
    queryKey: ["approvedMasjids"],
    queryFn: () => (actor as any).getApprovedMasjids(),
    enabled: !!actor && !isFetching,
  });

  const copyUpi = (upiId: string) => {
    navigator.clipboard.writeText(upiId);
    toast.success("UPI ID copied!");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h2
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "'Playfair Display', serif", color: "#0B5A3A" }}
        >
          🤲 Donate to a Masjid
        </h2>
        <p className="text-sm" style={{ color: "#1E7A52" }}>
          Select a registered Masjid and donate directly via UPI
        </p>
      </motion.div>

      {isLoading && (
        <p
          className="text-center py-8"
          style={{ color: "#1E7A52" }}
          data-ocid="donations.loading_state"
        >
          Loading Masjids...
        </p>
      )}

      {!isLoading && masjids.length === 0 && (
        <div
          className="text-center py-12 rounded-xl"
          style={{ backgroundColor: "#FAF7E6", border: "2px solid #D4AF37" }}
          data-ocid="donations.empty_state"
        >
          <p className="text-3xl mb-3">🕌</p>
          <p className="font-semibold" style={{ color: "#0B5A3A" }}>
            No Masjids registered yet
          </p>
          <p className="text-sm mt-1" style={{ color: "#1E7A52" }}>
            Check back once Masjids are approved by the admin.
          </p>
        </div>
      )}

      {!selected && masjids.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          data-ocid="donations.list"
        >
          {masjids.map((m, i) => (
            <button
              type="button"
              key={m.id.toString()}
              onClick={() => setSelected(m)}
              data-ocid={`donations.item.${i + 1}`}
              className="text-left rounded-xl p-5 transition-all hover:shadow-md"
              style={{
                backgroundColor: "#FAF7E6",
                border: "2px solid #D4AF37",
                cursor: "pointer",
              }}
            >
              <p className="text-2xl mb-2">🕌</p>
              <p
                className="font-semibold"
                style={{
                  color: "#0B5A3A",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                {m.masjidName}
              </p>
              <p className="text-sm mt-1" style={{ color: "#1E7A52" }}>
                {m.city}, {m.state}
              </p>
              {m.facilities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {m.facilities.slice(0, 3).map((f) => (
                    <span
                      key={f}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "#0B5A3A", color: "white" }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs mt-3" style={{ color: "#D4AF37" }}>
                Tap to donate →
              </p>
            </button>
          ))}
        </motion.div>
      )}

      {selected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          data-ocid="donations.card"
        >
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="flex items-center gap-1 text-sm mb-4"
            style={{ color: "#1E7A52" }}
            data-ocid="donations.back.button"
          >
            ← Back to all Masjids
          </button>

          <div
            className="rounded-2xl p-8"
            style={{ backgroundColor: "#FAF7E6", border: "2px solid #D4AF37" }}
          >
            <p className="text-4xl mb-3 text-center">🕌</p>
            <h3
              className="text-xl font-bold text-center mb-1"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#0B5A3A",
              }}
            >
              {selected.masjidName}
            </h3>
            <p
              className="text-center text-sm mb-6"
              style={{ color: "#1E7A52" }}
            >
              {selected.address}, {selected.city}, {selected.state}
            </p>

            {selected.upiId ? (
              <div className="space-y-4">
                <div
                  className="rounded-xl p-5 text-center"
                  style={{ backgroundColor: "#0B5A3A" }}
                >
                  <p
                    className="text-xs font-medium mb-1"
                    style={{ color: "#D4AF37" }}
                  >
                    UPI ID for Donations
                  </p>
                  <p className="text-white font-mono text-lg break-all">
                    {selected.upiId}
                  </p>
                  <Button
                    onClick={() => copyUpi(selected.upiId)}
                    className="mt-3"
                    size="sm"
                    data-ocid="donations.copy.button"
                    style={{ backgroundColor: "#D4AF37", color: "#0B5A3A" }}
                  >
                    📋 Copy UPI ID
                  </Button>
                </div>
                <p className="text-xs text-center" style={{ color: "#1E7A52" }}>
                  Open any UPI app (GPay, PhonePe, Paytm) and pay to the above
                  UPI ID. May Allah accept your donation. 🤲
                </p>
              </div>
            ) : (
              <p className="text-center text-sm" style={{ color: "#1E7A52" }}>
                UPI information not yet set up for this Masjid.
              </p>
            )}

            {selected.phone && (
              <div
                className="mt-6 pt-4"
                style={{ borderTop: "1px solid rgba(212,175,55,0.3)" }}
              >
                <p className="text-xs text-center" style={{ color: "#1E7A52" }}>
                  Contact: {selected.contactPerson} · {selected.phone}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
