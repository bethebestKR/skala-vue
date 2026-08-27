<script setup>
import { useRouter } from 'vue-router'
import BaseDashboardCard from '../components/exercise/BaseDashboardCard.vue'

const router = useRouter()

// 실습 8단계 아카이브 — 같은 '날씨 앱'을 단계별로 발전시킨 기록
const LESSONS = [
  {
    no: '01',
    title: '날씨 Mockup',
    subtitle: 'Vue 기본 문법',
    desc: 'Mock 배열을 v-for로 카드에 렌더링하고, 25도 기준으로 v-if 뱃지를 분기.',
    concepts: ['v-for', 'v-if', '데이터 바인딩', '@click.stop'],
  },
  {
    no: '02',
    title: '날씨 컴포지션',
    subtitle: 'Composition API',
    desc: 'ref·computed·watch·watchEffect로 상태를 구성. 검색 카운트·이스터에그 등 본인 기능 추가.',
    concepts: ['ref', 'computed', 'watch', 'watchEffect', '🥚 이스터에그'],
  },
  {
    no: '03',
    title: '날씨 컴포넌트',
    subtitle: '컴포넌트 분리',
    desc: '검색바·카드·공통 패널로 역할을 분리. props로 내려주고 emit으로 올려받기.',
    concepts: ['props', 'emit', 'slot', '재사용성'],
  },
  {
    no: '04',
    title: 'Router 활용',
    subtitle: '페이지 전환과 동적 매칭',
    desc: 'RouterLink/RouterView, 동적 라우트 /weather/:cityId, Lazy Loading, 404 처리.',
    concepts: ['vue-router', '동적 라우트', 'Lazy Loading'],
  },
  {
    no: '05',
    title: 'Store 적용',
    subtitle: 'Pinia 전역 상태',
    desc: '즐겨찾기(cityStore)·단위(configStore)를 전역 관리. 여러 컴포넌트가 상태 공유.',
    concepts: ['Pinia', 'storeToRefs', '전역 상태'],
    link: '/dashboard',
  },
  {
    no: '06',
    title: '데이터 연동',
    subtitle: 'Axios + OpenWeatherMap',
    desc: 'axios.create 인스턴스, 응답→앱 형식 매핑, Geocoding으로 세계 도시 실시간 검색.',
    concepts: ['axios', 'API 매핑', 'Geocoding', '.env'],
    link: '/dashboard',
  },
  {
    no: '07',
    title: 'Element Plus',
    subtitle: 'UI 라이브러리 적용',
    desc: '외부 UI 라이브러리를 전역 등록하고 카드·입력·태그·스켈레톤 등을 폭넓게 활용.',
    concepts: ['Element Plus', 'el-card', 'el-input', '하늘색 테마'],
    link: '/dashboard',
  },
  {
    no: '08',
    title: '과제 확장',
    subtitle: '3D 지구본 + Open-Meteo',
    desc: 'globe.gl 지구본에서 아무 지점이나 클릭 → 실시간 날씨. 상세엔 Open-Meteo 3일 예보.',
    concepts: ['globe.gl', 'onGlobeClick', 'Open-Meteo', '3일 예보'],
    link: '/',
  },
]

function goLink(link) {
  if (link) router.push(link)
}
</script>

<template>
  <div class="wrap">
    <BaseDashboardCard title="🗂️ 실습 아카이브 (01 → 08)">
      <p class="lead">같은 "날씨 앱" 하나를 8단계에 걸쳐 점진적으로 발전시킨 기록입니다.</p>

      <div class="grid">
        <el-card
          v-for="lesson in LESSONS"
          :key="lesson.no"
          class="lesson"
          :class="{ clickable: lesson.link }"
          shadow="hover"
          body-style="padding: 18px"
          @click="goLink(lesson.link)"
        >
          <div class="lesson-head">
            <span class="lesson-no">{{ lesson.no }}</span>
            <div>
              <p class="lesson-title">{{ lesson.title }}</p>
              <p class="lesson-subtitle">{{ lesson.subtitle }}</p>
            </div>
          </div>

          <p class="lesson-desc">{{ lesson.desc }}</p>

          <div class="lesson-tags">
            <el-tag
              v-for="c in lesson.concepts"
              :key="c"
              size="small"
              type="info"
              effect="plain"
              round
            >
              {{ c }}
            </el-tag>
          </div>

          <p v-if="lesson.link" class="lesson-link">관련 화면 보기 →</p>
        </el-card>
      </div>
    </BaseDashboardCard>
  </div>
</template>

<style scoped>
.wrap {
  max-width: 1100px;
  margin: 0 auto;
}
.lead {
  margin: 0 0 16px;
  font-size: 14px;
  color: #64748b;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 14px;
}
.lesson {
  height: 100%;
}
.lesson.clickable {
  cursor: pointer;
}
.lesson-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 12px;
}
.lesson-no {
  font-size: 34px;
  font-weight: 800;
  color: #2f80ed;
  line-height: 1;
  letter-spacing: -1px;
}
.lesson-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
}
.lesson-subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  color: #94a3b8;
}
.lesson-desc {
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 1.6;
  color: #475569;
  min-height: 42px;
}
.lesson-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.lesson-link {
  margin: 12px 0 0;
  font-size: 13px;
  font-weight: 600;
  color: #2f80ed;
}
</style>
