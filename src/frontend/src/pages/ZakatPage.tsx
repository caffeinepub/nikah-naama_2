import type { ZakatSettings } from "@/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface ZakatProfile {
  id: bigint;
  masjidId: bigint;
  personName: string;
  story: string;
  requiredAmount: number;
  collectedAmount: number;
  upiId: string;
  status: string;
}

const DEFAULTS: ZakatSettings = {
  goldRatePerGram: 6000,
  silverRatePerGram: 75,
  nisabGoldGrams: 87.48,
  nisabSilverGrams: 612.36,
};

function ResultBox({
  amount,
  label,
}: { amount: number | null; label: string }) {
  if (amount === null) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-6 rounded-xl p-5 text-center"
      style={{ backgroundColor: "#0B5A3A", border: "2px solid #D4AF37" }}
      data-ocid="zakat.result.card"
    >
      <p className="text-sm font-medium mb-1" style={{ color: "#D4AF37" }}>
        {label}
      </p>
      {amount > 0 ? (
        <>
          <p className="text-3xl font-bold text-white">
            ₹{amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            2.5% of eligible wealth
          </p>
          <div className="flex gap-3 justify-center mt-4">
            <Link to="/donations">
              <Button
                size="sm"
                data-ocid="zakat.donate.button"
                style={{ backgroundColor: "#D4AF37", color: "#0B5A3A" }}
              >
                🤲 Donate Now
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              data-ocid="zakat.whatsapp.button"
              onClick={() =>
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(`My Zakat amount is ₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}. Calculate yours at nikahnaama.org`)}`,
                  "_blank",
                )
              }
              style={{ borderColor: "#D4AF37", color: "#D4AF37" }}
            >
              📲 Share via WhatsApp
            </Button>
          </div>
        </>
      ) : (
        <p className="text-white font-medium">
          No Zakat due — below Nisab threshold
        </p>
      )}
    </motion.div>
  );
}

function GoldSilverTab({ settings }: { settings: ZakatSettings }) {
  const [gold, setGold] = useState("");
  const [silver, setSilver] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const goldGrams = Number.parseFloat(gold) || 0;
    const silverGrams = Number.parseFloat(silver) || 0;
    const goldValue = goldGrams * settings.goldRatePerGram;
    const silverValue = silverGrams * settings.silverRatePerGram;
    const nisabGoldValue = settings.nisabGoldGrams * settings.goldRatePerGram;
    const nisabSilverValue =
      settings.nisabSilverGrams * settings.silverRatePerGram;
    const nisab = Math.min(nisabGoldValue, nisabSilverValue);
    const total = goldValue + silverValue;
    setResult(total >= nisab ? total * 0.025 : 0);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label style={{ color: "#0B5A3A" }}>Gold owned (grams)</Label>
          <Input
            type="number"
            min="0"
            value={gold}
            onChange={(e) => setGold(e.target.value)}
            placeholder="e.g. 100"
            data-ocid="zakat.gold.input"
          />
          <p className="text-xs" style={{ color: "#1E7A52" }}>
            Rate: ₹{settings.goldRatePerGram}/g · Nisab:{" "}
            {settings.nisabGoldGrams}g
          </p>
        </div>
        <div className="space-y-1">
          <Label style={{ color: "#0B5A3A" }}>Silver owned (grams)</Label>
          <Input
            type="number"
            min="0"
            value={silver}
            onChange={(e) => setSilver(e.target.value)}
            placeholder="e.g. 500"
            data-ocid="zakat.silver.input"
          />
          <p className="text-xs" style={{ color: "#1E7A52" }}>
            Rate: ₹{settings.silverRatePerGram}/g · Nisab:{" "}
            {settings.nisabSilverGrams}g
          </p>
        </div>
      </div>
      <Button
        onClick={calculate}
        data-ocid="zakat.gold_silver.button"
        style={{ backgroundColor: "#0B5A3A", color: "white" }}
      >
        Calculate Zakat
      </Button>
      <ResultBox amount={result} label="Zakat on Gold & Silver" />
    </div>
  );
}

function CashTab({ settings }: { settings: ZakatSettings }) {
  const [cash, setCash] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const amount = Number.parseFloat(cash) || 0;
    const nisab = settings.nisabSilverGrams * settings.silverRatePerGram;
    setResult(amount >= nisab ? amount * 0.025 : 0);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label style={{ color: "#0B5A3A" }}>
          Total Cash & Bank Savings (₹)
        </Label>
        <Input
          type="number"
          min="0"
          value={cash}
          onChange={(e) => setCash(e.target.value)}
          placeholder="e.g. 100000"
          data-ocid="zakat.cash.input"
        />
        <p className="text-xs" style={{ color: "#1E7A52" }}>
          Nisab threshold: ₹
          {(
            settings.nisabSilverGrams * settings.silverRatePerGram
          ).toLocaleString("en-IN")}
        </p>
      </div>
      <Button
        onClick={calculate}
        data-ocid="zakat.cash.button"
        style={{ backgroundColor: "#0B5A3A", color: "white" }}
      >
        Calculate Zakat
      </Button>
      <ResultBox amount={result} label="Zakat on Cash & Savings" />
    </div>
  );
}

function BusinessTab({ settings }: { settings: ZakatSettings }) {
  const [inventory, setInventory] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const amount = Number.parseFloat(inventory) || 0;
    const nisab = settings.nisabSilverGrams * settings.silverRatePerGram;
    setResult(amount >= nisab ? amount * 0.025 : 0);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label style={{ color: "#0B5A3A" }}>Business Inventory Value (₹)</Label>
        <Input
          type="number"
          min="0"
          value={inventory}
          onChange={(e) => setInventory(e.target.value)}
          placeholder="e.g. 500000"
          data-ocid="zakat.inventory.input"
        />
        <p className="text-xs" style={{ color: "#1E7A52" }}>
          Include goods for sale, raw materials, finished products
        </p>
      </div>
      <Button
        onClick={calculate}
        data-ocid="zakat.business.button"
        style={{ backgroundColor: "#0B5A3A", color: "white" }}
      >
        Calculate Zakat
      </Button>
      <ResultBox amount={result} label="Zakat on Business Inventory" />
    </div>
  );
}

function AgriculturalTab({ settings }: { settings: ZakatSettings }) {
  const [harvest, setHarvest] = useState("");
  const [irrigated, setIrrigated] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const amount = Number.parseFloat(harvest) || 0;
    const nisab = settings.nisabSilverGrams * settings.silverRatePerGram;
    const rate = irrigated ? 0.05 : 0.1;
    setResult(amount >= nisab ? amount * rate : 0);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label style={{ color: "#0B5A3A" }}>Harvest / Produce Value (₹)</Label>
        <Input
          type="number"
          min="0"
          value={harvest}
          onChange={(e) => setHarvest(e.target.value)}
          placeholder="e.g. 200000"
          data-ocid="zakat.harvest.input"
        />
      </div>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="irrigated"
          checked={irrigated}
          onChange={(e) => setIrrigated(e.target.checked)}
          data-ocid="zakat.irrigated.checkbox"
          className="w-4 h-4 accent-green-800"
        />
        <Label htmlFor="irrigated" style={{ color: "#0B5A3A" }}>
          Irrigated land (5% rate) — uncheck for rain-fed (10% rate)
        </Label>
      </div>
      <p className="text-xs" style={{ color: "#1E7A52" }}>
        Rate: {irrigated ? "5%" : "10%"} · Rain-fed = 10%, Irrigated = 5%
      </p>
      <Button
        onClick={calculate}
        data-ocid="zakat.agricultural.button"
        style={{ backgroundColor: "#0B5A3A", color: "white" }}
      >
        Calculate Zakat
      </Button>
      <ResultBox amount={result} label="Zakat on Agricultural Produce" />
    </div>
  );
}

function NeedyProfilesTab() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: () => actor!.isCallerAdmin(),
    enabled: !!actor && isAuthenticated,
  });

  const { data: profiles = [], isLoading } = useQuery<ZakatProfile[]>({
    queryKey: ["openZakatProfiles"],
    queryFn: () => (actor as any).getOpenZakatProfiles(),
    enabled: !!actor && !isFetching,
  });

  const copyUpi = (upiId: string) => {
    navigator.clipboard.writeText(upiId);
    toast.success("UPI ID copied!");
  };

  if (isLoading) {
    return (
      <p
        className="text-center py-8"
        style={{ color: "#1E7A52" }}
        data-ocid="zakat.profiles.loading_state"
      >
        Loading profiles...
      </p>
    );
  }

  if (profiles.length === 0) {
    return (
      <div
        className="text-center py-12 rounded-xl"
        style={{
          backgroundColor: "#FAF7E6",
          border: "1px solid rgba(212,175,55,0.4)",
        }}
        data-ocid="zakat.profiles.empty_state"
      >
        <p className="text-3xl mb-3">🤲</p>
        <p className="font-semibold" style={{ color: "#0B5A3A" }}>
          No active Zakat profiles
        </p>
        <p className="text-sm mt-1" style={{ color: "#1E7A52" }}>
          Check back soon — Masjids will post profiles of those in need.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-ocid="zakat.profiles.list">
      {profiles.map((profile, i) => {
        const pct =
          profile.requiredAmount > 0
            ? Math.min(
                100,
                Math.round(
                  (profile.collectedAmount / profile.requiredAmount) * 100,
                ),
              )
            : 0;
        return (
          <motion.div
            key={profile.id.toString()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            data-ocid={`zakat.profiles.item.${i + 1}`}
            className="rounded-xl p-5"
            style={{ backgroundColor: "#FAF7E6", border: "2px solid #D4AF37" }}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4
                  className="font-semibold"
                  style={{
                    color: "#0B5A3A",
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  {profile.personName}
                </h4>
                <p className="text-xs mt-0.5" style={{ color: "#1E7A52" }}>
                  Posted by Masjid #{profile.masjidId.toString()}
                </p>
              </div>
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{ backgroundColor: "#0B5A3A", color: "#D4AF37" }}
              >
                Open
              </span>
            </div>

            <p className="text-sm mb-4" style={{ color: "#1E7A52" }}>
              {profile.story}
            </p>

            <div className="mb-3">
              <div
                className="flex justify-between text-xs mb-1"
                style={{ color: "#0B5A3A" }}
              >
                <span>
                  ₹{profile.collectedAmount.toLocaleString("en-IN")} raised
                </span>
                <span>
                  Goal: ₹{profile.requiredAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <Progress value={pct} className="h-2" />
              <p
                className="text-xs mt-1 text-right"
                style={{ color: "#1E7A52" }}
              >
                {pct}% funded
              </p>
            </div>

            {profile.upiId && (
              <div className="flex items-center gap-2 mt-3">
                <div
                  className="flex-1 rounded-lg px-3 py-2"
                  style={{ backgroundColor: "#0B5A3A" }}
                >
                  <p className="text-xs" style={{ color: "#D4AF37" }}>
                    UPI ID
                  </p>
                  <p className="text-white text-sm font-mono">
                    {profile.upiId}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => copyUpi(profile.upiId)}
                  data-ocid={`zakat.profiles.copy.button.${i + 1}`}
                  style={{ backgroundColor: "#D4AF37", color: "#0B5A3A" }}
                >
                  Copy
                </Button>
              </div>
            )}

            {isAdmin && (
              <Button
                size="sm"
                className="mt-3 w-full"
                onClick={async () => {
                  if (!actor) return;
                  try {
                    await (actor as any).markZakatProfileFulfilled(profile.id);
                    toast.success("Marked as fulfilled!");
                  } catch {
                    toast.error("Failed to mark as fulfilled");
                  }
                }}
                data-ocid={`zakat.profiles.fulfill.button.${i + 1}`}
                style={{ backgroundColor: "#1E7A52", color: "white" }}
              >
                ✓ Mark as Fulfilled (Admin)
              </Button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export default function ZakatPage() {
  const { actor, isFetching } = useActor();

  const { data: settings } = useQuery<ZakatSettings | null>({
    queryKey: ["zakatSettings"],
    queryFn: () => actor!.getZakatSettings(),
    enabled: !!actor && !isFetching,
  });

  const s = settings ?? DEFAULTS;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "'Playfair Display', serif", color: "#0B5A3A" }}
        >
          ⭐ Zakat
        </h2>
        <p className="text-sm mb-6" style={{ color: "#1E7A52" }}>
          Calculate your Zakat obligation and help those in need
        </p>
      </motion.div>

      <Tabs defaultValue="calculator" data-ocid="zakat.tab">
        <TabsList className="mb-6">
          <TabsTrigger value="calculator" data-ocid="zakat.calculator.tab">
            Zakat Calculator
          </TabsTrigger>
          <TabsTrigger value="needy" data-ocid="zakat.needy.tab">
            Help the Needy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="rounded-2xl p-6"
            style={{
              backgroundColor: "#FAF7E6",
              border: "1px solid rgba(212,175,55,0.5)",
            }}
          >
            <Tabs defaultValue="gold" data-ocid="zakat.calc.tab">
              <TabsList className="mb-6 flex-wrap h-auto gap-1">
                <TabsTrigger value="gold" data-ocid="zakat.gold.tab">
                  Gold & Silver
                </TabsTrigger>
                <TabsTrigger value="cash" data-ocid="zakat.cash.tab">
                  Cash & Savings
                </TabsTrigger>
                <TabsTrigger value="business" data-ocid="zakat.business.tab">
                  Business
                </TabsTrigger>
                <TabsTrigger
                  value="agricultural"
                  data-ocid="zakat.agricultural.tab"
                >
                  Agricultural
                </TabsTrigger>
              </TabsList>
              <TabsContent value="gold">
                <GoldSilverTab settings={s} />
              </TabsContent>
              <TabsContent value="cash">
                <CashTab settings={s} />
              </TabsContent>
              <TabsContent value="business">
                <BusinessTab settings={s} />
              </TabsContent>
              <TabsContent value="agricultural">
                <AgriculturalTab settings={s} />
              </TabsContent>
            </Tabs>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 rounded-xl p-4 text-sm"
            style={{
              backgroundColor: "#0B5A3A",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <p className="font-medium mb-1" style={{ color: "#D4AF37" }}>
              ℹ️ Nisab Reference
            </p>
            <p>
              Gold rate: ₹{s.goldRatePerGram}/g · Nisab (gold):{" "}
              {s.nisabGoldGrams}g = ₹
              {(s.nisabGoldGrams * s.goldRatePerGram).toLocaleString("en-IN")}
            </p>
            <p>
              Silver rate: ₹{s.silverRatePerGram}/g · Nisab (silver):{" "}
              {s.nisabSilverGrams}g = ₹
              {(s.nisabSilverGrams * s.silverRatePerGram).toLocaleString(
                "en-IN",
              )}
            </p>
          </motion.div>
        </TabsContent>

        <TabsContent value="needy">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <div className="mb-4">
              <h3
                className="font-semibold"
                style={{
                  color: "#0B5A3A",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                🤲 Help the Needy
              </h3>
              <p className="text-sm mt-1" style={{ color: "#1E7A52" }}>
                Donate your Zakat directly to verified individuals identified by
                registered Masjids.
              </p>
            </div>
            <NeedyProfilesTab />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
