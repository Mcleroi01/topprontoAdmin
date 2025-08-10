-- Désactiver temporairement le RLS pour permettre les modifications
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Enable read access for all users" ON admin_users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON admin_users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON admin_users;

-- Politique simple pour la lecture (tous les utilisateurs authentifiés peuvent voir)
CREATE POLICY "Enable read access for all users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

-- Politique pour l'insertion (tous les utilisateurs authentifiés peuvent insérer)
CREATE POLICY "Enable insert for authenticated users only"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Politique pour la mise à jour (uniquement le propriétaire peut mettre à jour)
CREATE POLICY "Enable update for users based on user_id"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Réactiver le RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
