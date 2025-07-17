-- Assign GM role to the user knissen54@gmail.com
INSERT INTO user_roles (user_id, role) 
VALUES ('44733eee-7bfe-43df-bd4d-69fed7585436', 'gm')
ON CONFLICT (user_id, role) DO NOTHING;