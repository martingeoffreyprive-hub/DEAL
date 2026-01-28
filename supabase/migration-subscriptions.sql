-- =============================================
-- MIGRATION : Système d'abonnements et secteurs
-- =============================================

-- 1. ENUM pour les plans
CREATE TYPE subscription_plan AS ENUM (
  'free',        -- Gratuit : 1 secteur, 5 devis/mois
  'starter',     -- Starter : 3 secteurs, 30 devis/mois
  'pro',         -- Pro : 10 secteurs, 100 devis/mois
  'ultimate'     -- Ultime : Tous secteurs, illimité
);

-- 2. TABLE : Plans et leurs limites
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name subscription_plan UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  price_monthly NUMERIC(10, 2) NOT NULL DEFAULT 0,
  price_yearly NUMERIC(10, 2) NOT NULL DEFAULT 0,
  max_sectors INTEGER NOT NULL DEFAULT 1,        -- -1 = illimité
  max_quotes_per_month INTEGER NOT NULL DEFAULT 5, -- -1 = illimité
  ai_assistant_enabled BOOLEAN DEFAULT false,
  pdf_export_enabled BOOLEAN DEFAULT true,
  pdf_protection_enabled BOOLEAN DEFAULT false,
  priority_support BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer les plans par défaut
INSERT INTO plans (name, display_name, description, price_monthly, price_yearly, max_sectors, max_quotes_per_month, ai_assistant_enabled, pdf_export_enabled, pdf_protection_enabled, priority_support) VALUES
  ('free', 'Gratuit', 'Pour découvrir DEAL', 0, 0, 1, 5, false, true, false, false),
  ('starter', 'Starter', 'Pour les indépendants', 9.99, 99, 3, 30, true, true, false, false),
  ('pro', 'Pro', 'Pour les professionnels actifs', 24.99, 249, 10, 100, true, true, true, false),
  ('ultimate', 'Ultime', 'Accès complet illimité', 49.99, 499, -1, -1, true, true, true, true);

-- 3. TABLE : Abonnements utilisateurs
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name subscription_plan NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active', -- active, cancelled, past_due, trialing
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_subscription UNIQUE(user_id)
);

-- Index
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- 4. TABLE : Secteurs achetés/débloqués par utilisateur
CREATE TABLE user_sectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sector sector_type NOT NULL,
  is_primary BOOLEAN DEFAULT false,  -- Secteur principal choisi à l'inscription
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,            -- NULL = permanent
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_sector UNIQUE(user_id, sector)
);

-- Index
CREATE INDEX idx_user_sectors_user_id ON user_sectors(user_id);

-- 5. TABLE : Compteur d'utilisation mensuelle
CREATE TABLE usage_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL, -- Format: '2024-01'
  quotes_created INTEGER DEFAULT 0,
  ai_requests INTEGER DEFAULT 0,
  pdf_exports INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_month UNIQUE(user_id, month_year)
);

-- Index
CREATE INDEX idx_usage_stats_user_month ON usage_stats(user_id, month_year);

-- 6. Ajouter colonnes à profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;

-- 7. FONCTION : Créer abonnement gratuit pour nouveaux utilisateurs
CREATE OR REPLACE FUNCTION handle_new_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer abonnement gratuit
  INSERT INTO subscriptions (user_id, plan_name, status)
  VALUES (NEW.id, 'free', 'active');

  -- Initialiser les stats du mois
  INSERT INTO usage_stats (user_id, month_year)
  VALUES (NEW.id, TO_CHAR(NOW(), 'YYYY-MM'));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger après création utilisateur
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_subscription();

-- 8. FONCTION : Incrémenter compteur de devis
CREATE OR REPLACE FUNCTION increment_quote_count()
RETURNS TRIGGER AS $$
DECLARE
  v_month_year TEXT;
BEGIN
  v_month_year := TO_CHAR(NOW(), 'YYYY-MM');

  INSERT INTO usage_stats (user_id, month_year, quotes_created)
  VALUES (NEW.user_id, v_month_year, 1)
  ON CONFLICT (user_id, month_year)
  DO UPDATE SET
    quotes_created = usage_stats.quotes_created + 1,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger après création devis
CREATE TRIGGER trigger_increment_quote_count
  AFTER INSERT ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION increment_quote_count();

-- 9. FONCTION : Vérifier si utilisateur peut créer un devis
CREATE OR REPLACE FUNCTION can_create_quote(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_name subscription_plan;
  v_max_quotes INTEGER;
  v_current_count INTEGER;
  v_month_year TEXT;
BEGIN
  v_month_year := TO_CHAR(NOW(), 'YYYY-MM');

  -- Récupérer le plan
  SELECT s.plan_name INTO v_plan_name
  FROM subscriptions s
  WHERE s.user_id = p_user_id AND s.status = 'active';

  -- Récupérer la limite
  SELECT max_quotes_per_month INTO v_max_quotes
  FROM plans
  WHERE name = v_plan_name;

  -- Illimité
  IF v_max_quotes = -1 THEN
    RETURN true;
  END IF;

  -- Compter les devis du mois
  SELECT COALESCE(quotes_created, 0) INTO v_current_count
  FROM usage_stats
  WHERE user_id = p_user_id AND month_year = v_month_year;

  RETURN v_current_count < v_max_quotes;
END;
$$ LANGUAGE plpgsql;

-- 10. FONCTION : Vérifier si utilisateur a accès à un secteur
CREATE OR REPLACE FUNCTION has_sector_access(p_user_id UUID, p_sector sector_type)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_name subscription_plan;
BEGIN
  -- Récupérer le plan
  SELECT s.plan_name INTO v_plan_name
  FROM subscriptions s
  WHERE s.user_id = p_user_id AND s.status = 'active';

  -- Plan Ultime = accès à tout
  IF v_plan_name = 'ultimate' THEN
    RETURN true;
  END IF;

  -- Vérifier si le secteur est débloqué
  RETURN EXISTS (
    SELECT 1 FROM user_sectors
    WHERE user_id = p_user_id
    AND sector = p_sector
    AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql;

-- 11. RLS pour les nouvelles tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Plans : lecture publique
CREATE POLICY "Anyone can view plans" ON plans FOR SELECT USING (true);

-- Subscriptions : utilisateur voit/modifie le sien
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- User sectors : utilisateur voit/modifie les siens
CREATE POLICY "Users can view own sectors" ON user_sectors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sectors" ON user_sectors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own sectors" ON user_sectors FOR DELETE USING (auth.uid() = user_id);

-- Usage stats : utilisateur voit les siennes
CREATE POLICY "Users can view own usage" ON usage_stats FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- FIN MIGRATION
-- =============================================
SELECT 'Migration abonnements terminée !' as message;
