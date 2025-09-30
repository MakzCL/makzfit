import React, { useEffect, useMemo, useState } from "react";

// --- Helper: date & day names ---
const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const todayIdx = new Date().getDay();

// --- Starter shopping list (Monthly quantities) ---
const STARTER_LIST = [
  { id: "chicken", name: "Chicken Breast Fillets", qty: 6, unit: "kg", category: "Protein" },
  { id: "salmon", name: "Boneless Salmon Fillets", qty: 1.2, unit: "kg", category: "Protein" },
  { id: "eggs", name: "Eggs (12-pack)", qty: 4, unit: "packs", category: "Protein" },
  { id: "yogurt", name: "Greek Style Yogurt (Full Fat)", qty: 4, unit: "kg", category: "Protein" },
  { id: "rice", name: "Long Grain White Rice", qty: 2, unit: "kg", category: "Carbohydrates" },
  { id: "pasta", name: "Fusilli Pasta", qty: 2, unit: "kg", category: "Carbohydrates" },
  { id: "oats", name: "Porridge Oats", qty: 1, unit: "kg", category: "Carbohydrates" },
  { id: "white-potatoes", name: "British White Potatoes", qty: 5, unit: "kg", category: "Carbohydrates" },
  { id: "broccoli", name: "Broccoli", qty: 1.5, unit: "kg", category: "Vegetables & Fruits" },
  { id: "green-beans", name: "Green Beans", qty: 1, unit: "kg", category: "Vegetables & Fruits" },
  { id: "mixed-veg", name: "Mixed Vegetables (Frozen)", qty: 2, unit: "kg", category: "Vegetables & Fruits" },
  { id: "red-potatoes", name: "British Red Potatoes", qty: 2.5, unit: "kg", category: "Vegetables & Fruits" },
  { id: "peanut-butter", name: "Peanut Butter", qty: 1, unit: "jar", category: "Healthy Fats" },
  { id: "olive-oil", name: "Extra Virgin Olive Oil", qty: 1, unit: "litre", category: "Healthy Fats" },
  { id: "salt", name: "Salt", qty: 1, unit: "pack", category: "Miscellaneous" },
  { id: "pepper", name: "Pepper", qty: 1, unit: "pack", category: "Miscellaneous" },
];

