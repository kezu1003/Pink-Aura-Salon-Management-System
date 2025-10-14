import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/admin/contact-messages", { withCredentials: true });
        if (data?.success) setMessages(Array.isArray(data.messages) ? data.messages : []);
        else toast.error("Failed to load messages");
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load messages");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const deleteMessage = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      const { data } = await api.delete(`/api/admin/contact-messages/${id}`, { withCredentials: true });
      if (data?.success) {
        setMessages((m) => m.filter((x) => x._id !== id));
        toast.success("Message deleted");
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  // mailto link 

  const buildMailTo = (m) => {
    const subject = `Re: ${m.subject || "Your inquiry"}`;
    const bodyLines = [
      "Hi " + (m.name || ""),
      "",
      "Thanks for contacting Pink Aura Salon.",
      "",
      "—",
      "Original message:",
      `Subject: ${m.subject || ""}`,
      `From: ${m.name || ""} <${m.email || ""}>`,
      `Phone: ${m.phone || "—"}`,
      "",
      (m.message || "")
    ];
    const body = bodyLines.join("\n");
   
   
    const params = new URLSearchParams({
      subject,
      body
      
    });
    return `mailto:${encodeURIComponent(m.email)}?${params.toString()}`;
  };

  if (loading) return <div className="p-8">Loading…</div>;

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-semibold text-[#4D423A]">Inbox — Contact Messages</h1>

      {messages.length === 0 ? (
        <p className="text-gray-500">No messages yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#4D423A]/20 bg-white shadow">
          <table className="min-w-full divide-y divide-[#4D423A]/10">
            <thead className="bg-[#FEF4F1]">
              <tr className="text-left text-sm font-semibold text-[#4D423A]">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Received</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4D423A]/10 text-sm">
              {messages.map((m) => (
                <tr key={m._id} className="hover:bg-[#FEF4F1]/50">
                  <td className="px-4 py-3">{m.name}</td>
                  <td className="px-4 py-3">{m.email}</td>
                  <td className="px-4 py-3">{m.subject}</td>
                  <td className="px-4 py-3">{new Date(m.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => setSelected(m)}
                      className="rounded-full bg-[#FBAA99] px-3 py-1 text-white text-xs font-medium"
                    >
                      View / Reply
                    </button>
                    <button
                      onClick={() => deleteMessage(m._id)}
                      className="rounded-full bg-[#4D423A] px-3 py-1 text-white text-xs font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW MODAL with Reply-in-email button */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6 relative">
            <button
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 text-[#4D423A] text-lg font-bold"
            >
              ×
            </button>

            <h2 className="text-xl font-semibold text-[#4D423A] mb-1">{selected.subject}</h2>
            <p className="text-sm text-[#4D423A]/80">
              <b>From:</b> {selected.name} ({selected.email})
            </p>
            <p className="mb-4 text-sm text-[#4D423A]/80">
              <b>Phone:</b> {selected.phone || "—"}
            </p>

            <div className="rounded-md bg-[#FEF4F1]/70 p-3 mb-6 text-[#4D423A] text-sm whitespace-pre-wrap">
              {selected.message}
            </div>

            <div className="flex justify-end gap-3">
              {/*  opens default email client */}
              <a
                href={buildMailTo(selected)}
                className="rounded-full bg-[#FBAA99] px-5 py-2 text-white font-medium shadow hover:scale-105 transition"
              >
                Reply in Email
              </a>
              <button
                onClick={() => setSelected(null)}
                className="rounded-full border border-[#4D423A]/30 px-5 py-2 text-[#4D423A] font-medium hover:bg-[#FEF4F1]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
