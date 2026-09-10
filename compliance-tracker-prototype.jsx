import React, { useState } from "react";
import { CheckCircle2, Circle, Clock, Upload, ShieldCheck, LayoutGrid, Users, FileText, ArrowRightLeft, X } from "lucide-react";

// ---- Mock data ----
const initialControls = [
  { id: 1, name: "Access reviews conducted quarterly", category: "Access Control", status: "pending_review", due: "Sep 30", evidence: "Q3_access_review.pdf" },
  { id: 2, name: "Security awareness training completed", category: "Personnel", status: "approved", due: "Aug 15", evidence: "training_certs.pdf" },
  { id: 3, name: "Incident response plan documented", category: "Operations", status: "in_progress", due: "Oct 5", evidence: null },
  { id: 4, name: "Vendor risk assessments up to date", category: "Vendor Mgmt", status: "not_started", due: "Oct 20", evidence: null },
  { id: 5, name: "Data encryption at rest verified", category: "Data Security", status: "approved", due: "Jul 1", evidence: "encryption_audit.pdf" },
];

const statusMeta = {
  not_started: { label: "Not started", color: "#8a8578", icon: Circle },
  in_progress: { label: "In progress", color: "#b8863f", icon: Clock },
  pending_review: { label: "Awaiting your review", color: "#4a6fa5", icon: Clock },
  approved: { label: "Approved", color: "#3f7d5c", icon: CheckCircle2 },
};

const clientStatusMeta = {
  not_started: { label: "Not started", color: "#8a8578" },
  in_progress: { label: "In progress", color: "#b8863f" },
  pending_review: { label: "Submitted — under review", color: "#4a6fa5" },
  approved: { label: "Complete", color: "#3f7d5c" },
};

