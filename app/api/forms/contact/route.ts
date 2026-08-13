import { NextResponse } from "next/server";
import { z } from "zod";
import { adminClient } from "@/lib/supabase/admin";

const ContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Must be a valid email"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ContactSchema.parse(body);

   const supabase = adminClient;

    if (!supabase) {
      return NextResponse.json(
        {
          success: false,
          error: "Supabase is not configured.",
        },
        { status: 500 }
      );
    }
const {
  data: { user },
} = await supabase.auth.getUser();

console.log("User:", user);

const payload = {
  form_type: "contact",
  submitted_by: null,
  payload: {
    name: parsed.name,
    email: parsed.email,
    subject: parsed.subject,
    message: parsed.message,
  },
  status: "pending",
};

console.log("Payload:", payload);

const { data, error } = await supabase
  .from("form_submissions")
  .insert(payload)
  .select("id, form_type, submitted_by, submitted_at");

console.log("Data:", data);
console.log("Error:", error);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Message submitted successfully.",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);

    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: err.errors.map((e) => e.message),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}