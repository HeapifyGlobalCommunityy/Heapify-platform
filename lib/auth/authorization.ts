import { redirect } from "next/navigation";
import type { UserRole } from "@/lib/types/database";
import {createClient} from "@/lib/supabase/server"

export async function requireRole(allowedRoles : UserRole[]) {
    const supabase = await createClient();

    if(!supabase) redirect("/login");
    const {
        data : {user},
    } = await supabase.auth.getUser();
    //for users not logged in
    if(user === null) redirect("/login");

    const {data:profile} = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
    
    if(!profile || !allowedRoles.includes(profile.role))
        redirect("/")

    return {
        supabase,
        user,
        role:profile.role
    };
}
