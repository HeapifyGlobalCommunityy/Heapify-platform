"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar, 
  MapPin, 
  Video, 
  AlertCircle,
  Info,
  Plus,
  Trash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateEvent, UpdateEventPayload } from "@/lib/actions/events";
import { STORAGE_BUCKETS, uploadPublicImage } from "@/lib/storage/client";

interface EventData {
  id: string;
  title: string;
  description: string | null;
  banner_url: string | null;
  start_at: string;
  end_at: string | null;
  is_virtual: boolean;
  meeting_url: string | null;
  location: string | null;
  capacity: number | null;
  slug: string;
  agenda?: { time: string; title: string }[] | null;
  speakers?: { name: string; bio?: string; photo_url?: string }[] | null;
}

interface EditEventFormProps {
  event: EventData;
}

// Convert UTC dates from DB to local datetime-local format (YYYY-MM-DDThh:mm)
function formatDateTimeLocal(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function EditEventForm({ event }: EditEventFormProps) {
  const router = useRouter();

  // Form states pre-populated with event data
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || "");
  const [bannerUrl, setBannerUrl] = useState(event.banner_url || "");
  const [startAt, setStartAt] = useState(formatDateTimeLocal(event.start_at));
  const [endAt, setEndAt] = useState(formatDateTimeLocal(event.end_at));
  const [isVirtual, setIsVirtual] = useState(event.is_virtual);
  const [meetingUrl, setMeetingUrl] = useState(event.meeting_url || "");
  const [location, setLocation] = useState(event.location || "");
  const [capacity, setCapacity] = useState(event.capacity ? String(event.capacity) : "");

  // Agenda and Speakers states
  const [agenda, setAgenda] = useState<{ id: string; time: string; title: string }[]>(
    (event.agenda || []).map(a => ({ id: Date.now().toString() + Math.random(), ...a }))
  );
  const [speakers, setSpeakers] = useState<{ id: string; name: string; bio: string; photo_url: string }[]>(
    (event.speakers || []).map(s => ({ 
      id: Date.now().toString() + Math.random(), 
      name: s.name, 
      bio: s.bio || "", 
      photo_url: s.photo_url || "" 
    }))
  );

  // Agenda handlers
  const addAgendaItem = () => {
    setAgenda([...agenda, { id: Date.now().toString(), time: "", title: "" }]);
  };
  const removeAgendaItem = (id: string) => {
    setAgenda(agenda.filter(a => a.id !== id));
  };
  const updateAgendaItem = (id: string, field: "time" | "title", value: string) => {
    setAgenda(agenda.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  // Speakers handlers
  const addSpeaker = () => {
    setSpeakers([...speakers, { id: Date.now().toString(), name: "", bio: "", photo_url: "" }]);
  };
  const removeSpeaker = (id: string) => {
    setSpeakers(speakers.filter(s => s.id !== id));
  };
  const updateSpeaker = (id: string, field: "name" | "bio" | "photo_url", value: string) => {
    setSpeakers(speakers.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleBannerUpload = async (file: File | undefined) => {
    if (!file) return;

    setError(null);
    setIsUploadingBanner(true);

    try {
      const bannerUrl = await uploadPublicImage(STORAGE_BUCKETS.eventBanners, file);
      setBannerUrl(bannerUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Banner upload failed.");
    } finally {
      setIsUploadingBanner(false);
    }
  };

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isUploadingBanner) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // 1. Client-side validations
    if (!title.trim()) {
      setError("Title is required.");
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

    // Convert startAt and endAt back to ISO strings
    const startIso = new Date(startAt).toISOString();
    const endIso = endAt ? new Date(endAt).toISOString() : undefined;

    // Filter agenda and speakers
    const finalAgenda = agenda
      .filter(a => a.title.trim() !== "")
      .map(a => ({ time: a.time.trim(), title: a.title.trim() }));
    
    const finalSpeakers = speakers
      .filter(s => s.name.trim() !== "")
      .map(s => ({ 
        name: s.name.trim(), 
        bio: s.bio.trim() || undefined, 
        photo_url: s.photo_url.trim() || undefined 
      }));

    // Prepare payload
    const payload: UpdateEventPayload = {
      eventId: event.id,
      title: title.trim(),
      description: description.trim() || undefined,
      bannerUrl: bannerUrl.trim() || undefined,
      startAt: startIso,
      endAt: endIso,
      isVirtual,
      meetingUrl: isVirtual ? meetingUrl : undefined,
      location: !isVirtual ? location : undefined,
      capacity: capacity ? parseInt(capacity, 10) : undefined,
      agenda: finalAgenda,
      speakers: finalSpeakers,
    };

    try {
      const result = await updateEvent(payload);
      if (result.success) {
        setSuccess("Event updated successfully! Redirecting...");
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
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isLoading}
            />
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
          <Label htmlFor="bannerFile">Banner Image</Label>
          <Input
            id="bannerFile"
            type="file"
            accept="image/*"
            onChange={(e) => handleBannerUpload(e.target.files?.[0])}
            disabled={isLoading || isUploadingBanner}
          />
          <p className="text-xs text-muted-foreground">
            {isUploadingBanner ? "Uploading banner..." : "PNG, JPG, or WebP up to 5 MB."}
          </p>
          <Input 
            id="bannerUrl"
            placeholder="Or paste an external image URL"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            disabled={isLoading || isUploadingBanner}
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
                placeholder="e.g. https://zoom.us/j/..."
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
                placeholder="e.g. Building 4, Conference Room B"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required={!isVirtual}
                disabled={isLoading}
              />
            </div>
          )}
        </div>
      </div>

      {/* Agenda Section */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-semibold tracking-tight text-foreground border-b border-glass-border pb-2">
          Agenda (Optional)
        </h3>
        
        <div className="space-y-3">
          {agenda.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row gap-3 rounded-xl border border-glass-border bg-glass-bg/20 p-4">
              <div className="w-full sm:w-[120px]">
                <Input 
                  placeholder="e.g. 10:00 AM"
                  value={item.time}
                  onChange={(e) => updateAgendaItem(item.id, "time", e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="flex-1">
                <Input 
                  placeholder="Item Title"
                  value={item.title}
                  onChange={(e) => updateAgendaItem(item.id, "title", e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                onClick={() => removeAgendaItem(item.id)}
                disabled={isLoading}
                className="shrink-0 text-red-500 hover:text-red-400 hover:bg-red-500/10 h-9 w-9 p-0"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addAgendaItem}
            disabled={isLoading}
            className="w-full border-dashed"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Agenda Item
          </Button>
        </div>
      </div>

      {/* Speakers Section */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-semibold tracking-tight text-foreground border-b border-glass-border pb-2">
          Speakers (Optional)
        </h3>
        
        <div className="space-y-3">
          {speakers.map((speaker) => (
            <div key={speaker.id} className="flex flex-col gap-3 rounded-xl border border-glass-border bg-glass-bg/20 p-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input 
                    placeholder="Speaker Name"
                    value={speaker.name}
                    onChange={(e) => updateSpeaker(speaker.id, "name", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeSpeaker(speaker.id)}
                  disabled={isLoading}
                  className="shrink-0 text-red-500 hover:text-red-400 hover:bg-red-500/10 h-9 w-9 p-0"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input 
                  placeholder="Bio (e.g. Lead Engineer)"
                  value={speaker.bio}
                  onChange={(e) => updateSpeaker(speaker.id, "bio", e.target.value)}
                  disabled={isLoading}
                />
                <Input 
                  placeholder="Photo URL (Optional)"
                  value={speaker.photo_url}
                  onChange={(e) => updateSpeaker(speaker.id, "photo_url", e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          ))}
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addSpeaker}
            disabled={isLoading}
            className="w-full border-dashed"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Speaker
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-glass-border pt-6">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
}
