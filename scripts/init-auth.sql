-- ════════════════════════════════════════════════════
-- 여주 에듀버스 - 인증 시스템 DB 세팅
-- 실행 위치: Supabase Dashboard > SQL Editor
-- ════════════════════════════════════════════════════

-- pgcrypto 확장 활성화 (비밀번호 해싱용)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─────────────────────────────────────────────────────
-- 1. school_accounts 테이블 생성
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS school_accounts (
  id              SERIAL PRIMARY KEY,
  school_id       INTEGER REFERENCES schools(id) ON DELETE CASCADE,
  login_id        VARCHAR(100) NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  role            VARCHAR(20) NOT NULL DEFAULT 'school'
                    CHECK (role IN ('school', 'admin')),
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────
-- 2. RLS 설정 (password_hash 보호)
-- ─────────────────────────────────────────────────────
ALTER TABLE school_accounts ENABLE ROW LEVEL SECURITY;

-- service_role만 접근 허용 (RPC 함수가 SECURITY DEFINER로 우회)
CREATE POLICY "Deny all direct access to school_accounts"
  ON school_accounts FOR ALL USING (false);

-- ─────────────────────────────────────────────────────
-- 3. 로그인 검증 RPC 함수 (SECURITY DEFINER)
-- ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION verify_login(p_login_id TEXT, p_password TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'account_id', sa.id,
    'school_id', sa.school_id,
    'school_name', COALESCE(s.school_name, sa.login_id),
    'school_level', s.school_level,
    'role', sa.role
  ) INTO result
  FROM school_accounts sa
  LEFT JOIN schools s ON sa.school_id = s.id
  WHERE sa.login_id = p_login_id
  AND sa.password_hash = crypt(p_password, sa.password_hash);

  IF result IS NOT NULL THEN
    UPDATE school_accounts SET last_login_at = NOW() WHERE login_id = p_login_id;
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────
-- 4. 45개 학교 계정 시드 (비밀번호: yeoju2026!)
-- ─────────────────────────────────────────────────────
INSERT INTO school_accounts (school_id, login_id, password_hash, role)
SELECT id, school_name, crypt('yeoju2026!', gen_salt('bf')), 'school'
FROM schools
ON CONFLICT (login_id) DO NOTHING;

-- ─────────────────────────────────────────────────────
-- 5. 관리자 계정 (ID: admin / 비밀번호: admin2026!)
-- ─────────────────────────────────────────────────────
INSERT INTO school_accounts (school_id, login_id, password_hash, role)
VALUES (NULL, 'admin', crypt('admin2026!', gen_salt('bf')), 'admin')
ON CONFLICT (login_id) DO NOTHING;
