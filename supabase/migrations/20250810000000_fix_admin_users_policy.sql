-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Admin users can manage admin_users" ON admin_users;
DROP POLICY IF EXISTS "Users can manage their own admin record" ON admin_users;
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Service role full access" ON admin_users;

-- Politique pour permettre aux utilisateurs de gérer leur propre enregistrement admin
CREATE POLICY "Users can manage their own admin record"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux administrateurs de voir tous les administrateurs
CREATE POLICY "Admins can view all admin users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- Accès complet pour le service role (nécessaire pour les fonctions côté serveur)
CREATE POLICY "Service role full access"
  ON admin_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Permettre l'insertion initiale d'administrateurs (nécessaire pour la configuration initiale)
CREATE POLICY "Allow initial admin creation"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
