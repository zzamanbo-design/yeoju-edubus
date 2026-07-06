-- ─────────────────────────────────────────────────────
-- 1. bus_requests 테이블에 관련 공문번호 컬럼 추가
-- ─────────────────────────────────────────────────────
ALTER TABLE bus_requests
ADD COLUMN official_doc_number TEXT;
