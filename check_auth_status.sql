-- Vérifier les utilisateurs authentifiés
SELECT id, email, created_at, last_sign_in_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Vérifier les utilisateurs admin
SELECT * FROM admin_users;

-- Vérifier les politiques RLS
SELECT tablename, policyname, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Vérifier les permissions actuelles
SELECT 
    grantee, 
    table_schema, 
    table_name, 
    privilege_type
FROM 
    information_schema.role_table_grants 
WHERE 
    table_schema = 'public' 
    AND table_name IN ('admin_users', 'drivers', 'enterprises', 'contacts', 'job_offers', 'job_applications')
ORDER BY 
    table_name, 
    grantee, 
    privilege_type;
