"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { CTAComponent, SectionWrapper } from "@/components/site/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Page() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const [status, setStatus] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/forms/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      setStatus({
        ok: true,
        message: data.message,
      });

      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      setStatus({
        ok: false,
        message:
          err instanceof Error
            ? err.message
            : "Something went wrong.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SectionWrapper
        eyebrow="Contact"
        title="Get in Touch"
        description="Have a question, suggestion, partnership inquiry, or need assistance? Send us a message and our team will get back to you as soon as possible."
        className="pt-36"
      >
        <div className="rounded-[1.75rem] border border-glass-border bg-glass-bg p-6 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="grid gap-6">
            {status && (
              <div
                className={
                  status.ok
                    ? "rounded-md bg-green-500/10 p-3 text-sm text-green-600"
                    : "rounded-md bg-red-500/10 p-3 text-sm text-red-600"
                }
              >
                {status.message}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>

                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>

                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>

              <Input
                id="subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Subject"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>

              <textarea
                id="message"
                name="message"
                rows={6}
                value={form.message}
                onChange={handleChange}
                placeholder="Write your message..."
                required
                className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? "Sending..." : "Send Message"}
              </Button>

              <p className="text-sm text-muted-foreground">
                We typically respond within 24–48 hours.
              </p>
            </div>
          </form>
        </div>
      </SectionWrapper>

      <CTAComponent
        title="Want to Get More Involved?"
        description="Explore sponsorship opportunities or become part of the Heapify community."
        actions={[
          {
            label: "Become a Sponsor",
            href: "/sponsor",
          },
          {
            label: "Join the Community",
            href: "/forms/join",
            variant: "ghost",
          },
        ]}
      />
    </>
  );
}