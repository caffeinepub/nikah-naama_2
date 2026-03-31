import { NikahStatus } from "@/backend";
import type { Certificate } from "@/backend";
import { useActor } from "@/hooks/useActor";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

export default function CertificatePage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const { actor } = useActor();

  const {
    data: cert,
    isLoading,
    isError,
  } = useQuery<Certificate | null>({
    queryKey: ["certificate", id],
    queryFn: async () => {
      if (!id || !actor) return null;
      const reg = await actor.getNikahRegistration(BigInt(id));
      if (!reg || reg.status !== NikahStatus.approved) return null;
      return actor.generateCertificate(BigInt(id));
    },
    enabled: !!id && !!actor,
  });

  const shareUrl = `${window.location.origin}/certificate/${id}`;
  const whatsappText = cert
    ? `Nikah Certificate: ${cert.nikah.brideName} & ${cert.nikah.groomName} - ${shareUrl}`
    : shareUrl;

  if (isLoading) {
    return (
      <div
        className="max-w-2xl mx-auto px-4 py-12 text-center"
        data-ocid="certificate.loading_state"
      >
        <p style={{ color: "#1E7A52" }}>Loading certificate...</p>
      </div>
    );
  }

  if (isError || !cert) {
    return (
      <div
        className="max-w-2xl mx-auto px-4 py-12 text-center"
        data-ocid="certificate.error_state"
      >
        <p style={{ color: "#0B5A3A" }} className="text-lg font-semibold">
          Certificate Not Available
        </p>
        <p className="text-sm mt-2" style={{ color: "#1E7A52" }}>
          This registration may be pending approval or does not exist.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div
        data-ocid="certificate.panel"
        className="rounded-2xl p-8 text-center"
        style={{
          backgroundColor: "#FAF7E6",
          border: "6px double #D4AF37",
          boxShadow:
            "0 4px 32px rgba(11,90,58,0.15), inset 0 0 0 2px rgba(212,175,55,0.2)",
        }}
      >
        <p
          className="text-2xl mb-2"
          style={{ color: "#D4AF37", fontFamily: "serif" }}
        >
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
        </p>
        <div className="flex justify-center mb-2">
          <div className="flex-1 h-px" style={{ backgroundColor: "#D4AF37" }} />
          <span className="mx-3" style={{ color: "#D4AF37" }}>
            ✦
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: "#D4AF37" }} />
        </div>

        <h1
          className="text-3xl font-bold mb-1"
          style={{ color: "#0B5A3A", fontFamily: "'Playfair Display', serif" }}
        >
          NIKAH NAAMA
        </h1>
        <p
          className="text-xs tracking-widest mb-4"
          style={{ color: "#1E7A52" }}
        >
          OFFICIAL ISLAMIC MARRIAGE CERTIFICATE
        </p>

        <div
          className="rounded-lg p-4 mb-6"
          style={{
            backgroundColor: "rgba(11,90,58,0.05)",
            border: "1px solid rgba(212,175,55,0.3)",
          }}
        >
          <p className="text-xs" style={{ color: "#1E7A52" }}>
            Certificate Number
          </p>
          <p className="font-mono font-semibold" style={{ color: "#0B5A3A" }}>
            {cert.certificateNumber}
          </p>
        </div>

        <p className="text-sm mb-3" style={{ color: "#1E7A52" }}>
          This certifies the Nikah of
        </p>
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "#0B5A3A", fontFamily: "'Playfair Display', serif" }}
        >
          {cert.nikah.brideName}
          <span
            className="text-base font-normal mx-3"
            style={{ color: "#D4AF37" }}
          >
            &amp;
          </span>
          {cert.nikah.groomName}
        </h2>

        <div className="grid grid-cols-2 gap-3 text-left mb-6">
          {(
            [
              ["Date of Nikah", cert.nikah.nikahDate],
              ["City", cert.nikah.city],
              ["Masjid / Venue", cert.nikah.masjidVenue],
              ["Qazi", cert.nikah.qaziName],
              ["Witness 1", cert.nikah.witness1],
              ["Witness 2", cert.nikah.witness2],
            ] as [string, string][]
          ).map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg p-3"
              style={{
                backgroundColor: "rgba(11,90,58,0.05)",
                border: "1px solid rgba(212,175,55,0.2)",
              }}
            >
              <p className="text-xs" style={{ color: "#1E7A52" }}>
                {label}
              </p>
              <p className="font-medium text-sm" style={{ color: "#0B5A3A" }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-center mb-4">
          <div
            className="w-20 h-20 rounded-full flex flex-col items-center justify-center"
            style={{ backgroundColor: "#0B5A3A", border: "3px solid #D4AF37" }}
          >
            <span className="text-2xl">✦</span>
            <p className="text-xs font-bold" style={{ color: "#D4AF37" }}>
              VERIFIED
            </p>
          </div>
        </div>

        <p className="text-xs" style={{ color: "#1E7A52" }}>
          Issued by Nikah Naama | www.nikahnaama.org
        </p>
      </div>

      <div className="mt-6 flex gap-3 justify-center">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
          target="_blank"
          rel="noopener noreferrer"
          data-ocid="certificate.whatsapp.button"
          className="flex items-center gap-2 px-6 py-2 rounded-full font-medium no-underline"
          style={{ backgroundColor: "#25D366", color: "white" }}
        >
          💬 Share on WhatsApp
        </a>
      </div>
    </div>
  );
}