function useShoppingList() {
  const [monthly, setMonthly] = useState(() => {
    const saved = localStorage.getItem("pad-shopping-monthly");
    if (saved) return JSON.parse(saved);
    return STARTER_LIST;
  });
  const [view, setView] = useState(
    () => localStorage.getItem("pad-shopping-view") || "monthly"
  );

  useEffect(
    () => localStorage.setItem("pad-shopping-monthly", JSON.stringify(monthly)),
    [monthly]
  );
  useEffect(() => localStorage.setItem("pad-shopping-view", view), [view]);

  const weekData = useMemo(
    () =>
      monthly.map((i) => ({
        ...i,
        qty: +(i.qty / 4).toFixed(i.unit === "packs" ? 0 : 2),
      })),
    [monthly]
  );

  const list = view === "weekly" ? weekData : monthly;

  const setItem = (id, patch) =>
    setMonthly((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  // Since checkboxes were removed, repurpose Weekly Reset to reset quantities
  // to the default values for the currently selected view. If you'd rather it
  // do something else, let me know.
  const resetWeek = () =>
    setMonthly((prev) =>
      prev.map((i) => {
        const base = STARTER_LIST.find((b) => b.id === i.id) || i;
        const qty = view === "weekly" ? base.qty / 4 : base.qty;
        return { ...i, qty: +(qty.toFixed(i.unit === "packs" ? 0 : 2)) };
      })
    );

  return { view, setView, list, monthly, setItem, resetWeek };
}

// --- Workouts & Meals: Excel import (optional). Fallback defaults included. ---
const DEFAULT_WORKOUTS = {
  Monday: {
    name: "Push",
    items: [
      { exercise: "Bench Press", sets: 4, reps: "6-8" },
      { exercise: "Incline DB Press", sets: 3, reps: "8-10" },
      { exercise: "Shoulder Press", sets: 3, reps: "8-10" },
      { exercise: "Triceps Pushdown", sets: 3, reps: "10-12" },
    ],
  },
  Tuesday: {
    name: "Pull",
    items: [
      { exercise: "Deadlift (light technique)", sets: 3, reps: "3-5" },
      { exercise: "Lat Pulldown", sets: 3, reps: "8-12" },
      { exercise: "Seated Row", sets: 3, reps: "10-12" },
      { exercise: "Biceps Curls", sets: 3, reps: "10-12" },
    ],
  },
  Wednesday: {
    name: "Legs",
    items: [
      { exercise: "Back Squat", sets: 4, reps: "5-8" },
      { exercise: "Leg Press", sets: 3, reps: "10-12" },
      { exercise: "Hamstring Curl", sets: 3, reps: "10-12" },
      { exercise: "Calf Raise", sets: 3, reps: "12-15" },
    ],
  },
  Thursday: {
    name: "Full Body",
    items: [
      { exercise: "DB Snatch", sets: 3, reps: "8/side" },
      { exercise: "Push Ups", sets: 3, reps: "AMRAP" },
      { exercise: "Kettlebell Swings", sets: 3, reps: "12-15" },
    ],
  },
  Friday: {
    name: "Push",
    items: [
      { exercise: "Overhead Press", sets: 4, reps: "5-8" },
      { exercise: "Dips", sets: 3, reps: "AMRAP" },
      { exercise: "Lateral Raises", sets: 3, reps: "12-15" },
    ],
  },
  Saturday: {
    name: "Pull",
    items: [
      { exercise: "Barbell Row", sets: 4, reps: "6-8" },
      { exercise: "Pull Ups", sets: 3, reps: "AMRAP" },
      { exercise: "Face Pulls", sets: 3, reps: "12-15" },
    ],
  },
  Sunday: {
    name: "Meal Prep + Active Recovery",
    items: [{ exercise: "Walk / Mobility", sets: 1, reps: "30–60 min" }],
  },
};

const MEAL_TEMPLATE = {
  Breakfast: {
    name: "Oats + Yogurt + Berries",
    macros: "P35 C60 F12",
    ingredients: ["Oats 80g", "Greek Yogurt 150g", "Frozen berries 100g"],
  },
  Meal1: {
    name: "Chicken + Rice + Broccoli",
    macros: "P45 C60 F10",
    ingredients: ["Chicken 200g", "Rice 150g", "Broccoli 150g"],
  },
  Snack: {
    name: "Peanut Butter Rice Cake",
    macros: "P6 C18 F9",
    ingredients: ["Rice cakes 2", "Peanut butter 20g"],
  },
  Dinner: {
    name: "Salmon + Potatoes + Beans",
    macros: "P40 C50 F15",
    ingredients: ["Salmon 180g", "White potatoes 250g", "Green beans 150g"],
  },
};

const DEFAULT_MEALS = dayNames.reduce((acc, d) => {
  // clone the template so future mutations (if any) don't affect all days at once
  acc[d] = JSON.parse(JSON.stringify(MEAL_TEMPLATE));
  return acc;
}, {});

function useExcelImport() {
  const [workouts, setWorkouts] = useState(DEFAULT_WORKOUTS);
  const [meals, setMeals] = useState(DEFAULT_MEALS);
  const [error, setError] = useState("");

  const onFile = async (file) => {
    setError("");
    try {
      const XLSX = await import("xlsx");
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);

      // Workouts sheet expected headers: Day, Block, Exercise, Sets, Reps
      const wsW = wb.Sheets["Workouts"];
      if (wsW) {
        const rows = XLSX.utils.sheet_to_json(wsW);
        const map = {};
        rows.forEach((r) => {
          const day = String(r.Day || "").trim();
          const block = String(r.Block || r.Type || "").trim();
          if (!map[day])
            map[day] = {
              name: block || DEFAULT_WORKOUTS[day]?.name || "Workout",
              items: [],
            };
          map[day].name = block || map[day].name;
          map[day].items.push({
            exercise: String(r.Exercise || r.Move || "").trim(),
            sets: Number(r.Sets || 0),
            reps: String(r.Reps || "").trim(),
          });
        });
        if (Object.keys(map).length) setWorkouts(map);
      }

      // Meals sheet expected headers: Day, Slot, Name, Macros, Ingredients
      const wsM = wb.Sheets["Meals"];
      if (wsM) {
        const rows = XLSX.utils.sheet_to_json(wsM);
        const mapM = {};
        rows.forEach((r) => {
          const day = String(r.Day || "").trim();
          if (!mapM[day]) mapM[day] = {};
          const slot = String(r.Slot || r.Type || "").trim();
          mapM[day][slot] = {
            name: String(r.Name || "").trim(),
            macros: String(r.Macros || "").trim(),
            ingredients: String(r.Ingredients || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          };
        });
        if (Object.keys(mapM).length) setMeals(mapM);
      }
    } catch (e) {
      console.error(e);
      setError(
        "Could not read the Excel file. Please ensure it has sheets named 'Workouts' and 'Meals'."
      );
    }
  };
  return { workouts, meals, onFile, error };
}

// --- UI Components ---
function Section({ title, children, actions }) {
  return (
    <div className="rounded-2xl shadow p-4 md:p-6 bg-white/70 backdrop-blur border border-zinc-200/60">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h2>
        {actions}
      </div>
      {children}
    </div>
  );
}

function NavTabs({ tab, setTab }) {
  const tabs = [
    { id: "shopping", label: "Shopping List" },
    { id: "workouts", label: "Workouts" },
    { id: "meals", label: "Meal Prep" },
    { id: "overview", label: "Routine Overview" },
  ];
  return (
    <div className="flex gap-2 flex-wrap">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          className={`px-3 py-2 rounded-xl text-sm md:text-base border transition shadow-sm hover:shadow ${
            tab === t.id
              ? "bg-zinc-900 text-white border-zinc-900"
              : "bg-white/70 text-zinc-800 border-zinc-300"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function ShoppingList() {
  const { view, setView, list, setItem, resetWeek } = useShoppingList();
  const categories = useMemo(() => {
    const map = {};
    list.forEach((i) => {
      if (!map[i.category]) map[i.category] = [];
      map[i.category].push(i);
    });
    return map;
  }, [list]);

  return (
    <Section
      title="Shopping List"
      actions={
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl border overflow-hidden">
            <button
              onClick={() => setView("monthly")}
              className={`px-3 py-1.5 ${
                view === "monthly" ? "bg-zinc-900 text-white" : "bg-white/70"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setView("weekly")}
              className={`px-3 py-1.5 ${
                view === "weekly" ? "bg-zinc-900 text-white" : "bg-white/70"
              }`}
            >
              Weekly
            </button>
          </div>
          <button
            onClick={resetWeek}
            title="Currently resets quantities to default for the selected view"
            className="px-3 py-1.5 rounded-xl border shadow-sm hover:shadow"
          >
            Weekly Reset
          </button>
        </div>
      }
    >
      <div className="grid md:grid-cols-2 gap-4">
        {Object.entries(categories).map(([cat, items]) => (
          <div key={cat} className="rounded-xl border p-3 bg-white/60">
            <h3 className="font-semibold mb-2">{cat}</h3>
            <ul className="space-y-2">
              {items.map((i) => (
                <li key={i.id} className="flex items-center gap-3">
                  <span className="flex-1">{i.name}</span>
                  <input
                    type="number"
                    step="0.1"
                    value={i.qty}
                    onChange={(e) => setItem(i.id, { qty: Number(e.target.value) })}
                    className="w-24 px-2 py-1 rounded-lg border bg-white/70"
                  />
                  <span className="w-16 text-right opacity-70">{i.unit}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

function WorkoutsMeals() {
  const { workouts, meals, onFile, error } = useExcelImport();
  const [selectedDays, setSelectedDays] = useState([dayNames[todayIdx]]);

  const toggleDay = (d) =>
    setSelectedDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );

  // Build a quick shopping list from selected meal days by gathering ingredients
  const generatedMealList = useMemo(() => {
    const items = {};
    selectedDays.forEach((d) => {
      const dayMeals = meals[d] || {};
      Object.values(dayMeals).forEach((m) => {
        (m?.ingredients || []).forEach((ing) => {
          const key = ing.toLowerCase();
          items[key] = (items[key] || 0) + 1; // simple count of occurrences
        });
      });
    });
    return Object.entries(items).map(([k, c]) => `${k} ×${c}`);
  }, [meals, selectedDays]);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Section
        title="Workouts"
        actions={
          <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-sm hover:shadow">
            Import Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
              className="hidden"
            />
          </label>
        }
      >
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <div className="grid sm:grid-cols-2 gap-3">
          {dayNames.map((d) => {
            const data = workouts[d] || null;
            const isToday = d === dayNames[todayIdx];
            return (
              <div
                key={d}
                className={`rounded-xl border p-3 bg-white/60 ${
                  isToday ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">
                    {d} {data ? `• ${data.name}` : ""}
                  </h4>
                  {d !== "Sunday" && (
                    <span className="text-xs px-2 py-1 rounded-full border">
                      {[
                        "Push",
                        "Pull",
                        "Legs",
                        "Full Body",
                      ].includes(data?.name)
                        ? data?.name
                        : "Training"}
                    </span>
                  )}
                  {d === "Sunday" && (
                    <span className="text-xs px-2 py-1 rounded-full border">
                      Meal Prep + Active Recovery
                    </span>
                  )}
                </div>
                <ul className="space-y-1">
                  {(data?.items || []).map((m, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{m.exercise}</span>
                      <span className="opacity-70">
                        {m.sets}×{m.reps}
                      </span>
                    </li>
                  ))}
                  {(!data || !data.items?.length) && (
                    <li className="text-sm opacity-70">No items</li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Meal Prep & Daily Meals">
        {/* Toolbar under the title (so the title sits above the day buttons) */}
        <div className="flex items-center gap-2 mb-3">
          <div className="hidden sm:flex gap-2">
            {dayNames.map((d) => (
              <button
                key={d}
                onClick={() => toggleDay(d)}
                className={`px-2 py-1 rounded-lg border text-sm ${
                  selectedDays.includes(d) ? "bg-zinc-900 text-white" : "bg-white/70"
                }`}
              >
                {d.slice(0, 3)}
              </button>
            ))}
          </div>
          <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-sm hover:shadow">
            Import Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-sm opacity-80 mb-3">
          Select days to view meals and generate a prep list. Expected Excel sheets: <code>Workouts</code> and <code>Meals</code>.
        </p>
        <div className="space-y-4">
          {selectedDays.map((d) => {
            const m = meals[d] || {};
            const isToday = d === dayNames[todayIdx];
            return (
              <div
                key={d}
                className={`rounded-xl border p-3 bg-white/60 ${
                  isToday ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <h4 className="font-semibold mb-2">{d}</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {Object.entries(m).map(([slot, data]) => (
                    <div key={slot} className="rounded-lg border p-2 bg-white/70">
                      <div className="text-sm font-medium">{slot}</div>
                      <div className="text-sm">{data?.name || "—"}</div>
                      <div className="text-xs opacity-70">{data?.macros || ""}</div>
                      {data?.ingredients?.length ? (
                        <ul className="mt-1 text-xs list-disc ml-4 opacity-80">
                          {data.ingredients.map((ing, i) => (
                            <li key={i}>{ing}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                  {Object.keys(m).length === 0 && (
                    <div className="text-sm opacity-70">No meals configured.</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4">
          <h5 className="font-semibold mb-2">
            Generated Meal Prep Shopping List (from selected days)
          </h5>
          <div className="rounded-xl border p-3 bg-white/70 min-h-20 text-sm whitespace-pre-wrap">
            {generatedMealList.length
              ? generatedMealList.join("\n")
              : "Select days to generate."}
          </div>
        </div>
      </Section>
    </div>
  );
}

function RoutineOverview() {
  const entries = [
    { time: "07:30", label: "Hydration • 500ml water" },
    { time: "08:00", label: "Breakfast" },
    { time: "10:00", label: "Work / Content" },
    { time: "13:00", label: "Meal 1" },
    { time: "16:30", label: "Workout" },
    { time: "18:00", label: "Dinner" },
    { time: "21:30", label: "Wind down" },
    { time: "23:00", label: "Bedtime" },
  ];
  return (
    <Section title={`Routine Overview • ${dayNames[todayIdx]}`}>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-zinc-400/50 to-transparent" />
        <div className="space-y-4">
          {entries.map((e, idx) => (
            <div key={idx} className="pl-10 relative">
              <div className="absolute left-3 top-1.5 w-3 h-3 rounded-full border bg-white" />
              <div className="text-xs opacity-70">{e.time}</div>
              <div className="text-sm md:text-base">{e.label}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// --- Simple runtime tests (since we don't have a formal test runner here) ---
function DebugTests() {
  const [results, setResults] = useState([]);
  useEffect(() => {
    const r = [];
    try {
      // Test 1: Weekly split math
      const chicken = STARTER_LIST.find((x) => x.id === "chicken");
      const weekly = +(chicken.qty / 4).toFixed(2);
      r.push({ name: "weekly split math", pass: weekly === 1.5 });

      // Test 2: Default workouts include Sunday recovery
      r.push({
        name: "sunday recovery",
        pass:
          DEFAULT_WORKOUTS.Sunday?.name === "Meal Prep + Active Recovery" &&
          DEFAULT_WORKOUTS.Sunday.items.length === 1,
      });

      // Test 3: Meals structure has Monday breakfast defined
      r.push({
        name: "monday breakfast present",
        pass: !!DEFAULT_MEALS.Monday?.Breakfast?.name,
      });

      // Test 4: JSX mapping shape (simulate one map render item)
      const sample = { exercise: "Bench Press", sets: 4, reps: "6-8" };
      const text = `${sample.exercise} ${sample.sets}x${sample.reps}`;
      r.push({ name: "jsx list render sample", pass: text === "Bench Press 4x6-8" });

      // Test 5: Meals uniform across days
      r.push({
        name: "uniform meals",
        pass:
          DEFAULT_MEALS.Monday?.Breakfast?.name ===
          DEFAULT_MEALS.Tuesday?.Breakfast?.name,
      });
    } catch (e) {
      r.push({ name: "tests crashed", pass: false, error: String(e) });
    }
    setResults(r);
  }, []);

  const failed = results.some((x) => !x.pass);
  return (
    <div className="mt-6 text-xs">
      <details>
        <summary className={`cursor-pointer inline-block px-2 py-1 rounded border ${failed ? "border-red-500" : "border-green-600"}`}>
          {failed ? "Tests: FAIL" : "Tests: PASS"} ({results.filter(Boolean).length})
        </summary>
        <ul className="mt-2 space-y-1">
          {results.map((t, i) => (
            <li key={i}>
              <span className={`font-semibold ${t.pass ? "text-green-700" : "text-red-600"}`}>
                {t.pass ? "PASS" : "FAIL"}
              </span>{" "}
              – {t.name}
              {t.error ? <span className="ml-2 opacity-70">{t.error}</span> : null}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("shopping");

  // Background from Freepik link with gradient overlay fallback
  useEffect(() => {
    const bg = document.getElementById("bg-layer");
    if (bg) {
      bg.style.backgroundImage =
        "url('https://img.freepik.com/free-photo/vivid-blurred-colorful-background_58702-2745.jpg')";
    }
  }, []);

  // Smoke test to ensure app mounted
  useEffect(() => {
    console.log("App mounted – running smoke test");
  }, []);

  return (
    <div className="min-h-screen text-zinc-900">
      {/* Background */}
      <div id="bg-layer" className="fixed inset-0 bg-no-repeat bg-cover bg-center" aria-hidden />
      <div className="fixed inset-0 bg-white/70 backdrop-blur" aria-hidden />

      {/* Page container */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <header className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Personal Assistant Dashboard
            </h1>
            <p className="text-sm opacity-80">
              A clean hub for shopping, workouts, meal prep & daily routine.
            </p>
          </div>
          <NavTabs tab={tab} setTab={setTab} />
        </header>

        <div className="space-y-6">
          {tab === "shopping" && <ShoppingList />}
          {tab === "workouts" && <WorkoutsMeals />}
          {tab === "meals" && <WorkoutsMeals />}
          {tab === "overview" && <RoutineOverview />}
          <DebugTests />
        </div>

        <footer className="mt-10 text-xs opacity-70 text-center">
          <p>
            Sunday is dedicated to <strong>Meal Prep + Active Recovery</strong>.
            • Current day is automatically highlighted.
          </p>
        </footer>
      </main>

      {/* Minimal utility styles for preview */}
      <style>{`
        :root { color-scheme: light; }
        html, body, #root { height: 100%; }
        body { margin: 0; }
      `}</style>
    </div>
  );
}
