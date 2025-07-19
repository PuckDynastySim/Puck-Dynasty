
-- Update RLS policy for profiles table to allow admins to view all profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create new policy that allows users to view their own profile OR allows admins to view all profiles
CREATE POLICY "Users can view own profile, admins can view all" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Ensure admin users can view all user roles (this should already exist but let's verify)
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create policy that allows users to view their own roles OR allows admins to view all roles
CREATE POLICY "Users can view own roles, admins can view all"
ON public.user_roles 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  public.has_role(auth.uid(), 'admin'::app_role)
);
