-- bus_requests 테이블에 개인정보 동의 여부 저장 컬럼 추가
ALTER TABLE bus_requests ADD COLUMN IF NOT EXISTS privacy_consent BOOLEAN NOT NULL DEFAULT TRUE;
