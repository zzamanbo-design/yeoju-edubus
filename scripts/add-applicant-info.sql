-- ─────────────────────────────────────────────────────
-- 1. bus_requests 테이블에 새 컬럼 추가
-- ─────────────────────────────────────────────────────
ALTER TABLE bus_requests
ADD COLUMN applicant_name VARCHAR(50),
ADD COLUMN applicant_phone VARCHAR(20),
ADD COLUMN usage_purpose VARCHAR(200);

-- ─────────────────────────────────────────────────────
-- 2. 기존 데이터 호환성 처리 (Optional)
-- 만약 기존에 입력된 데이터가 있다면, 필수값이 아니기 때문에 null로 남습니다.
-- 화면 오류를 막기 위해 일괄 기본값을 넣으려면 주석을 해제하고 실행하세요.
-- ─────────────────────────────────────────────────────
-- UPDATE bus_requests
-- SET applicant_name = '미상', applicant_phone = '미입력', usage_purpose = '내용 없음'
-- WHERE applicant_name IS NULL;

-- ─────────────────────────────────────────────────────
-- 3. API 연동을 위해 스키마 캐시 갱신
-- ─────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
