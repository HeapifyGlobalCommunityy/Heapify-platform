"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar, 
  MapPin, 
  Video, 
  Users, 
  Plus, 
  Trash, 
  AlertCircle,
  ArrowRight,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createEvent, CreateEventPayload } from "@/lib/actions/events";

interface CustomQuestion {
  id: string;
  label: string;
  required: boolean;
}

export function CreateEventForm() {
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [category, setCategory] = useState("workshop");
  const [description, setDescription] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [isVirtual, setIsVirtual] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [isHackathon, setIsHackathon] = useState(false);

  // Team requirement states
  const [teamRequired, setTeamRequired] = useState(false);
  const [minTeamSize, setMinTeamSize] = useState("2");
  const [maxTeamSize, setMaxTeamSize] = useState("5");

  // Custom questions states
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isSlugEdited) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generated);
    }
  };

  // Track if user manually changes slug
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugEdited(true);
    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ""));
  };

  // Add a new custom question
  const addQuestion = () => {
    setCustomQuestions([
      ...customQuestions,
      { id: `q_${Date.now()}`, label: "", required: false }
    ]);
  };

  // Remove custom question
  const removeQuestion = (id: string) => {
    setCustomQuestions(customQuestions.filter(q => q.id !== id));
  };

  // Update custom question label
  const updateQuestionLabel = (id: string, label: string) => {
    setCustomQuestions(customQuestions.map(q => q.id === id ? { ...q, label } : q));
  };

  // Toggle custom question required
  const toggleQuestionRequired = (id: string) => {
    setCustomQuestions(customQuestions.map(q => q.id === id ? { ...q, required: !q.required } : q));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // 1. Client-side validations
    if (!title.trim()) {
      setError("Title is required.");
      setIsLoading(false);
      return;
    }

    if (!slug.trim()) {
      setError("Slug is required.");
      setIsLoading(false);
      return;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError("Slug can only contain lowercase letters, numbers, and hyphens.");
      setIsLoading(false);
      return;
    }

    if (!startAt) {
      setError("Start date and time is required.");
      setIsLoading(false);
      return;
    }

    const startDate = new Date(startAt);
    if (endAt) {
      const endDate = new Date(endAt);
      if (endDate <= startDate) {
        setError("End date must be strictly after the start date.");
        setIsLoading(false);
        return;
      }
    }

    if (isVirtual && !meetingUrl.trim()) {
      setError("Meeting URL is required for virtual events.");
      setIsLoading(false);
      return;
    }

    if (!isVirtual && !location.trim()) {
      setError("Physical location details are required.");
      setIsLoading(false);
      return;
    }

    // Prepare team config if toggled on
    let teamConfig = null;
    if (teamRequired) {
      const min = parseInt(minTeamSize, 10);
      const max = parseInt(maxTeamSize, 10);
      
      if (isNaN(min) || min < 1) {
        setError("Minimum team size must be at least 1.");
        setIsLoading(false);
        return;
      }
      if (isNaN(max) || max < min) {
        setError("Maximum team size must be greater than or equal to minimum team size.");
        setIsLoading(false);
        return;
      }
      teamConfig = { min_size: min, max_size: max };
    }

    // Filter out empty custom questions
    const finalQuestions = customQuestions
      .filter(q => q.label.trim() !== "")
      .map(q => ({ id: q.id, label: q.label.trim(), required: q.required }));

    // Prepare payload
    const payload: CreateEventPayload = {
      title,
      slug,
      category,
      description: description.trim() || undefined,
      bannerUrl: bannerUrl.trim() || undefined,
      startAt,
      endAt: endAt || undefined,
      isVirtual,
      meetingUrl: isVirtual ? meetingUrl : undefined,
      location: !isVirtual ? location : undefined,
      capacity: capacity ? parseInt(capacity, 10) : undefined,
      isHackathon,
      teamConfig,
      customQuestions: finalQuestions,
    };

    try {
      const result = await createEvent(payload);
      if (result.success) {
        setSuccess("Event created successfully! Redirecting...");
        setTimeout(() => {
          router.push(`/events/${result.slug}`);
        }, 1500);
      } else {
        setError(result.error);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 rounded-[2rem] border border-glass-border bg-glass-bg p-8 backdrop-blur-xl">
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-500">
          <Info className="h-5 w-5 shrink-0 mt-0.5" />
          <p>{success}</p>
        </div>
      )}

      {/* Basic Details Section */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-semibold tracking-tight text-foreground border-b border-glass-border pb-2">
          Basic Details
        </h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">Event Title <span className="text-primary">*</span></Label>
            <Input 
              id="title"
              placeholder="e.g. AI Hackathon 2026"
              value={title}
              onChange={handleTitleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug">URL Slug <span className="text-primary">*</span></Label>
            <Input 
              id="slug"
              placeholder="e.g. ai-hackathon-2026"
              value={slug}
              onChange={handleSlugChange}
              required
              disabled={isLoading}
            />
            <p className="text-[10px] text-muted-foreground">
              This will be used as the URL path for the event page.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="category">Category <span className="text-primary">*</span></Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isLoading}
              className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="workshop">Workshop</option>
              <option value="hackathon">Hackathon</option>
              <option value="web3">Web3</option>
              <option value="blockchain">Blockchain</option>
              <option value="open_source">Open Source</option>
              <option value="internship_session">Internship Session</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="capacity">Capacity Limit</Label>
            <Input 
              id="capacity"
              type="number"
              min="0"
              placeholder="Unlimited"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-[10px] text-muted-foreground">
              Leave empty or set to 0 for unlimited.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bannerUrl">Banner Image URL</Label>
          <Input 
            id="bannerUrl"
            placeholder="https://images.unsplash.com/..."
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            rows={4}
            placeholder="Describe your event, including guidelines and agenda..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      {/* Date & Location Section */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-semibold tracking-tight text-foreground border-b border-glass-border pb-2 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Date & Location
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="startAt">Start Date & Time <span className="text-primary">*</span></Label>
            <Input 
              id="startAt"
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="endAt">End Date & Time</Label>
            <Input 
              id="endAt"
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-glass-border bg-glass-bg/30 p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold">Virtual Event?</Label>
              <p className="text-[10px] text-muted-foreground">Is this event hosted online or in person?</p>
            </div>
            <input 
              type="checkbox"
              id="isVirtual"
              checked={isVirtual}
              onChange={(e) => setIsVirtual(e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
          </div>

          {isVirtual ? (
            <div className="space-y-1.5 pt-2">
              <Label htmlFor="meetingUrl" className="flex items-center gap-1">
                <Video className="h-3.5 w-3.5 text-primary" />
                Meeting URL <span className="text-primary">*</span>
              </Label>
              <Input 
                id="meetingUrl"
                placeholder="https://zoom.us/j/..."
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                required={isVirtual}
                disabled={isLoading}
              />
            </div>
          ) : (
            <div className="space-y-1.5 pt-2">
              <Label htmlFor="location" className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Physical Location <span className="text-primary">*</span>
              </Label>
              <Input 
                id="location"
                placeholder="e.g. Auditorium Room 402, London"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required={!isVirtual}
                disabled={isLoading}
              />
            </div>
          )}
        </div>
      </div>

      {/* Rules & Team Requirements Section */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-semibold tracking-tight text-foreground border-b border-glass-border pb-2 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Event Type & Team Rules
        </h3>

        <div className="flex items-center justify-between rounded-xl border border-glass-border bg-glass-bg/30 p-4">
          <div className="space-y-0.5">
            <Label className="text-sm font-semibold">Mark as Hackathon?</Label>
            <p className="text-[10px] text-muted-foreground">Will this follow typical hackathon timelines and rules?</p>
          </div>
          <input 
            type="checkbox"
            id="isHackathon"
            checked={isHackathon}
            onChange={(e) => setIsHackathon(e.target.checked)}
            disabled={isLoading}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
        </div>

        <div className="space-y-3 rounded-xl border border-glass-border bg-glass-bg/30 p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold">Team Required?</Label>
              <p className="text-[10px] text-muted-foreground">Must participants register as teams instead of individuals?</p>
            </div>
            <input 
              type="checkbox"
              id="teamRequired"
              checked={teamRequired}
              onChange={(e) => setTeamRequired(e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
          </div>

          {teamRequired && (
            <div className="grid gap-4 sm:grid-cols-2 pt-3 border-t border-glass-border">
              <div className="space-y-1.5">
                <Label htmlFor="minTeamSize">Min Team Size <span className="text-primary">*</span></Label>
                <Input 
                  id="minTeamSize"
                  type="number"
                  min="1"
                  value={minTeamSize}
                  onChange={(e) => setMinTeamSize(e.target.value)}
                  required={teamRequired}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="maxTeamSize">Max Team Size <span className="text-primary">*</span></Label>
                <Input 
                  id="maxTeamSize"
                  type="number"
                  min="1"
                  value={maxTeamSize}
                  onChange={(e) => setMaxTeamSize(e.target.value)}
                  required={teamRequired}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Questions Section */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-semibold tracking-tight text-foreground border-b border-glass-border pb-2 flex items-center gap-2">
          Custom Registration Questions
        </h3>
        
        <p className="text-xs text-muted-foreground">
          Request additional information from attendees when they register for this event. These will appear on the registration form.
        </p>

        <div className="space-y-3">
          {customQuestions.map((q, idx) => (
            <div key={q.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 rounded-xl border border-glass-border bg-glass-bg/20 p-3">
              <span className="text-xs font-mono text-muted-foreground shrink-0 self-center">
                #{idx + 1}
              </span>
              
              <div className="flex-1">
                <Input 
                  placeholder="e.g. What is your T-shirt size?"
                  value={q.label}
                  onChange={(e) => updateQuestionLabel(q.id, e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-4">
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground select-none cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={q.required}
                    onChange={() => toggleQuestionRequired(q.id)}
                    disabled={isLoading}
                    className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  Required
                </label>

                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeQuestion(q.id)}
                  disabled={isLoading}
                  className="text-destructive hover:bg-destructive/10 h-8 px-2"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            onClick={addQuestion}
            disabled={isLoading}
            className="w-full border border-dashed border-glass-border text-xs rounded-xl h-10 hover:bg-glass-bg"
          >
            <Plus className="h-4 w-4 mr-1.5 text-primary" />
            Add Custom Question
          </Button>
        </div>
      </div>

      {/* Form Submission */}
      <div className="pt-4 border-t border-glass-border flex justify-end gap-3">
        <Button 
          type="button" 
          variant="ghost"
          disabled={isLoading}
          onClick={() => router.push("/chapter")}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || !title || !slug || !startAt}
          className="flex items-center gap-1.5"
        >
          {isLoading ? "Creating..." : "Create Event"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
