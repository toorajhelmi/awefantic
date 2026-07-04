"use client";

import { useState } from "react";

const initialForm = {
  email: "",
  qualifyingAnswer: "",
  website: "",
};

export default function WaitlistForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submitForm(event) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          sourcePath: window.location.pathname,
        }),
      });
      const body = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(body.message || "Please check the form and try again.");
        return;
      }

      setStatus("success");
      setMessage(body.message || "You're on the Awfantic waitlist.");
      setForm(initialForm);
    } catch {
      setStatus("error");
      setMessage("We could not save your request. Please try again.");
    }
  }

  return (
    <form className="waitlist-card" onSubmit={submitForm}>
      <label htmlFor="email">Email address</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        value={form.email}
        onChange={updateField}
        placeholder="you@example.com"
        required
      />

      <label htmlFor="qualifyingAnswer">
        What should Awfantic help you validate first?
      </label>
      <textarea
        id="qualifyingAnswer"
        name="qualifyingAnswer"
        value={form.qualifyingAnswer}
        onChange={updateField}
        placeholder="Example: a landing page offer, onboarding flow, or MVP scope"
        minLength={3}
        maxLength={500}
        required
      />

      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          autoComplete="off"
          tabIndex={-1}
          value={form.website}
          onChange={updateField}
        />
      </div>

      <button className="button button-primary" disabled={status === "submitting"}>
        {status === "submitting" ? "Joining..." : "Join waitlist"}
      </button>

      {message ? (
        <p className={`form-message form-message-${status}`} role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
