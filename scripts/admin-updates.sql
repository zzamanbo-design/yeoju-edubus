-- 1. 제약 조건 수정 (기타 카테고리 허용)
ALTER TABLE schools DROP CONSTRAINT IF EXISTS schools_school_level_check;
ALTER TABLE schools ADD CONSTRAINT schools_school_level_check CHECK (school_level IN ('초', '중', '고', '기타'));

-- 2. 여주교육지원청 학교 목록에 추가 (establishment 추가)
INSERT INTO schools (school_name, school_level, establishment, region)
VALUES ('여주교육지원청', '기타', '공립', '여주')
ON CONFLICT DO NOTHING;

-- 3. 여주교육지원청 계정 추가 (비밀번호는 기본값인 yeoju2026!)
INSERT INTO school_accounts (school_id, login_id, password_hash, role)
SELECT id, '여주교육지원청', crypt('yeoju2026!', gen_salt('bf')), 'school'
FROM schools WHERE school_name = '여주교육지원청'
ON CONFLICT (login_id) DO NOTHING;

-- 4. 관리자용 학교 비밀번호 초기화 RPC 함수 추가
CREATE OR REPLACE FUNCTION admin_reset_school_password(p_school_id INTEGER)
RETURNS JSON AS $$
DECLARE
  v_account_id INTEGER;
BEGIN
  UPDATE school_accounts
  SET password_hash = crypt('yeoju2026!', gen_salt('bf')),
      password_changed = false
  WHERE school_id = p_school_id
  RETURNING id INTO v_account_id;
  
  IF v_account_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', '해당 학교의 계정을 찾을 수 없습니다.');
  END IF;
  
  RETURN json_build_object('success', true, 'message', '비밀번호가 초기화되었습니다.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
