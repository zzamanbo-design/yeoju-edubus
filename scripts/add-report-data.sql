-- 완수검사조서 데이터를 저장하기 위한 JSONB 컬럼 추가
ALTER TABLE bus_requests 
ADD COLUMN IF NOT EXISTS report_data JSONB;
