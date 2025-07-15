
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateUserRequest {
  email: string;
  password: string;
  display_name: string;
  role: 'admin' | 'gm' | 'user';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { email, password, display_name, role }: CreateUserRequest = await req.json();

    console.log('Creating user with email:', email, 'role:', role);

    // Create user with admin privileges
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw authError;
    }

    console.log('User created in auth:', authUser.user.id);

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: authUser.user.id,
        email: email,
        display_name: display_name
      });

    if (profileError) {
      console.error('Profile error:', profileError);
      throw profileError;
    }

    console.log('Profile created for user:', authUser.user.id);

    // Assign role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authUser.user.id,
        role: role
      });

    if (roleError) {
      console.error('Role error:', roleError);
      throw roleError;
    }

    console.log('Role assigned to user:', authUser.user.id, 'role:', role);

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: authUser.user.id,
          email: authUser.user.email,
          display_name: display_name,
          role: role
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in create-admin-user function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create user',
        details: error
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
