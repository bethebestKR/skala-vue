<script setup>
import { useRouter } from 'vue-router'
import BaseDashboardCard from '../components/exercise/BaseDashboardCard.vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="wrap">
    <BaseDashboardCard title="ℹ️ 서비스 소개">
      <p class="lead">
        본 앱은 Vue 3 및 Vue Router 4 기반으로 제작된 실습용 기상 관측 대시보드 시스템입니다.
      </p>
      <ul class="feature-list">
        <li><code>components/exercise/</code> 폴더 내부의 독립 부품 컴포넌트로 화면을 구성합니다.</li>
        <li>클라이언트 사이드 라우팅을 통한 새로고침 없는 화면 전환을 제공합니다.</li>
        <li>URL 동적 경로 파싱을 활용한 실시간 상세 상태 조회를 지원합니다.</li>
      </ul>

      <button class="home-btn" @click="goHome">대시보드 홈으로 이동</button>
    </BaseDashboardCard>
  </div>
</template>

<style scoped>
.wrap {
  max-width: 1100px;
  margin: 0 auto;
}
.lead {
  margin: 0 0 12px;
  font-size: 14px;
  color: #334155;
}
.feature-list {
  margin: 0 0 16px;
  padding-left: 18px;
  font-size: 14px;
  color: #475569;
  line-height: 1.9;
}
code {
  background: #f1f5f9;
  padding: 1px 5px;
  border-radius: 4px;
  color: #2563eb;
  font-size: 13px;
}
.home-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 6px;
  background: #2563eb;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}
.home-btn:hover {
  background: #1d4ed8;
}
</style>
