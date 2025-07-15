
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
    console.log('=== Starting create-admin-user function ===');
    
    // Verify environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!serviceRoleKey,
      urlLength: supabaseUrl?.length || 0,
      keyLength: serviceRoleKey?.length || 0
    });

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing environment variables:', {
        SUPABASE_URL: !!supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: !!serviceRoleKey
      });
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: Missing environment variables',
          details: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request body',
          details: 'Request body must be valid JSON'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const { email, password, display_name, role }: CreateUserRequest = requestBody;

    console.log('Request data:', {
      email,
      display_name,
      role,
      hasPassword: !!password
    });

    // Validate required fields
    if (!email || !password || !display_name || !role) {
      console.error('Missing required fields:', {
        email: !!email,
        password: !!password,
        display_name: !!display_name,
        role: !!role
      });
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          details: 'email, password, display_name, and role are required'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Create Supabase client with service role key
    console.log('Creating Supabase admin client...');
    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Test service role permissions by attempting to list users
    console.log('Testing service role permissions...');
    try {
      const { data: testUsers, error: testError } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1
      });
      
      if (testError) {
        console.error('Service role test failed:', testError);
        return new Response(
          JSON.stringify({ 
            error: 'Service role key authentication failed',
            details: testError.message
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403,
          }
        );
      }
      
      console.log('Service role test successful, can access users');
    } catch (error) {
      console.error('Service role test exception:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Service role key validation failed',
          details: error.message
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      );
    }

    console.log('Creating user with admin privileges...');
    
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
      console.error('User creation failed:', {
        message: authError.message,
        status: authError.status,
        code: authError.code || 'unknown'
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create user account',
          details: authError.message,
          code: authError.code
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: authError.status || 400,
        }
      );
    }

    if (!authUser?.user?.id) {
      console.error('User creation returned no user data');
      return new Response(
        JSON.stringify({ 
          error: 'User creation failed',
          details: 'No user data returned from auth service'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    console.log('User created successfully:', authUser.user.id);

    // Create profile
    console.log('Creating user profile...');
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: authUser.user.id,
        email: email,
        display_name: display_name
      });

    if (profileError) {
      console.error('Profile creation failed:', profileError);
      
      // Try to clean up the auth user if profile creation fails
      try {
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
        console.log('Cleaned up auth user after profile creation failure');
      } catch (cleanupError) {
        console.error('Failed to cleanup auth user:', cleanupError);
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create user profile',
          details: profileError.message
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    console.log('Profile created successfully');

    // Assign role
    console.log('Assigning user role:', role);
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authUser.user.id,
        role: role
      });

    if (roleError) {
      console.error('Role assignment failed:', roleError);
      
      // Try to clean up if role assignment fails
      try {
        await supabaseAdmin.from('profiles').delete().eq('user_id', authUser.user.id);
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
        console.log('Cleaned up user after role assignment failure');
      } catch (cleanupError) {
        console.error('Failed to cleanup after role assignment failure:', cleanupError);
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to assign user role',
          details: roleError.message
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    console.log('Role assigned successfully');
    console.log('=== User creation completed successfully ===');

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
    console.error('Unexpected error in create-admin-user function:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: `Unexpected error: ${error.message}`,
        type: error.name
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
