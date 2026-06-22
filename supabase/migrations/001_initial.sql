CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  nama TEXT,
  email TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_purchased_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE kategori (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE hutang (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  kategori_id UUID REFERENCES kategori(id),
  tanggal DATE NOT NULL,
  jumlah DECIMAL(15,2) NOT NULL,
  catatan TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_months INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pembayaran (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hutang_id UUID REFERENCES hutang(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  tanggal_bayar DATE NOT NULL,
  jumlah DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kategori ENABLE ROW LEVEL SECURITY;
ALTER TABLE hutang ENABLE ROW LEVEL SECURITY;
ALTER TABLE pembayaran ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: user own data" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "kategori: user own data" ON kategori FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "hutang: user own data" ON hutang FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "pembayaran: user own data" ON pembayaran FOR ALL USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, nama)
  VALUES (NEW.id, NEW.email, SPLIT_PART(NEW.email, '@', 1));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
