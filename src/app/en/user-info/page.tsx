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
  educationalOrganization: string;
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
  educationalOrganization: "",
};

export default function UserInfoPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [form, setForm] = useState<Demographics>(EMPTY_FORM);
  const [agreeAcademic, setAgreeAcademic] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [defaultLanguage, setDefaultLanguage] = useState<"en" | "fa">("en");
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
      const md = (data.user.user_metadata ?? {}) as Record<string, unknown>;
      const savedRaw = md.demographics;
      const saved =
        typeof savedRaw === "object" && savedRaw !== null
          ? (savedRaw as Partial<Demographics>)
          : {};

      setForm({ ...EMPTY_FORM, ...saved });
      setAgreeAcademic(Boolean(md.demographics_share_anonymous));
      setNewsletter(Boolean(md.newsletter_opt_in));
      setDefaultLanguage(md.default_language === "fa" ? "fa" : "en");
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

    const existing = (userData.user.user_metadata ?? {}) as Record<string, unknown>;
    const payload = {
      ...existing,
      demographics: form,
      demographics_share_anonymous: agreeAcademic,
      newsletter_opt_in: newsletter,
      default_language: defaultLanguage,
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
    <div style={{ marginTop: "-40px", marginBottom: "-40px" }}>
      <section className="full-bleed-section section-gray">
        <div className="section-inner narrow">
          <h1 style={{ margin: 0, textAlign: "center" }}>User Information</h1>
        </div>
      </section>

      <section className="full-bleed-section section-white" style={{ paddingTop: "30px", paddingBottom: "30px" }}>
        <div className="section-inner narrow">
          <div
            className="main-page-row"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              marginBottom: "1.25rem",
            }}
          >
            <p style={{ margin: 0 }}>This section is optional. Share any information you wish.</p>
            <Link href="/en/journal" className="main-page-link-button">
              Back to Experiences List
            </Link>
          </div>

          <div style={{ background: "#ffffff", border: "1px solid #d9ddd3", padding: "1.25rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              <div style={fieldStackStyle}>
                <label style={labelStyle}>First Name</label>
                <input style={inputStyle} value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} />
              </div>
              <div style={fieldStackStyle}>
                <label style={labelStyle}>Last Name</label>
                <input style={inputStyle} value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} />
              </div>
              <div style={fieldStackStyle}>
                <label style={labelStyle}>Date of Birth</label>
                <input style={inputStyle} type="date" value={form.dateOfBirth} onChange={(e) => updateField("dateOfBirth", e.target.value)} />
              </div>
              <div style={fieldStackStyle}>
                <label style={labelStyle}>Phone Number</label>
                <input style={inputStyle} value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
              </div>
              <div style={fieldStackStyle}>
                <label style={labelStyle}>Address</label>
                <input style={inputStyle} value={form.address} onChange={(e) => updateField("address", e.target.value)} />
              </div>
              <div style={fieldStackStyle}>
                <label style={labelStyle}>City</label>
                <input style={inputStyle} value={form.city} onChange={(e) => updateField("city", e.target.value)} />
              </div>
              <div style={fieldStackStyle}>
                <label style={labelStyle}>Postal Code</label>
                <input style={inputStyle} value={form.postalCode} onChange={(e) => updateField("postalCode", e.target.value)} />
              </div>
              <div style={fieldStackStyle}>
                <label style={labelStyle}>Country</label>
                <input style={inputStyle} value={form.country} onChange={(e) => updateField("country", e.target.value)} />
              </div>
              <div style={fieldStackStyle}>
                <label style={labelStyle}>Gender</label>
                <input style={inputStyle} value={form.gender} onChange={(e) => updateField("gender", e.target.value)} />
              </div>
              <div style={fieldStackStyle}>
                <label style={labelStyle}>Education</label>
                <input style={inputStyle} value={form.education} onChange={(e) => updateField("education", e.target.value)} />
              </div>
              <div style={fieldStackStyle}>
                <label style={labelStyle}>Occupation</label>
                <input style={inputStyle} value={form.occupation} onChange={(e) => updateField("occupation", e.target.value)} />
              </div>
              <div style={fieldStackStyle}>
                <label style={labelStyle}>Are you affiliated with any educational organization? Name of the organization</label>
                <input
                  style={inputStyle}
                  value={form.educationalOrganization}
                  onChange={(e) => updateField("educationalOrganization", e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: "1rem", display: "grid", gap: "10px" }}>
              <label style={checkboxLabelStyle}>
                <span style={{ minWidth: "130px", fontSize: "0.82rem" }}>Default language:</span>
                <select
                  value={defaultLanguage}
                  onChange={(e) => setDefaultLanguage(e.target.value === "fa" ? "fa" : "en")}
                  style={inputStyle}
                >
                  <option value="en">English</option>
                  <option value="fa">Farsi</option>
                </select>
              </label>

              <label style={checkboxLabelStyle}>
                <input type="checkbox" checked={agreeAcademic} onChange={(e) => setAgreeAcademic(e.target.checked)} />
                I agree to share my information anonymously for academic purposes.
              </label>

              <label style={checkboxLabelStyle}>
                <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} />
                I would like to sign up for newsletters.
              </label>
            </div>

            <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <button className="button" onClick={handleSave} disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving..." : "Save"}
              </button>
              {message && <p style={{ margin: 0 }}>{message}</p>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const inputStyle: CSSProperties = {
  border: "1px solid #d1d5db",
  padding: "10px 12px",
  fontSize: "0.95rem",
  background: "#ffffff",
};

const fieldStackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const labelStyle: CSSProperties = {
  fontSize: "0.82rem",
  color: "#64675e",
};

const checkboxLabelStyle: CSSProperties = {
  display: "flex",
  gap: "8px",
  alignItems: "center",
};