export default function App() {
  const [view, setView] = useState("operator");
  const [controls, setControls] = useState(initialControls);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const approveControl = (id) => {
    setControls((cs) => cs.map((c) => (c.id === id ? { ...c, status: "approved" } : c)));
    showToast("Control approved");
  };

  const rejectControl = (id) => {
    setControls((cs) => cs.map((c) => (c.id === id ? { ...c, status: "in_progress" } : c)));
    showToast("Sent back to client with notes");
  };

  const submitEvidence = (id) => {
    setControls((cs) =>
      cs.map((c) => (c.id === id ? { ...c, status: "pending_review", evidence: "new_upload.pdf" } : c))
    );
    showToast("Evidence submitted for review");
  };

  const completed = controls.filter((c) => c.status === "approved").length;
  const pct = Math.round((completed / controls.length) * 100);

  return (
    <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", background: "#faf8f4", minHeight: "100vh", color: "#2b2a26" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .sans { font-family: 'IBM Plex Sans', sans-serif; }
        button { cursor: pointer; font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #e3ddd0", padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ShieldCheck size={22} color="#3f5a45" />
          <span style={{ fontSize: 19, fontWeight: 600 }}>Ledger&nbsp;Compliance</span>
        </div>
        <div className="sans" style={{ display: "flex", gap: 6, background: "#efe9dc", padding: 4, borderRadius: 8 }}>
          <button
            onClick={() => setView("operator")}
            style={{
              padding: "7px 14px", borderRadius: 6, border: "none", fontSize: 13,
              background: view === "operator" ? "#2b2a26" : "transparent",
              color: view === "operator" ? "#faf8f4" : "#2b2a26",
            }}
          >
            Operator Console
          </button>
          <button
            onClick={() => setView("client")}
            style={{
              padding: "7px 14px", borderRadius: 6, border: "none", fontSize: 13,
              background: view === "client" ? "#2b2a26" : "transparent",
              color: view === "client" ? "#faf8f4" : "#2b2a26",
            }}
          >
            Client Portal
          </button>
        </div>
      </div>

      {view === "operator" ? (
        <OperatorView controls={controls} onApprove={approveControl} onReject={rejectControl} />
      ) : (
        <ClientView controls={controls} pct={pct} onSubmit={submitEvidence} />
      )}

      {toast && (
        <div className="sans" style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "#2b2a26", color: "#faf8f4", padding: "10px 18px", borderRadius: 8, fontSize: 13,
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function OperatorView({ controls, onApprove, onReject }) {
  const pendingReview = controls.filter((c) => c.status === "pending_review");

  return (
    <div style={{ padding: "28px", maxWidth: 920, margin: "0 auto" }}>
      <div className="sans" style={{ display: "flex", gap: 16, marginBottom: 26 }}>
        <StatCard label="Acme Corp — controls" value={`${controls.length}`} />
        <StatCard label="Awaiting your review" value={`${pendingReview.length}`} accent="#4a6fa5" />
        <StatCard label="Approved" value={`${controls.filter((c) => c.status === "approved").length}`} accent="#3f7d5c" />
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Acme Corp — SOC 2 controls</h2>
      <p className="sans" style={{ color: "#6b675c", fontSize: 13, marginBottom: 20 }}>
        Only you can approve a control. Clients can only submit evidence.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {controls.map((c) => {
          const meta = statusMeta[c.status];
          const Icon = meta.icon;
          return (
            <div key={c.id} style={{
              border: "1px solid #e3ddd0", borderRadius: 10, padding: "14px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Icon size={18} color={meta.color} />
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 500 }}>{c.name}</div>
                  <div className="sans" style={{ fontSize: 12, color: "#8a8578" }}>{c.category} · Due {c.due}</div>
                </div>
              </div>
              <div className="sans" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: meta.color, fontWeight: 500 }}>{meta.label}</span>
                {c.status === "pending_review" && (
                  <>
                    <button onClick={() => onApprove(c.id)} style={{ background: "#3f7d5c", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 12 }}>
                      Approve
                    </button>
                    <button onClick={() => onReject(c.id)} style={{ background: "#fff", color: "#a5473b", border: "1px solid #e3ddd0", borderRadius: 6, padding: "6px 12px", fontSize: 12 }}>
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ClientView({ controls, pct, onSubmit }) {
  const actionNeeded = controls.filter((c) => c.status === "not_started" || c.status === "in_progress");

  return (
    <div style={{ padding: "28px", maxWidth: 700, margin: "0 auto" }}>
      <div style={{ marginBottom: 26 }}>
        <div className="sans" style={{ fontSize: 12, color: "#6b675c", marginBottom: 6 }}>Overall compliance progress</div>
        <div style={{ background: "#efe9dc", borderRadius: 8, height: 10, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, background: "#3f7d5c", height: "100%", transition: "width .3s" }} />
        </div>
        <div className="sans" style={{ fontSize: 13, marginTop: 6, color: "#6b675c" }}>{pct}% complete</div>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 14 }}>Action needed</h2>
      {actionNeeded.length === 0 && (
        <p className="sans" style={{ color: "#6b675c", fontSize: 13 }}>Nothing needed from you right now.</p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 30 }}>
        {actionNeeded.map((c) => (
          <div key={c.id} style={{ border: "1px solid #e3ddd0", borderRadius: 10, padding: "14px 16px", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 500 }}>{c.name}</div>
              <div className="sans" style={{ fontSize: 12, color: "#8a8578" }}>Due {c.due}</div>
            </div>
            <button
              onClick={() => onSubmit(c.id)}
              className="sans"
              style={{ display: "flex", alignItems: "center", gap: 6, background: "#2b2a26", color: "#faf8f4", border: "none", borderRadius: 6, padding: "7px 12px", fontSize: 12 }}
            >
              <Upload size={13} /> Upload evidence
            </button>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 14 }}>All controls</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {controls.map((c) => {
          const meta = clientStatusMeta[c.status];
          return (
            <div key={c.id} className="sans" style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "8px 2px", borderBottom: "1px solid #efe9dc" }}>
              <span>{c.name}</span>
              <span style={{ color: meta.color, fontWeight: 500 }}>{meta.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent = "#2b2a26" }) {
  return (
    <div style={{ flex: 1, border: "1px solid #e3ddd0", borderRadius: 10, padding: "14px 16px", background: "#fff" }}>
      <div style={{ fontSize: 24, fontWeight: 600, color: accent }}>{value}</div>
      <div style={{ fontSize: 12, color: "#6b675c" }}>{label}</div>
    </div>
  );
}
