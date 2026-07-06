-- ════════════════════════════════════════════════════
-- 여주 에듀버스 - Supabase 데이터베이스 초기 세팅 SQL
-- 실행 위치: Supabase Dashboard > SQL Editor
-- ════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────
-- 1. schools 테이블 생성
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schools (
  id              SERIAL PRIMARY KEY,
  school_name     VARCHAR(100) NOT NULL UNIQUE,
  school_level    VARCHAR(10)  NOT NULL CHECK (school_level IN ('초', '중', '고')),
  establishment   VARCHAR(10)  NOT NULL CHECK (establishment IN ('공립', '사립', '국립')),
  region          VARCHAR(20)  NOT NULL DEFAULT '여주',
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────
-- 2. bus_requests 테이블 생성 (schools FK 참조)
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bus_requests (
  id                  SERIAL PRIMARY KEY,
  request_date        DATE         NOT NULL DEFAULT CURRENT_DATE,
  school_id           INTEGER      NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  departure           VARCHAR(200) NOT NULL,
  destination         VARCHAR(200) NOT NULL,
  teacher_count       INTEGER      NOT NULL DEFAULT 0 CHECK (teacher_count >= 0),
  student_count       INTEGER      NOT NULL DEFAULT 0 CHECK (student_count >= 0),
  bus_type            VARCHAR(10)  NOT NULL CHECK (bus_type IN ('중형', '대형')),
  status              VARCHAR(20)  NOT NULL DEFAULT '신청대기' 
                        CHECK (status IN ('신청대기', '승인', '매칭완료', '운행완료', '정산완료', '반려')),
  notes               TEXT,
  trip_date           DATE,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────
-- 3. updated_at 자동 갱신 트리거
-- ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON bus_requests;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON bus_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────
-- 4. Row Level Security(RLS) 활성화 및 정책 설정
-- ─────────────────────────────────────────────────────
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_requests ENABLE ROW LEVEL SECURITY;

-- schools 테이블 정책
CREATE POLICY "Allow public read access on schools"
  ON schools FOR SELECT USING (true);
CREATE POLICY "Allow public insert on schools"
  ON schools FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on schools"
  ON schools FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on schools"
  ON schools FOR DELETE USING (true);

-- bus_requests 테이블 정책
CREATE POLICY "Allow public read access on bus_requests"
  ON bus_requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert on bus_requests"
  ON bus_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on bus_requests"
  ON bus_requests FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on bus_requests"
  ON bus_requests FOR DELETE USING (true);

-- ─────────────────────────────────────────────────────
-- 5. 시드 데이터 삽입 (여주 관내 45개 학교)
-- ─────────────────────────────────────────────────────
INSERT INTO schools (school_name, school_level, establishment, region) VALUES
  -- 초등학교 (23개)
  ('가남초등학교', '초', '공립', '여주'),
  ('강천초등학교', '초', '공립', '여주'),
  ('금당초등학교', '초', '공립', '여주'),
  ('능북초등학교', '초', '공립', '여주'),
  ('능서초등학교', '초', '공립', '여주'),
  ('대신초등학교', '초', '공립', '여주'),
  ('매류초등학교', '초', '공립', '여주'),
  ('문장초등학교', '초', '공립', '여주'),
  ('북내초등학교', '초', '공립', '여주'),
  ('상품초등학교', '초', '공립', '여주'),
  ('세종초등학교', '초', '공립', '여주'),
  ('송삼초등학교', '초', '공립', '여주'),
  ('송촌초등학교', '초', '공립', '여주'),
  ('여주초등학교', '초', '공립', '여주'),
  ('여흥초등학교', '초', '공립', '여주'),
  ('연라초등학교', '초', '공립', '여주'),
  ('오산초등학교', '초', '공립', '여주'),
  ('오학초등학교', '초', '공립', '여주'),
  ('이포초등학교', '초', '공립', '여주'),
  ('점동초등학교', '초', '공립', '여주'),
  ('점봉초등학교', '초', '공립', '여주'),
  ('천남초등학교', '초', '공립', '여주'),
  ('흥천초등학교', '초', '공립', '여주'),
  -- 중학교 (13개)
  ('강천중학교', '중', '공립', '여주'),
  ('대신중학교', '중', '사립', '여주'),
  ('상품중학교', '중', '공립', '여주'),
  ('세정중학교', '중', '사립', '여주'),
  ('세종중학교', '중', '공립', '여주'),
  ('여강중학교', '중', '사립', '여주'),
  ('여흥중학교', '중', '공립', '여주'),
  ('여주제일중학교', '중', '사립', '여주'),
  ('여주중학교', '중', '공립', '여주'),
  ('이포중학교', '중', '공립', '여주'),
  ('점동중학교', '중', '공립', '여주'),
  ('창명여자중학교', '중', '사립', '여주'),
  ('흥천중학교', '중', '공립', '여주'),
  -- 고등학교 (9개)
  ('경기관광고등학교', '고', '사립', '여주'),
  ('대신고등학교', '고', '사립', '여주'),
  ('세종고등학교', '고', '공립', '여주'),
  ('여강고등학교', '고', '사립', '여주'),
  ('여주고등학교', '고', '사립', '여주'),
  ('여주자영농업고등학교', '고', '공립', '여주'),
  ('여주제일고등학교', '고', '사립', '여주'),
  ('이포고등학교', '고', '공립', '여주'),
  ('점동고등학교', '고', '공립', '여주');
