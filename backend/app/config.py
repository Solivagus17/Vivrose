import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    DATABASE_URL = os.getenv('DATABASE_URL') or 'sqlite:///vivrose.db'
    SUPABASE_URL = os.getenv('SUPABASE_URL', '')
    # New publishable / secret keys (sb_publishable_*, sb_secret_*) replace the
    # legacy JWT-based anon / service_role keys, which Supabase is deprecating.
    SUPABASE_SECRET_KEY = os.getenv('SUPABASE_SECRET_KEY') or os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')
    SUPABASE_PUBLISHABLE_KEY = os.getenv('SUPABASE_PUBLISHABLE_KEY') or os.getenv('SUPABASE_ANON_KEY', '')
    SUPABASE_BUCKET = os.getenv('SUPABASE_BUCKET', 'medical-reports')
    GOOGLE_APPLICATION_CREDENTIALS = os.getenv('GOOGLE_APPLICATION_CREDENTIALS', '')
    # Dev only: set to '1' to accept any bearer token instead of verifying
    # with Firebase. MUST be '0' in production.
    FIREBASE_ALLOW_UNVERIFIED = os.getenv('FIREBASE_ALLOW_UNVERIFIED', '0')
    GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')

