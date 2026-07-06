/**
 * 여주 에듀버스 - Supabase 데이터베이스 초기 세팅 스크립트 v2
 * 
 * service_role 키를 사용하여 PostgreSQL에 직접 연결 후:
 * 1. schools 테이블 생성 + 45개 학교 시드 데이터 삽입
 * 2. bus_requests 테이블 생성 (schools 테이블과 FK 관계)
 * 3. RLS 정책 및 트리거 설정
 * 
 * 실행: node scripts/seed-database.js
 */

const { createClient } = require('@supabase/supabase-js');
const { Client: PgClient } = require('pg');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// ─── 환경 변수 로드 ───────────────────────────────────────
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...vals] = trimmed.split('=');
    process.env[key.trim()] = vals.join('=').trim();
  }
});

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.');
  process.exit(1);
}

// 프로젝트 ref 추출 (URL에서)
const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');
console.log(`📌 Supabase 프로젝트: ${projectRef}`);

// Supabase 클라이언트 (service_role 키로 생성 - RLS 우회)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// ─── DDL SQL 정의 ──────────────────────────────────────────
const DDL_SQL = `
-- 1. schools 테이블 생성
CREATE TABLE IF NOT EXISTS schools (
  id              SERIAL PRIMARY KEY,
  school_name     VARCHAR(100) NOT NULL UNIQUE,
  school_level    VARCHAR(10)  NOT NULL CHECK (school_level IN ('초', '중', '고')),
  establishment   VARCHAR(10)  NOT NULL CHECK (establishment IN ('공립', '사립', '국립')),
  region          VARCHAR(20)  NOT NULL DEFAULT '여주',
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 2. bus_requests 테이블 생성
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

-- 3. updated_at 자동 갱신 트리거
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

-- 4. RLS 활성화
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_requests ENABLE ROW LEVEL SECURITY;

-- 5. RLS 정책 (이미 존재하면 무시)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'schools' AND policyname = 'Allow public read access on schools') THEN
    CREATE POLICY "Allow public read access on schools" ON schools FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'schools' AND policyname = 'Allow public insert on schools') THEN
    CREATE POLICY "Allow public insert on schools" ON schools FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'schools' AND policyname = 'Allow public update on schools') THEN
    CREATE POLICY "Allow public update on schools" ON schools FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'schools' AND policyname = 'Allow public delete on schools') THEN
    CREATE POLICY "Allow public delete on schools" ON schools FOR DELETE USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bus_requests' AND policyname = 'Allow public read access on bus_requests') THEN
    CREATE POLICY "Allow public read access on bus_requests" ON bus_requests FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bus_requests' AND policyname = 'Allow public insert on bus_requests') THEN
    CREATE POLICY "Allow public insert on bus_requests" ON bus_requests FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bus_requests' AND policyname = 'Allow public update on bus_requests') THEN
    CREATE POLICY "Allow public update on bus_requests" ON bus_requests FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bus_requests' AND policyname = 'Allow public delete on bus_requests') THEN
    CREATE POLICY "Allow public delete on bus_requests" ON bus_requests FOR DELETE USING (true);
  END IF;
END
$$;
`;

