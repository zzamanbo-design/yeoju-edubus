-- ─────────────────────────────────────────────────────
-- 1. bus_requests 테이블에 출발시간, 복귀출발시간 컬럼 추가
-- ─────────────────────────────────────────────────────
ALTER TABLE bus_requests
ADD COLUMN departure_time TEXT,
ADD COLUMN return_time TEXT;
