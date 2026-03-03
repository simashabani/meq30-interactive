"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

type Demographics = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  gender: string;
  education: string;
  occupation: string;
};

const EMPTY_FORM: Demographics = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
  country: "",
  gender: "",
  education: "",
  occupation: "",
};

export default function UserInfoPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [form, setForm] = useState<Demographics>(EMPTY_FORM);
  const [agreeAcademic, setAgreeAcademic] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/en/journal";
        return;
      }

      setEmail(data.user.email ?? null);
      const md = (data.user.user_metadata ?? {}) as Record<string, any>;
      const saved = (md.demographics ?? {}) as Partial<Demographics>;

      setForm({ ...EMPTY_FORM, ...saved });
      setAgreeAcademic(Boolean(md.demographics_share_anonymous));
      setNewsletter(Boolean(md.newsletter_opt_in));
    });
  }, []);

  function updateField<K extends keyof Demographics>(field: K, value: Demographics[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");

    const supabase = createSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      window.location.href = "/en/journal";
      return;
    }

    const existing = (userData.user.user_metadata ?? {}) as Record<string, any>;
    const payload = {
      ...existing,
      demographics: form,
      demographics_share_anonymous: agreeAcademic,
      newsletter_opt_in: newsletter,
    };

    const { error } = await supabase.auth.updateUser({ data: payload });

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setMessage("Saved successfully.");
    setSaving(false);
  }

  if (!email) return <p>Loading...</p>;

  return (
    <section className="full-bleed-section section-gray" style={{ paddingTop: 0 }}>
      <div className="section-inner narrow">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <h1 style={{ margin: 0 }}>User Information</h1>
          <Link href="/en/journal" style={{ textDecoration: "underline" }}>
            Back to Journal
          </Link>
        </div>

        <div style={{ marginTop: "1.5rem", background: "#ffffff", padding: "1.5rem" }}>
          <p style={{ marginBottom: "1.25rem" }}>
            This section is optional. Share any information you wish.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
            <input style={inputStyle} placeholder="First Name" value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} />
            <input style={inputStyle} placeholder="Last Name" value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} />
            <input style={inputStyle} type="date" value={form.dateOfBirth} onChange={(e) => updateField("dateOfBirth", e.target.value)} />
            <input style={inputStyle} placeholder="Phone Number" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
            <input style={inputStyle} placeholder="Address" value={form.address} onChange={(e) => updateField("address", e.target.value)} />
            <input style={inputStyle} placeholder="City" value={form.city} onChange={(e) => updateField("city", e.target.value)} />
            <input style={inputStyle} placeholder="Postal Code" value={form.postalCode} onChange={(e) => updateField("postalCode", e.target.value)} />
            <input style={inputStyle} placeholder="Country" value={form.country} onChange={(e) => updateField("country", e.target.value)} />
            <input style={inputStyle} placeholder="Gender" value={form.gender} onChange={(e) => updateField("gender", e.target.value)} />
            <input style={inputStyle} placeholder="Education" value={form.education} onChange={(e) => updateField("education", e.target.value)} />
            <input style={inputStyle} placeholder="Occupation" value={form.occupation} onChange={(e) => updateField("occupation", e.target.value)} />
          </div>

          <div style={{ marginTop: "1rem", display: "grid", gap: "10px" }}>
            <label style={checkboxLabelStyle}>
              <input type="checkbox" checked={agreeAcademic} onChange={(e) => setAgreeAcademic(e.target.checked)} />
              I agree to share my information anonymously for academic purposes.
            </label>

            <label style={checkboxLabelStyle}>
              <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} />
              I would like to sign up for newsletters.
            </label>
          </div>

          <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "center", gap: "10px" }}>
            <button onClick={handleSave} disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving..." : "Save"}
            </button>
            {message && <p style={{ margin: 0 }}>{message}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

const inputStyle: CSSProperties = {
  border: "1px solid #d1d5db",
  padding: "10px 12px",
  fontSize: "0.95rem",
  background: "#ffffff",
};

const checkboxLabelStyle: CSSProperties = {
  display: "flex",
  gap: "8px",
  alignItems: "center",
};
