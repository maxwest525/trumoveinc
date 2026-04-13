import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller
    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: authError } = await anonClient.auth.getUser();
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const publicClient = createClient(supabaseUrl, anonKey);
    const appOrigin = req.headers.get("origin") || "https://trumoveinc.lovable.app";

    // Check caller is owner or admin
    const { data: callerRoles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id);

    const isOwnerOrAdmin = (callerRoles ?? []).some(
      (r: any) => r.role === "owner" || r.role === "admin"
    );
    if (!isOwnerOrAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: owner or admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    // INVITE: Create user via admin API and assign role
    if (action === "invite") {
      const { email, role, display_name } = body;
      if (!email || !role) {
        return new Response(JSON.stringify({ error: "Email and role are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const validRoles = ["owner", "admin", "manager", "agent", "marketing", "accounting"];
      if (!validRoles.includes(role)) {
        return new Response(JSON.stringify({ error: "Invalid role" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Only owners can assign owner role
      const callerIsOwner = (callerRoles ?? []).some((r: any) => r.role === "owner");
      if (role === "owner" && !callerIsOwner) {
        return new Response(JSON.stringify({ error: "Only owners can assign the owner role" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Invite user via admin API — redirects to /set-password so they must create credentials
      const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
        data: { display_name: display_name || email.split("@")[0] },
        redirectTo: `${appOrigin}/set-password`,
      });

      if (inviteError) {
        return new Response(JSON.stringify({ error: inviteError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Assign role and store phone if provided
      if (inviteData?.user) {
        await adminClient.from("user_roles").upsert(
          { user_id: inviteData.user.id, role },
          { onConflict: "user_id,role" }
        );
        // Store phone number on profile if provided
        const { phone } = body;
        if (phone) {
          await adminClient.from("profiles").update({ phone }).eq("id", inviteData.user.id);
        }
      }

      return new Response(JSON.stringify({ success: true, user: inviteData.user }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ASSIGN ROLE: Update role for existing user
    if (action === "assign_role") {
      const { user_id, role } = body;
      if (!user_id || !role) {
        return new Response(JSON.stringify({ error: "user_id and role are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const validRoles = ["owner", "admin", "manager", "agent", "marketing", "accounting"];
      if (!validRoles.includes(role)) {
        return new Response(JSON.stringify({ error: "Invalid role" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const callerIsOwner = (callerRoles ?? []).some((r: any) => r.role === "owner");
      if (role === "owner" && !callerIsOwner) {
        return new Response(JSON.stringify({ error: "Only owners can assign the owner role" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Remove existing roles, then assign new one
      await adminClient.from("user_roles").delete().eq("user_id", user_id);
      const { error: roleError } = await adminClient.from("user_roles").insert({ user_id, role });

      if (roleError) {
        return new Response(JSON.stringify({ error: roleError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // REMOVE ROLE: Remove a user's role
    if (action === "remove_role") {
      const { user_id } = body;
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Prevent removing own owner role
      if (user_id === caller.id) {
        return new Response(JSON.stringify({ error: "Cannot remove your own role" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await adminClient.from("user_roles").delete().eq("user_id", user_id);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE USER: Remove user entirely (auth + profile + roles)
    if (action === "delete_user") {
      const { user_id } = body;
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (user_id === caller.id) {
        return new Response(JSON.stringify({ error: "Cannot delete yourself" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Only owners can delete users
      const callerIsOwner = (callerRoles ?? []).some((r: any) => r.role === "owner");
      if (!callerIsOwner) {
        return new Response(JSON.stringify({ error: "Only owners can delete users" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await adminClient.from("user_roles").delete().eq("user_id", user_id);
      await adminClient.from("profiles").delete().eq("id", user_id);
      const { error: delError } = await adminClient.auth.admin.deleteUser(user_id);
      if (delError) {
        return new Response(JSON.stringify({ error: delError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // RESEND INVITE: Re-send invitation email to existing user
    if (action === "resend_invite") {
      const { user_id } = body;
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get user email from profiles
      const { data: profile } = await adminClient
        .from("profiles")
        .select("email")
        .eq("id", user_id)
        .single();

      if (!profile?.email) {
        return new Response(JSON.stringify({ error: "User email not found" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: resendError } = await adminClient.auth.admin.inviteUserByEmail(profile.email, {
        redirectTo: `${appOrigin}/set-password`,
      });

      if (resendError) {
        return new Response(JSON.stringify({ error: resendError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // RESET PASSWORD: Send a password reset email to an existing user
    if (action === "reset_password") {
      const { user_id } = body;
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: profile } = await adminClient
        .from("profiles")
        .select("email")
        .eq("id", user_id)
        .single();

      if (!profile?.email) {
        return new Response(JSON.stringify({ error: "User email not found" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: resetError } = await publicClient.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${appOrigin}/reset-password`,
      });

      if (resetError) {
        return new Response(JSON.stringify({ error: resetError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SET PASSWORD: Admin directly sets a user's password
    if (action === "set_password") {
      const { user_id, password } = body;
      if (!user_id || !password) {
        return new Response(JSON.stringify({ error: "user_id and password are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (password.length < 8) {
        return new Response(JSON.stringify({ error: "Password must be at least 8 characters" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (user_id === caller.id) {
        return new Response(JSON.stringify({ error: "Use account settings to change your own password" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error: pwError } = await adminClient.auth.admin.updateUserById(user_id, { password });
      if (pwError) {
        return new Response(JSON.stringify({ error: pwError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // UPDATE DISPLAY NAME
    if (action === "update_name") {
      const { user_id, display_name } = body;
      if (!user_id || !display_name) {
        return new Response(JSON.stringify({ error: "user_id and display_name are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error: nameError } = await adminClient
        .from("profiles")
        .update({ display_name })
        .eq("id", user_id);
      if (nameError) {
        return new Response(JSON.stringify({ error: nameError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
