-- ════════════════════════════════════════════════════
-- 여주 에듀버스 - 비밀번호 강제 변경 기능 마이그레이션
-- 실행 위치: Supabase Dashboard > SQL Editor
-- 주의: init-auth.sql 실행 이후에 실행하세요.
-- ════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────
-- 1. password_changed 컬럼 추가
--    false = 임시 비밀번호 사용 중 (최초 로그인 강제 변경 필요)
--    true  = 사용자가 직접 비밀번호를 변경한 상태
-- ─────────────────────────────────────────────────────
ALTER TABLE school_accounts
  ADD COLUMN IF NOT EXISTS password_changed BOOLEAN NOT NULL DEFAULT FALSE;

-- ─────────────────────────────────────────────────────
-- 2. verify_login RPC 업데이트 (password_changed 반환 추가)
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
    'role', sa.role,
    'password_changed', sa.password_changed
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
-- 3. 비밀번호 변경 RPC 함수 (SECURITY DEFINER)
--    새 비밀번호를 pgcrypto로 해싱하고 password_changed를 true로 설정
-- ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION change_password(
  p_account_id INTEGER,
  p_new_password TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE school_accounts
  SET
    password_hash = crypt(p_new_password, gen_salt('bf')),
    password_changed = TRUE
  WHERE id = p_account_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
