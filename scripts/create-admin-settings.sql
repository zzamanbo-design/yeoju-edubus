-- 관리자 설정(총 배정 예산 등)을 저장하기 위한 테이블 생성
CREATE TABLE IF NOT EXISTS admin_settings (
  id INT PRIMARY KEY,
  total_budget BIGINT NOT NULL DEFAULT 50000000,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 초기 설정값 삽입 (id가 1인 단일 로우 유지)
INSERT INTO admin_settings (id, total_budget)
VALUES (1, 50000000)
ON CONFLICT (id) DO NOTHING;

-- RLS 정책 설정 
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on admin_settings"
  ON admin_settings FOR SELECT USING (true);

CREATE POLICY "Allow public update on admin_settings"
  ON admin_settings FOR UPDATE USING (true);
