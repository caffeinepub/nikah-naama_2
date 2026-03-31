import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useCallback, useRef } from "react";

const services = [
  {
    icon: "🕌",
    title: "Masjid Register / Login",
    desc: "Register your Masjid and manage Nikah registrations",
    to: "/masjid",
    ocid: "masjid.card",
  },
  {
    icon: "💍",
    title: "Matrimony Board",
    desc: "Browse proposals from registered Masjids across India",
    to: "/matrimony",
    ocid: "matrimony.card",
  },
  {
    icon: "💼",
    title: "Jobs Board",
    desc: "Community job listings posted by trusted Masjids",
    to: "/jobs",
    ocid: "jobs.card",
  },
  {
    icon: "🤲",
    title: "Donations",
    desc: "Support your local Masjid via UPI donation",
    to: "/donations",
    ocid: "donations.card",
  },
  {
    icon: "⭐",
    title: "Zakat Calculator",
    desc: "Calculate and fulfill your Zakat obligation",
    to: "/zakat",
    ocid: "zakat.card",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const clickCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCrescentClick = useCallback(() => {
    clickCountRef.current += 1;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      navigate({ to: "/admin" });
      return;
    }
    timerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 2000);
  }, [navigate]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF7E6" }}>
      {/* Hero Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative py-12 px-4 text-center"
        style={{
          background:
            "linear-gradient(135deg, #0B5A3A 0%, #1E7A52 60%, #0B5A3A 100%)",
          borderBottom: "3px solid #D4AF37",
        }}
      >
        {/* Hidden admin trigger */}
        <button
          type="button"
          onClick={handleCrescentClick}
          data-ocid="header.toggle"
          className="absolute top-4 right-4 text-2xl bg-transparent border-none cursor-pointer select-none"
          style={{ opacity: 0.5, lineHeight: 1 }}
          tabIndex={-1}
          aria-hidden="true"
        >
          🌙
        </button>

        <p
          className="text-lg mb-2 font-semibold tracking-widest"
          style={{
            color: "#D4AF37",
            fontFamily: "'Playfair Display', serif",
            direction: "rtl",
          }}
        >
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
        </p>
        <h1
          className="text-4xl md:text-5xl font-bold text-white mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Nikah Naama
        </h1>
        <p className="text-white/75 text-base md:text-lg max-w-xl mx-auto">
          Digital Islamic Marriage Registration System for the Muslim Community
          of India
        </p>
      </motion.header>

      {/* Service Cards */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-6">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={i === 3 ? "col-span-1 md:col-start-1" : ""}
            >
              <Link
                to={s.to}
                data-ocid={s.ocid}
                className="group block rounded-2xl p-6 no-underline h-full relative overflow-hidden transition-transform duration-200 hover:scale-[1.03]"
                style={{
                  backgroundColor: "#0B5A3A",
                  border: "2px solid #D4AF37",
                  boxShadow: "0 2px 8px rgba(11,90,58,0.15)",
                }}
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  style={{ boxShadow: "0 0 24px 4px rgba(212,175,55,0.35)" }}
                />
                <div
                  className="text-4xl mb-4"
                  style={{
                    filter: "drop-shadow(0 0 6px rgba(212,175,55,0.6))",
                  }}
                >
                  {s.icon}
                </div>
                <h2
                  className="text-white font-bold text-base md:text-lg mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {s.title}
                </h2>
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  {s.desc}
                </p>
                <span
                  className="inline-block text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ color: "#D4AF37" }}
                >
                  Explore →
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Register a Masjid link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-2"
        >
          <Link
            to="/masjid-register"
            data-ocid="masjid_register.link"
            className="inline-block text-sm font-semibold px-5 py-2 rounded-full transition-colors duration-200"
            style={{
              color: "#0B5A3A",
              border: "1.5px solid #D4AF37",
              backgroundColor: "transparent",
            }}
          >
            🕌 Register a Masjid →
          </Link>
        </motion.div>

        {/* Ornamental divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center my-8"
        >
          <div className="flex-1 h-px" style={{ backgroundColor: "#D4AF37" }} />
          <span
            className="mx-4 text-base font-medium"
            style={{ color: "#D4AF37" }}
          >
            ✦ بِسْمِ اللَّهِ ✦
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: "#D4AF37" }} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm"
          style={{ color: "#1E7A52" }}
        >
          Data displayed is provided by registered Masjids and verified by our
          admin team.
        </motion.p>
      </main>

      {/* Footer */}
      <footer
        className="text-center py-6 px-4 text-xs"
        style={{ color: "#1E7A52" }}
      >
        © {new Date().getFullYear()} Nikah Naama · www.nikahnaama.org · Built
        with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
            typeof window !== "undefined"
              ? window.location.hostname
              : "nikahnaama.org",
          )}`}
          className="underline"
          style={{ color: "#0B5A3A" }}
          target="_blank"
          rel="noreferrer"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
