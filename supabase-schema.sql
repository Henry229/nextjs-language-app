-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table (대분류 폴더)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subcategories table (중분류 폴더)
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subcategory_id UUID NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
  native_text TEXT NOT NULL,
  foreign_text TEXT NOT NULL,
  pronunciation TEXT,
  notes TEXT,
  difficulty_level SMALLINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  stage SMALLINT NOT NULL DEFAULT 1,
  status VARCHAR(50) NOT NULL DEFAULT 'not_started',
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  next_review_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, flashcard_id)
);

-- Profiles table for additional user data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  native_language VARCHAR(50) DEFAULT 'ko',
  learning_language VARCHAR(50) DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Setup Row Level Security (RLS)
-- Categories: everyone can view, only authenticated users can create/update/delete
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" 
  ON categories FOR SELECT USING (true);
  
CREATE POLICY "Categories can be created by authenticated users" 
  ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  
CREATE POLICY "Categories can be updated by authenticated users" 
  ON categories FOR UPDATE USING (auth.role() = 'authenticated');
  
CREATE POLICY "Categories can be deleted by authenticated users" 
  ON categories FOR DELETE USING (auth.role() = 'authenticated');

-- Subcategories: similar to categories
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subcategories are viewable by everyone" 
  ON subcategories FOR SELECT USING (true);
  
CREATE POLICY "Subcategories can be created by authenticated users" 
  ON subcategories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  
CREATE POLICY "Subcategories can be updated by authenticated users" 
  ON subcategories FOR UPDATE USING (auth.role() = 'authenticated');
  
CREATE POLICY "Subcategories can be deleted by authenticated users" 
  ON subcategories FOR DELETE USING (auth.role() = 'authenticated');

-- Flashcards: similar to categories
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Flashcards are viewable by everyone" 
  ON flashcards FOR SELECT USING (true);
  
CREATE POLICY "Flashcards can be created by authenticated users" 
  ON flashcards FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  
CREATE POLICY "Flashcards can be updated by authenticated users" 
  ON flashcards FOR UPDATE USING (auth.role() = 'authenticated');
  
CREATE POLICY "Flashcards can be deleted by authenticated users" 
  ON flashcards FOR DELETE USING (auth.role() = 'authenticated');

-- User Progress: users can only see and modify their own progress
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own progress" 
  ON user_progress FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can create their own progress" 
  ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own progress" 
  ON user_progress FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete their own progress" 
  ON user_progress FOR DELETE USING (auth.uid() = user_id);

-- Profiles: users can only see their own profile and update it
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can create their own profile" 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
  
CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to create a profile entry when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
