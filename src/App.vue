<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import UnitToggler from './components/exercise/UnitToggler.vue'

// el-menu 의 활성 항목을 현재 라우트 경로와 동기화
const route = useRoute()
const activeIndex = computed(() => route.path)

// 지구본 랜딩(풀스크린)에서는 앱 헤더/툴바를 숨긴다 (자체 오버레이 네비 사용)
const isGlobe = computed(() => route.name === 'globe')
</script>

<template>
  <!-- 지구본 랜딩: 헤더 없이 풀스크린 -->
  <RouterView v-if="isGlobe" />

  <div v-else class="app">
    <!-- 하늘색 그라데이션 헤더 배너 -->
    <header class="app-header">
      <div class="header-text">
        <h1 class="app-title">🌦️ 종합실습 5: 스토어적용</h1>
        <p class="app-subtitle">실시간 날씨 대시보드 · OpenWeatherMap × Open-Meteo</p>
      </div>
    </header>

    <!-- 흰색 툴바: 네비게이션(el-menu) + 단위 변경 토글 -->
    <div class="toolbar">
      <!-- [Element Plus] el-menu 를 router 모드로 사용해 RouterLink 를 대체 -->
      <el-menu
        :default-active="activeIndex"
        mode="horizontal"
        router
        :ellipsis="false"
        class="nav-menu"
      >
        <el-menu-item index="/">🌍 지구본</el-menu-item>
        <el-menu-item index="/dashboard">📊 날씨 대시보드</el-menu-item>
        <el-menu-item index="/lessons">🗂️ 실습 아카이브</el-menu-item>
        <el-menu-item index="/about">ℹ️ 서비스 소개</el-menu-item>
      </el-menu>

      <UnitToggler />
    </div>

    <!-- 메인 콘텐츠 영역 (RouterView) -->
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app {
  font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
  color: #1f2937;
}
.app-header {
  background: linear-gradient(135deg, #2f80ed 0%, #56a0f2 55%, #7bb8f7 100%);
  border-radius: 16px;
  padding: 26px 28px;
  margin-bottom: 16px;
  box-shadow: 0 10px 30px rgba(47, 128, 237, 0.25);
  color: #fff;
}
.app-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 6px;
  letter-spacing: -0.3px;
}
.app-subtitle {
  margin: 0;
  font-size: 13px;
  opacity: 0.92;
}
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  background: #fff;
  border: 1px solid #eaf0f7;
  border-radius: 14px;
  padding: 6px 16px;
  margin-bottom: 20px;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.05);
}
.nav-menu {
  border-bottom: none;
  --el-menu-bg-color: transparent;
}
</style>
