-- Fonction pour créer un administrateur par défaut
-- À exécuter manuellement via la console SQL de Supabase

-- 1. Désactiver temporairement RLS sur admin_users pour pouvoir insérer l'admin
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- 2. Insérer l'utilisateur admin
-- Remplacez 'admin@example.com' par l'email de l'admin souhaité
WITH inserted_user AS (
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@example.com',
    crypt('admin123', gen_salt('bf')), -- Mot de passe temporaire, à changer après la première connexion
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id, email
)
-- 3. Ajouter l'utilisateur à la table admin_users
INSERT INTO admin_users (user_id, email, role, is_active)
SELECT id, email, 'super_admin', true
FROM inserted_user;

-- 4. Réactiver RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 5. Vérifier que l'utilisateur a été créé
SELECT * FROM auth.users WHERE email = 'admin@example.com';
SELECT * FROM admin_users WHERE email = 'admin@example.com';