// ─── 엑셀 데이터 읽기 ────────────────────────────────────────
function readSchoolData() {
  console.log('\n📖 엑셀 파일에서 학교 데이터 읽는 중...');
  const filePath = path.join(__dirname, '..', '여주 학교 명단.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const schools = [];
  for (const row of rawData) {
    if (row && typeof row[0] === 'number') {
      schools.push({
        school_name: row[3],
        school_level: row[1],
        establishment: row[2],
        region: '여주',
      });
    }
  }
  console.log(`  📊 총 ${schools.length}개 학교 데이터 추출 완료`);
  return schools;
}

// ─── 방법 1: Supabase Pooler (JWT 인증)를 통한 직접 PostgreSQL 연결 ──
async function tryPoolerConnection(schools) {
  // Supabase Pooler는 JWT(service_role key)를 비밀번호로 사용 가능
  // 가능한 리전 목록 (한국 사용자이므로 ap-northeast-2 우선)
  const regions = [
    'ap-northeast-2',  // Seoul
    'ap-southeast-1',  // Singapore
    'ap-northeast-1',  // Tokyo
    'us-east-1',       // N. Virginia
    'eu-west-1',       // Ireland
    'us-west-1',       // N. California
  ];

  for (const region of regions) {
    // Session mode (port 5432) - DDL 지원
    const connectionString = `postgresql://postgres.${projectRef}:${SUPABASE_SERVICE_ROLE_KEY}@aws-0-${region}.pooler.supabase.com:5432/postgres`;
    
    console.log(`\n  🔗 Pooler 연결 시도 (리전: ${region})...`);
    
    const client = new PgClient({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });

    try {
      await client.connect();
      console.log(`  ✅ PostgreSQL 연결 성공! (리전: ${region})`);
      
      // DDL 실행
      console.log('\n📋 [1/2] 테이블 생성 중...');
      await client.query(DDL_SQL);
      console.log('  ✅ schools 테이블 생성 완료');
      console.log('  ✅ bus_requests 테이블 생성 완료');
      console.log('  ✅ RLS 정책 설정 완료');
      console.log('  ✅ updated_at 트리거 설정 완료');

      // 시드 데이터 삽입
      console.log('\n🌱 [2/2] 학교 시드 데이터 삽입 중...');
      
      // 기존 데이터 확인 및 삭제
      const { rows: existing } = await client.query('SELECT COUNT(*) as cnt FROM schools');
      if (parseInt(existing[0].cnt) > 0) {
        console.log(`  ⚠️  기존 ${existing[0].cnt}개 데이터 삭제 후 재삽입...`);
        await client.query('DELETE FROM schools');
      }

      // 배치 INSERT
      const values = schools.map((s, i) => {
        const offset = i * 4;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`;
      }).join(', ');
      
      const params = schools.flatMap(s => [s.school_name, s.school_level, s.establishment, s.region]);
      
      await client.query(
        `INSERT INTO schools (school_name, school_level, establishment, region) VALUES ${values}`,
        params
      );

      // 결과 확인
      const { rows: result } = await client.query(
        `SELECT school_level, COUNT(*) as cnt FROM schools GROUP BY school_level ORDER BY school_level`
      );
      
      console.log(`\n  ✅ ${schools.length}개 학교 데이터 삽입 완료!\n`);
      console.log('  📊 학교급별 현황:');
      for (const row of result) {
        const label = row.school_level === '초' ? '초등학교' : row.school_level === '중' ? '중학교' : '고등학교';
        console.log(`     ${label}: ${row.cnt}개`);
      }
      console.log(`     합계:     ${schools.length}개`);

      // bus_requests 테이블 확인
      const { rows: busTable } = await client.query(
        `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'bus_requests' ORDER BY ordinal_position`
      );
      console.log(`\n  📋 bus_requests 테이블 컬럼 (${busTable.length}개):`);
      for (const col of busTable) {
        console.log(`     - ${col.column_name} (${col.data_type})`);
      }

      await client.end();
      return true;
    } catch (error) {
      try { await client.end(); } catch (_) {}
      console.log(`  ❌ 실패: ${error.message.substring(0, 100)}`);
      continue;
    }
  }
  return false;
}

// ─── 방법 2: 직접 DB 호스트 연결 시도 ──────────────────────
async function tryDirectConnection(schools) {
  console.log(`\n  🔗 직접 DB 연결 시도 (db.${projectRef}.supabase.co)...`);
  
  const client = new PgClient({
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: SUPABASE_SERVICE_ROLE_KEY,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();
    console.log('  ✅ 직접 DB 연결 성공!');

    // DDL 실행
    console.log('\n📋 [1/2] 테이블 생성 중...');
    await client.query(DDL_SQL);
    console.log('  ✅ 테이블 및 정책 생성 완료');

    // 시드 데이터
    console.log('\n🌱 [2/2] 학교 시드 데이터 삽입 중...');
    const { rows: existing } = await client.query('SELECT COUNT(*) as cnt FROM schools');
    if (parseInt(existing[0].cnt) > 0) {
      console.log(`  ⚠️  기존 ${existing[0].cnt}개 데이터 삭제 후 재삽입...`);
      await client.query('DELETE FROM schools');
    }

    const values = schools.map((s, i) => {
      const offset = i * 4;
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`;
    }).join(', ');
    const params = schools.flatMap(s => [s.school_name, s.school_level, s.establishment, s.region]);
    
    await client.query(
      `INSERT INTO schools (school_name, school_level, establishment, region) VALUES ${values}`,
      params
    );

    const { rows: result } = await client.query(
      `SELECT school_level, COUNT(*) as cnt FROM schools GROUP BY school_level ORDER BY school_level`
    );
    console.log(`\n  ✅ ${schools.length}개 학교 데이터 삽입 완료!\n`);
    console.log('  📊 학교급별 현황:');
    for (const row of result) {
      const label = row.school_level === '초' ? '초등학교' : row.school_level === '중' ? '중학교' : '고등학교';
      console.log(`     ${label}: ${row.cnt}개`);
    }
    console.log(`     합계:     ${schools.length}개`);

    await client.end();
    return true;
  } catch (error) {
    try { await client.end(); } catch (_) {}
    console.log(`  ❌ 실패: ${error.message.substring(0, 100)}`);
    return false;
  }
}

// ─── 방법 3: Supabase REST API (service_role) 로 시드 데이터만 삽입 ──
async function trySupabaseClient(schools) {
  console.log('\n  🔗 Supabase REST API로 시드 데이터 삽입 시도...');
  
  const { data: existing, error: checkError } = await supabase
    .from('schools')
    .select('id', { count: 'exact' });

  if (checkError) {
    console.log(`  ❌ schools 테이블 접근 실패: ${checkError.message}`);
    return false;
  }

  if (existing && existing.length > 0) {
    console.log(`  ⚠️  기존 ${existing.length}개 데이터 삭제 후 재삽입...`);
    await supabase.from('schools').delete().gte('id', 0);
  }

  const { data: inserted, error: insertError } = await supabase
    .from('schools')
    .insert(schools)
    .select();

  if (insertError) {
    console.log(`  ❌ 삽입 실패: ${insertError.message}`);
    return false;
  }

  console.log(`\n  ✅ ${inserted.length}개 학교 데이터 삽입 완료!\n`);
  const summary = {
    초등학교: inserted.filter(s => s.school_level === '초').length,
    중학교: inserted.filter(s => s.school_level === '중').length,
    고등학교: inserted.filter(s => s.school_level === '고').length,
  };
  console.log('  📊 학교급별 현황:');
  console.log(`     초등학교: ${summary.초등학교}개`);
  console.log(`     중학교:   ${summary.중학교}개`);
  console.log(`     고등학교: ${summary.고등학교}개`);
  console.log(`     합계:     ${inserted.length}개`);
  return true;
}

// ─── 메인 실행 ──────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   여주 에듀버스 - Supabase DB 초기 세팅 (v2)          ║');
  console.log('╚══════════════════════════════════════════════════════╝');

  const schools = readSchoolData();

  // 방법 1: Supabase Pooler (JWT 인증) 연결
  console.log('\n━━━ 방법 1: Supabase Pooler 연결 ━━━');
  let success = await tryPoolerConnection(schools);

  if (!success) {
    // 방법 2: 직접 DB 호스트 연결
    console.log('\n━━━ 방법 2: 직접 DB 호스트 연결 ━━━');
    success = await tryDirectConnection(schools);
  }

  if (!success) {
    // 방법 3: Supabase REST API (테이블이 이미 존재할 경우)
    console.log('\n━━━ 방법 3: Supabase REST API 시드 데이터 삽입 ━━━');
    success = await trySupabaseClient(schools);
  }

  console.log('\n══════════════════════════════════════════════════════');
  if (success) {
    console.log('🎉 데이터베이스 초기 세팅이 성공적으로 완료되었습니다!');
  } else {
    console.log('⚠️  자동 세팅에 실패했습니다.');
    console.log('   Supabase SQL Editor에서 scripts/init-database.sql 을 실행해 주세요.');
  }
  console.log('══════════════════════════════════════════════════════\n');
}

main().catch(console.error);
