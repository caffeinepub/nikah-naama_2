import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

function MosqueIcon() {
  return (
    <svg
      role="img"
      aria-label="Mosque"
      width="36"
      height="36"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="8" y="36" width="48" height="20" rx="2" fill="#D4AF37" />
      <rect x="18" y="28" width="28" height="8" rx="1" fill="#1E7A52" />
      <path
        d="M32 8 C22 8 16 18 16 28 L48 28 C48 18 42 8 32 8Z"
        fill="#0B5A3A"
      />
      <path d="M32 2 L34 8 L32 7 L30 8 Z" fill="#D4AF37" />
      <rect x="28" y="42" width="8" height="14" rx="1" fill="#0B5A3A" />
      <rect x="12" y="38" width="8" height="8" rx="1" fill="#FAF7E6" />
      <rect x="44" y="38" width="8" height="8" rx="1" fill="#FAF7E6" />
    </svg>
  );
}

const navLinks = [
  { to: "/" as const, label: "Home" },
  { to: "/register" as const, label: "Nikah Registration" },
  { to: "/matrimony" as const, label: "Matrimony Board" },
  { to: "/jobs" as const, label: "Jobs" },
  { to: "/donations" as const, label: "Donations" },
];

function PrincipalBadge({ principal }: { principal: string }) {
  const [copied, setCopied] = useState(false);
  const short = `${principal.slice(0, 5)}...${principal.slice(-3)}`;
  const copy = () => {
    navigator.clipboard.writeText(principal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={copy}
      title={`Your Principal ID: ${principal} (click to copy)`}
      className="text-xs px-2 py-1 rounded-full border font-mono cursor-pointer"
      style={{
        borderColor: "#D4AF37",
        color: "#0B5A3A",
        backgroundColor: "#FAF7E6",
      }}
      data-ocid="nav.principal_id.button"
    >
      {copied ? "Copied!" : `ID: ${short}`}
    </button>
  );
}

export default function Layout() {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#F4F1DA" }}
    >
      {/* Utility bar */}
      <div
        style={{ backgroundColor: "#0B5A3A" }}
        className="text-white text-xs py-1 px-4 text-center font-medium tracking-widest"
      >
        NIKAH NAAMA | Islamic Marriage Registration System | www.nikahnaama.org
      </div>

      {/* Header */}
      <header
        style={{
          backgroundColor: "#FAF7E6",
          borderBottom: "2px solid #D4AF37",
        }}
        className="px-6 py-3 flex items-center justify-between"
      >
        <Link
          to="/"
          className="flex items-center gap-3 no-underline"
          style={{ color: "inherit" }}
        >
          <MosqueIcon />
          <div>
            <h1
              className="text-2xl font-bold leading-none"
              style={{
                color: "#0B5A3A",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Nikah Naama
            </h1>
            <p className="text-xs" style={{ color: "#1E7A52" }}>
              Digital Islamic Marriage Registration
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <div className="flex items-center gap-2">
              <PrincipalBadge principal={identity!.getPrincipal().toText()} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: "/admin" })}
                data-ocid="nav.admin.button"
                style={{ borderColor: "#0B5A3A", color: "#0B5A3A" }}
              >
                Admin Panel
              </Button>
            </div>
          )}
          {isAuthenticated ? (
            <Button
              size="sm"
              onClick={() => clear()}
              data-ocid="nav.logout.button"
              style={{ backgroundColor: "#0B5A3A", color: "white" }}
            >
              Logout
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => login()}
              disabled={isLoggingIn}
              data-ocid="nav.login.button"
              style={{ backgroundColor: "#0B5A3A", color: "white" }}
            >
              {isLoggingIn ? "Logging in..." : "Login"}
            </Button>
          )}
        </div>
      </header>

      {/* Nav */}
      <nav className="px-6 py-2" style={{ backgroundColor: "#FAF7E6" }}>
        <div
          className="flex gap-1 p-1 rounded-full max-w-2xl mx-auto"
          style={{ backgroundColor: "#0B5A3A" }}
        >
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              data-ocid={`nav.${label.toLowerCase().replace(/ /g, "_")}.link`}
              className="flex-1 text-center py-1.5 px-2 rounded-full text-sm font-medium transition-colors no-underline"
              style={{ color: "white" }}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Ornamental divider */}
      <div className="flex items-center px-6 py-1">
        <div className="flex-1 h-px" style={{ backgroundColor: "#D4AF37" }} />
        <span className="mx-3 text-sm" style={{ color: "#D4AF37" }}>
          ✦
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: "#D4AF37" }} />
      </div>

      {/* Main */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        style={{ backgroundColor: "#0B5A3A", color: "#F4F1DA" }}
        className="mt-12 py-8 px-6"
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "#D4AF37" }}
              >
                Nikah Naama
              </h3>
              <p className="text-sm opacity-80">
                Digital Islamic Marriage Registration System. Secure,
                transparent, and Shariah-compliant.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2" style={{ color: "#D4AF37" }}>
                Quick Links
              </h4>
              <div className="flex flex-col gap-1">
                {(
                  [
                    ["/register", "Registration"],
                    ["/matrimony", "Matrimony"],
                    ["/jobs", "Jobs"],
                    ["/donations", "Donations"],
                  ] as const
                ).map(([path, label]) => (
                  <Link
                    key={path}
                    to={path}
                    className="text-sm opacity-80 hover:opacity-100 no-underline"
                    style={{ color: "inherit" }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2" style={{ color: "#D4AF37" }}>
                Contact
              </h4>
              <p className="text-sm opacity-80">www.nikahnaama.org</p>
            </div>
          </div>
          <div
            className="border-t pt-4 flex flex-col md:flex-row items-center justify-between gap-2"
            style={{ borderColor: "rgba(212,175,55,0.3)" }}
          >
            <p className="text-sm opacity-70">
              © {new Date().getFullYear()} Nikah Naama. All rights reserved.
            </p>
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm opacity-70 hover:opacity-100 no-underline"
              style={{ color: "#D4AF37" }}
            >
              Built with ❤️ using caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
