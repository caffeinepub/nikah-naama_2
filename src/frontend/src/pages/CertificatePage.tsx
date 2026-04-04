import { NikahStatus } from "@/backend";
import type { Certificate, NikahRegistration } from "@/backend";
import { useActor } from "@/hooks/useActor";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Printer } from "lucide-react";

// Always-show signature block — empty bordered box when no dataUrl
function SigBlock({ label, dataUrl }: { label: string; dataUrl?: string }) {
  return (
    <div style={{ textAlign: "center", padding: "8px" }}>
      <div
        style={{
          width: "100%",
          height: "70px",
          border: "1px solid rgba(212,175,55,0.5)",
          backgroundColor: "white",
          marginBottom: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "4px",
        }}
      >
        {dataUrl && (
          <img
            src={dataUrl}
            alt={label}
            style={{
              maxHeight: "64px",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        )}
      </div>
      <div style={{ borderTop: "1px solid #0B5A3A", paddingTop: "4px" }}>
        <p
          style={{
            fontSize: "11px",
            color: "#0B5A3A",
            fontWeight: 600,
            margin: 0,
          }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

// Corner ornament — absolutely positioned ✦
function Corner({
  top,
  bottom,
  left,
  right,
}: {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
}) {
  return (
    <span
      style={{
        position: "absolute",
        top,
        bottom,
        left,
        right,
        color: "#D4AF37",
        fontSize: "18px",
        lineHeight: 1,
        fontFamily: "serif",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      ✦
    </span>
  );
}

function GoldDivider({ thin }: { thin?: boolean }) {
  return (
    <div
      style={{ display: "flex", alignItems: "center", marginBottom: "18px" }}
    >
      <div
        style={{
          flex: 1,
          height: thin ? "1px" : "1px",
          backgroundColor: thin ? "rgba(212,175,55,0.4)" : "#D4AF37",
        }}
      />
      <span
        style={{
          margin: "0 12px",
          color: "#D4AF37",
          fontSize: thin ? "12px" : "16px",
        }}
      >
        {thin ? "❖" : "✦"}
      </span>
      <div
        style={{
          flex: 1,
          height: "1px",
          backgroundColor: thin ? "rgba(212,175,55,0.4)" : "#D4AF37",
        }}
      />
    </div>
  );
}

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
      return actor.generateCertificate(BigInt(id)) as Promise<Certificate>;
    },
    enabled: !!id && !!actor,
  });

  const shareUrl = `${window.location.origin}/certificate/${id}`;
  const n = cert?.nikah;
  const whatsappText = cert
    ? `Nikah Certificate: ${n?.brideName} & ${n?.groomName}${n?.nikahUniqueId ? ` — ${n.nikahUniqueId}` : ""} | ${shareUrl}`
    : shareUrl;

  if (isLoading) {
    return (
      <div
        className="max-w-3xl mx-auto px-4 py-12 text-center"
        data-ocid="certificate.loading_state"
      >
        <p
          style={{ color: "#1E7A52", fontFamily: "'Playfair Display', serif" }}
        >
          Loading certificate...
        </p>
      </div>
    );
  }

  if (isError || !cert) {
    return (
      <div
        className="max-w-3xl mx-auto px-4 py-12 text-center"
        data-ocid="certificate.error_state"
      >
        <p
          style={{
            color: "#0B5A3A",
            fontFamily: "'Playfair Display', serif",
            fontSize: "20px",
            fontWeight: 700,
          }}
        >
          Certificate Not Available
        </p>
        <p style={{ color: "#1E7A52", marginTop: "8px", fontSize: "14px" }}>
          This registration may be pending approval or does not exist.
        </p>
      </div>
    );
  }

  const allSigs: { label: string; dataUrl?: string }[] = [
    { label: "Groom", dataUrl: n?.groomSignature },
    { label: "Bride", dataUrl: n?.brideSignature },
    { label: "Imam / Qazi", dataUrl: n?.qaziSignature },
    { label: "Witness 1", dataUrl: n?.witness1Signature },
    { label: "Witness 2", dataUrl: n?.witness2Signature },
    { label: "Masjid Authority", dataUrl: n?.masjidSignature },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;800&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap');
        @media print {
          body * { visibility: hidden; }
          #certificate-print-area, #certificate-print-area * { visibility: visible; }
          #certificate-print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div
        className="max-w-3xl mx-auto px-4 py-8"
        style={{ backgroundColor: "#FAF7E6", minHeight: "100vh" }}
      >
        <div id="certificate-print-area" data-ocid="certificate.panel">
          {/* ── Outer double-border frame ── */}
          <div
            style={{
              border: "6px double #D4AF37",
              padding: "10px",
              background: "#FAF7E6",
              position: "relative",
              borderRadius: "2px",
            }}
          >
            {/* Outer corner ornaments */}
            <Corner top="2px" left="2px" />
            <Corner top="2px" right="2px" />
            <Corner bottom="2px" left="2px" />
            <Corner bottom="2px" right="2px" />

            {/* ── Inner border ── */}
            <div
              style={{
                border: "2px solid #D4AF37",
                padding: "36px 44px",
                position: "relative",
              }}
            >
              {/* Inner corner ornaments */}
              <Corner top="4px" left="4px" />
              <Corner top="4px" right="4px" />
              <Corner bottom="4px" left="4px" />
              <Corner bottom="4px" right="4px" />

              {/* ── 1. Bismillah ── */}
              <div style={{ textAlign: "center", marginBottom: "12px" }}>
                <p
                  style={{
                    color: "#D4AF37",
                    fontSize: "22px",
                    fontFamily: "'Amiri', 'Traditional Arabic', serif",
                    direction: "rtl",
                    lineHeight: 1.8,
                    margin: 0,
                  }}
                >
                  بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
                </p>
              </div>

              {/* ── 2. Masjid Name — BOLD header ── */}
              <div style={{ textAlign: "center", marginBottom: "4px" }}>
                <p
                  style={{
                    color: "#0B5A3A",
                    fontSize: "22px",
                    fontWeight: 700,
                    fontFamily: "'Playfair Display', serif",
                    lineHeight: 1.3,
                    margin: 0,
                  }}
                >
                  {n?.masjidVenue || "Masjid Name"}
                </p>
              </div>

              {/* ── 3. Masjid City/Address — normal font ── */}
              {n?.city && (
                <div style={{ textAlign: "center", marginBottom: "14px" }}>
                  <p
                    style={{
                      color: "#0B5A3A",
                      fontSize: "13px",
                      fontWeight: 400,
                      fontFamily: "'Playfair Display', serif",
                      margin: 0,
                    }}
                  >
                    {n.city}
                  </p>
                </div>
              )}

              {/* ── 4. Gold divider ── */}
              <GoldDivider />

              {/* ── 5. Nikah Naama title ── */}
              <div style={{ textAlign: "center", marginBottom: "4px" }}>
                <h1
                  style={{
                    color: "#0B5A3A",
                    fontSize: "30px",
                    fontWeight: 800,
                    fontFamily: "'Playfair Display', serif",
                    margin: 0,
                    letterSpacing: "0.04em",
                  }}
                >
                  Nikah Naama
                </h1>
              </div>

              {/* ── 6. Marriage Certificate subtitle ── */}
              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <p
                  style={{
                    color: "#1E7A52",
                    fontSize: "11px",
                    letterSpacing: "0.25em",
                    textTransform: "uppercase" as const,
                    fontFamily: "sans-serif",
                    margin: 0,
                  }}
                >
                  Marriage Certificate
                </p>
              </div>

              {/* ── 7. Certificate & Nikah ID badges ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: n?.nikahUniqueId ? "1fr 1fr" : "1fr",
                  gap: "10px",
                  marginBottom: "22px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "rgba(11,90,58,0.05)",
                    border: "1px solid rgba(212,175,55,0.35)",
                    borderRadius: "6px",
                    padding: "10px 14px",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: "10px",
                      color: "#1E7A52",
                      margin: "0 0 3px",
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.1em",
                    }}
                  >
                    Certificate No.
                  </p>
                  <p
                    style={{
                      fontFamily: "monospace",
                      fontWeight: 700,
                      fontSize: "13px",
                      color: "#0B5A3A",
                      margin: 0,
                    }}
                  >
                    {cert.certificateNumber}
                  </p>
                </div>
                {n?.nikahUniqueId && (
                  <div
                    style={{
                      backgroundColor: "rgba(11,90,58,0.05)",
                      border: "1px solid rgba(212,175,55,0.35)",
                      borderRadius: "6px",
                      padding: "10px 14px",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "10px",
                        color: "#1E7A52",
                        margin: "0 0 3px",
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.1em",
                      }}
                    >
                      Nikah Unique ID
                    </p>
                    <p
                      style={{
                        fontFamily: "monospace",
                        fontWeight: 700,
                        fontSize: "13px",
                        color: "#0B5A3A",
                        margin: 0,
                      }}
                    >
                      {n.nikahUniqueId}
                    </p>
                  </div>
                )}
              </div>

              {/* ── 8. Body prose text ── */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "20px",
                  lineHeight: 1.9,
                }}
              >
                <p
                  style={{
                    color: "#333",
                    fontSize: "13.5px",
                    fontFamily: "'Playfair Display', Georgia, serif",
                    margin: 0,
                  }}
                >
                  This is to certify that the nikah was solemnized by{" "}
                  <strong style={{ color: "#0B5A3A", fontWeight: 700 }}>
                    {n?.qaziName || "—"}
                  </strong>{" "}
                  On{" "}
                  <strong style={{ color: "#0B5A3A", fontWeight: 700 }}>
                    {n?.nikahDate || "—"}
                  </strong>{" "}
                  At{" "}
                  <strong style={{ color: "#0B5A3A", fontWeight: 700 }}>
                    {n?.masjidVenue || "—"}
                  </strong>{" "}
                  under supervision of masjid authorities &amp; in presence of
                  families, relatives and friends between
                </p>
              </div>

              {/* ── 9. Groom ── */}
              <div style={{ textAlign: "center", marginBottom: "6px" }}>
                <p
                  style={{
                    color: "#0B5A3A",
                    fontSize: "20px",
                    fontWeight: 700,
                    fontFamily: "'Playfair Display', serif",
                    margin: "0 0 3px",
                  }}
                >
                  {n?.groomName || "—"}
                </p>
                <p
                  style={{
                    color: "#444",
                    fontSize: "13px",
                    fontWeight: 400,
                    fontFamily: "'Playfair Display', Georgia, serif",
                    margin: 0,
                  }}
                >
                  S/o {n?.groomFatherName || "—"}
                </p>
              </div>

              {/* ── 10. Ornamental & separator ── */}
              <div
                style={{
                  textAlign: "center",
                  margin: "10px 0",
                  color: "#D4AF37",
                  fontSize: "20px",
                  fontFamily: "'Playfair Display', serif",
                  lineHeight: 1,
                }}
              >
                ✦ &amp; ✦
              </div>

              {/* ── 11. Bride ── */}
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <p
                  style={{
                    color: "#0B5A3A",
                    fontSize: "20px",
                    fontWeight: 700,
                    fontFamily: "'Playfair Display', serif",
                    margin: "0 0 3px",
                  }}
                >
                  {n?.brideName || "—"}
                </p>
                <p
                  style={{
                    color: "#444",
                    fontSize: "13px",
                    fontWeight: 400,
                    fontFamily: "'Playfair Display', Georgia, serif",
                    margin: 0,
                  }}
                >
                  D/o {n?.brideFatherName || "—"}
                </p>
              </div>

              {/* ── 12. Witnesses ── */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "22px",
                  padding: "14px 20px",
                  backgroundColor: "rgba(11,90,58,0.04)",
                  border: "1px solid rgba(212,175,55,0.25)",
                  borderRadius: "6px",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    color: "#1E7A52",
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.15em",
                    marginBottom: "10px",
                    fontFamily: "sans-serif",
                    margin: "0 0 10px",
                  }}
                >
                  In the presence of witnesses:
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "10px",
                        color: "#1E7A52",
                        margin: "0 0 2px",
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.08em",
                      }}
                    >
                      Witness 1
                    </p>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#0B5A3A",
                        margin: 0,
                        fontFamily: "'Playfair Display', serif",
                      }}
                    >
                      {n?.witness1 || "—"}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "10px",
                        color: "#1E7A52",
                        margin: "0 0 2px",
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.08em",
                      }}
                    >
                      Witness 2
                    </p>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#0B5A3A",
                        margin: 0,
                        fontFamily: "'Playfair Display', serif",
                      }}
                    >
                      {n?.witness2 || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── 13. Quran Verse ── */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "22px",
                  padding: "16px 20px",
                  backgroundColor: "rgba(212,175,55,0.07)",
                  border: "1px solid rgba(212,175,55,0.3)",
                  borderRadius: "6px",
                }}
              >
                <p
                  style={{
                    direction: "rtl",
                    fontFamily: "'Amiri', 'Traditional Arabic', serif",
                    fontSize: "17px",
                    color: "#0B5A3A",
                    lineHeight: 2,
                    margin: "0 0 8px",
                  }}
                >
                  وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا
                </p>
                <p
                  style={{
                    fontStyle: "italic",
                    fontSize: "12px",
                    color: "#1E7A52",
                    margin: "0 0 6px",
                    fontFamily: "Georgia, serif",
                  }}
                >
                  Wa min āyātihī an khalaqa lakum min anfusikum azwājal
                  litaskunū ilayhā
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#555",
                    margin: "0 0 4px",
                    fontFamily: "Georgia, serif",
                  }}
                >
                  "And of His signs is that He created for you from yourselves
                  mates that you may find tranquility in them"
                </p>
                <p
                  style={{
                    fontSize: "10px",
                    color: "#D4AF37",
                    fontWeight: 600,
                    margin: 0,
                    fontFamily: "sans-serif",
                    letterSpacing: "0.05em",
                  }}
                >
                  — Quran 30:21
                </p>
              </div>

              {/* ── 14. Maher (optional) ── */}
              {n?.maher && (
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: "22px",
                    padding: "10px 16px",
                    border: "1px solid rgba(212,175,55,0.25)",
                    borderRadius: "6px",
                    backgroundColor: "rgba(11,90,58,0.04)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#1E7A52",
                      fontFamily: "sans-serif",
                    }}
                  >
                    Maher:{" "}
                    <strong style={{ color: "#0B5A3A" }}>{n.maher}</strong>
                  </span>
                </div>
              )}

              <GoldDivider thin />

              {/* ── 15. All 6 Signature Blocks (always shown) ── */}
              <div style={{ marginBottom: "24px" }}>
                <p
                  style={{
                    textAlign: "center",
                    fontSize: "11px",
                    color: "#0B5A3A",
                    fontWeight: 600,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.15em",
                    marginBottom: "12px",
                    fontFamily: "sans-serif",
                  }}
                >
                  — Signatures —
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "8px",
                  }}
                >
                  {allSigs.map((s) => (
                    <SigBlock
                      key={s.label}
                      label={s.label}
                      dataUrl={s.dataUrl}
                    />
                  ))}
                </div>
              </div>

              {/* ── 16. Verified stamp ── */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    backgroundColor: "#0B5A3A",
                    border: "3px solid #D4AF37",
                    display: "flex",
                    flexDirection: "column" as const,
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "2px",
                  }}
                >
                  <span style={{ color: "#D4AF37", fontSize: "22px" }}>✦</span>
                  <p
                    style={{
                      color: "#D4AF37",
                      fontSize: "8px",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      margin: 0,
                      fontFamily: "sans-serif",
                    }}
                  >
                    VERIFIED
                  </p>
                </div>
              </div>

              {/* ── 17. Footer ── */}
              <p
                style={{
                  textAlign: "center",
                  fontSize: "11px",
                  color: "#1E7A52",
                  margin: 0,
                  fontFamily: "sans-serif",
                }}
              >
                Issued by Nikah Naama | www.nikahnaama.org
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons (outside print area) */}
        <div
          className="no-print"
          style={{
            marginTop: "24px",
            display: "flex",
            flexWrap: "wrap" as const,
            gap: "12px",
            justifyContent: "center",
          }}
        >
          <button
            type="button"
            onClick={() => window.print()}
            data-ocid="certificate.print.button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 24px",
              borderRadius: "999px",
              backgroundColor: "#0B5A3A",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: "sans-serif",
            }}
          >
            <Printer size={16} />
            Download / Print PDF
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
            target="_blank"
            rel="noopener noreferrer"
            data-ocid="certificate.whatsapp.button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 24px",
              borderRadius: "999px",
              backgroundColor: "#25D366",
              color: "white",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: "sans-serif",
            }}
          >
            💬 Share on WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}
