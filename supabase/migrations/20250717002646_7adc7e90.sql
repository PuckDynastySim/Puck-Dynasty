-- Assign admin role to puckdynastysim@gmail.com
INSERT INTO user_roles (user_id, role) 
VALUES ('2d8fd422-977c-403f-af91-a7bf2f142c4d', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;