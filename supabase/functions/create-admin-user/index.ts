
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
  debug?: boolean; // Add debug flag for testing
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Starting create-admin-user function ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    
    // Environment variables check with detailed logging
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!serviceRoleKey,
      urlValue: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'missing',
      keyPrefix: serviceRoleKey ? serviceRoleKey.substring(0, 10) : 'missing',
      keyLength: serviceRoleKey?.length || 0
    });

    if (!supabaseUrl) {
      console.error('SUPABASE_URL is missing');
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: SUPABASE_URL missing',
          debug: 'Environment variable SUPABASE_URL is not set'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    if (!serviceRoleKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is missing');
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: Service role key missing',
          debug: 'Environment variable SUPABASE_SERVICE_ROLE_KEY is not set in Edge Functions secrets'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Validate service role key format
    if (!serviceRoleKey.startsWith('eyJ')) {
      console.error('Service role key does not appear to be a JWT token');
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: Invalid service role key format',
          debug: 'Service role key should be a JWT token starting with "eyJ"'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request body',
          debug: `Request body must be valid JSON: ${error.message}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const { email, password, display_name, role, debug }: CreateUserRequest = requestBody;

    console.log('Request data:', {
      email,
      display_name,
      role,
      hasPassword: !!password,
      debugMode: !!debug
    });

    // If debug mode, return environment info without creating user
    if (debug) {
      console.log('Debug mode activated - returning environment info');
      return new Response(
        JSON.stringify({ 
          debug: true,
          environment: {
            supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'missing',
            serviceKeyLength: serviceRoleKey?.length || 0,
            serviceKeyPrefix: serviceRoleKey ? serviceRoleKey.substring(0, 10) : 'missing',
            serviceKeyFormat: serviceRoleKey?.startsWith('eyJ') ? 'valid JWT format' : 'invalid format'
          },
          message: 'Debug info returned successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Validate required fields
    if (!email || !password || !display_name || !role) {
      const missing = [];
      if (!email) missing.push('email');
      if (!password) missing.push('password');
      if (!display_name) missing.push('display_name');
      if (!role) missing.push('role');
      
      console.error('Missing required fields:', missing);
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          debug: `Missing fields: ${missing.join(', ')}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Create Supabase admin client
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

    // Test service role permissions with detailed error logging
    console.log('Testing service role permissions...');
    try {
      const { data: testUsers, error: testError } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1
      });
      
      if (testError) {
        console.error('Service role test failed:', {
          error: testError,
          message: testError.message,
          status: testError.status,
          code: testError.code
        });
        
        return new Response(
          JSON.stringify({ 
            error: 'Service role authentication failed',
            debug: `Auth admin access denied: ${testError.message}`,
            details: {
              errorCode: testError.code,
              status: testError.status,
              suggestion: 'Check that SUPABASE_SERVICE_ROLE_KEY has admin privileges'
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403,
          }
        );
      }
      
      console.log('Service role test successful - can access admin API');
      console.log('Current user count:', testUsers?.length || 0);
      
    } catch (error) {
      console.error('Service role test exception:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Service role validation failed',
          debug: `Exception during auth test: ${error.message}`,
          details: {
            suggestion: 'Verify service role key is correct and has proper permissions'
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Check if user with email already exists
    console.log('Checking if user already exists...');
    try {
      const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        console.error('Error checking existing users:', listError);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to check existing users',
            debug: `List users error: ${listError.message}`
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }

      const userExists = existingUsers?.users?.some(user => user.email === email);
      if (userExists) {
        console.log('User with email already exists:', email);
        return new Response(
          JSON.stringify({ 
            error: 'Email already registered',
            debug: `A user with email ${email} already exists in the system`,
            details: {
              suggestion: 'Use a different email address or check existing users'
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 422,
          }
        );
      }

    } catch (error) {
      console.error('Exception while checking existing users:', error);
      // Continue with user creation - this check is not critical
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
        code: authError.code
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create user account',
          debug: `Auth service error: ${authError.message}`,
          details: {
            errorCode: authError.code,
            status: authError.status
          }
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
          debug: 'Auth service returned no user data'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    console.log('User created successfully:', {
      userId: authUser.user.id,
      email: authUser.user.email
    });

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
      
      // Clean up auth user
      try {
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
        console.log('Cleaned up auth user after profile creation failure');
      } catch (cleanupError) {
        console.error('Failed to cleanup auth user:', cleanupError);
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create user profile',
          debug: `Profile creation error: ${profileError.message}`,
          details: profileError
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
      
      // Clean up profile and auth user
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
          debug: `Role assignment error: ${roleError.message}`,
          details: roleError
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
        },
        debug: 'User created successfully with all components'
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
        debug: `Unexpected error: ${error.message}`,
        details: {
          type: error.name,
          stack: error.stack
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
