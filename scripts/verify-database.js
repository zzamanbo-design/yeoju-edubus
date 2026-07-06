/**
 * 여주 에듀버스 - Supabase DB 검증 스크립트
 * schools 테이블과 bus_requests 테이블이 정상 생성되었는지,
 * 시드 데이터 45건이 올바르게 삽입되었는지 검증합니다.
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// 환경 변수 로드
const envPath = path.join(__dirname, '..', '.env.local');
fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...vals] = trimmed.split('=');
    process.env[key.trim()] = vals.join('=').trim();
  }
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function verify() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   여주 에듀버스 - Supabase DB 검증                ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  let allPassed = true;

  // ── 1. schools 테이블 검증 ──
  console.log('📋 [1/3] schools 테이블 검증...');
  const { data: schools, error: schoolsErr } = await supabase
    .from('schools')
    .select('*')
    .order('id');

  if (schoolsErr) {
    console.log(`  ❌ schools 테이블 조회 실패: ${schoolsErr.message}`);
    allPassed = false;
  } else {
    console.log(`  ✅ schools 테이블 존재 확인`);
    console.log(`  ✅ 총 ${schools.length}개 레코드 확인`);

    const elementary = schools.filter(s => s.school_level === '초');
    const middle = schools.filter(s => s.school_level === '중');
    const high = schools.filter(s => s.school_level === '고');

    console.log(`\n  📊 학교급별 현황:`);
    console.log(`     초등학교: ${elementary.length}개 ${elementary.length === 23 ? '✅' : '❌ (기대: 23)'}`);
    console.log(`     중학교:   ${middle.length}개 ${middle.length === 13 ? '✅' : '❌ (기대: 13)'}`);
    console.log(`     고등학교: ${high.length}개 ${high.length === 9 ? '✅' : '❌ (기대: 9)'}`);
    console.log(`     합계:     ${schools.length}개 ${schools.length === 45 ? '✅' : '❌ (기대: 45)'}`);

    if (schools.length !== 45) allPassed = false;

    // 설립구분 현황
    const pub = schools.filter(s => s.establishment === '공립').length;
    const priv = schools.filter(s => s.establishment === '사립').length;
    console.log(`\n  📊 설립구분별 현황:`);
    console.log(`     공립: ${pub}개`);
    console.log(`     사립: ${priv}개`);

    // 샘플 데이터 출력
    console.log(`\n  📝 샘플 데이터 (처음 3개):`);
    for (const s of schools.slice(0, 3)) {
      console.log(`     [ID:${s.id}] ${s.school_name} (${s.school_level}, ${s.establishment})`);
    }
    console.log(`  📝 샘플 데이터 (마지막 3개):`);
    for (const s of schools.slice(-3)) {
      console.log(`     [ID:${s.id}] ${s.school_name} (${s.school_level}, ${s.establishment})`);
    }
  }

  // ── 2. bus_requests 테이블 검증 ──
  console.log('\n📋 [2/3] bus_requests 테이블 검증...');
  const { data: busReqs, error: busErr } = await supabase
    .from('bus_requests')
    .select('*')
    .limit(1);

  if (busErr) {
    console.log(`  ❌ bus_requests 테이블 조회 실패: ${busErr.message}`);
    allPassed = false;
  } else {
    console.log(`  ✅ bus_requests 테이블 존재 확인`);
    console.log(`  ✅ 현재 ${busReqs.length}개 레코드 (빈 테이블 정상)`);
  }

  // ── 3. RLS 정책 검증 (anon key로 읽기 테스트) ──
  console.log('\n📋 [3/3] RLS 정책 검증 (anon key로 읽기)...');
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const { data: anonSchools, error: anonErr } = await anonClient
    .from('schools')
    .select('id, school_name')
    .limit(3);

  if (anonErr) {
    console.log(`  ❌ anon key 읽기 실패: ${anonErr.message}`);
    console.log(`  💡 RLS 정책이 제대로 설정되지 않았을 수 있습니다.`);
    allPassed = false;
  } else {
    console.log(`  ✅ anon key로 schools 테이블 읽기 성공 (${anonSchools.length}건 샘플)`);
  }

  // ── 결과 ──
  console.log('\n══════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('🎉 모든 검증을 통과했습니다! DB 초기 세팅이 완벽하게 완료되었습니다.');
  } else {
    console.log('⚠️  일부 검증에 실패했습니다. 위 로그를 확인해 주세요.');
  }
  console.log('══════════════════════════════════════════════════════\n');
}

verify().catch(console.error);
