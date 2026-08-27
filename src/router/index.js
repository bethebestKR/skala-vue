import { createRouter, createWebHistory } from 'vue-router'
import GlobeLandingView from '../views/GlobeLandingView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      // 랜딩: 3D 지구본 (globe.gl) — 핀 클릭 시 실시간 날씨
      path: '/',
      name: 'globe',
      component: GlobeLandingView,
    },
    {
      // 카드형 날씨 대시보드 (기존 홈)
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/WeatherHomeView.vue'),
    },
    {
      // 실습 아카이브 (01~08 인덱스, Lazy Loading)
      path: '/lessons',
      name: 'lessons',
      component: () => import('../views/LessonsView.vue'),
    },
    {
      // 서비스 소개 (Lazy Loading)
      path: '/about',
      name: 'about',
      component: () => import('../views/WeatherAboutView.vue'),
    },
    {
      // :cityId 동적 경로 매칭 상세 페이지 (Lazy Loading)
      path: '/weather/:cityId',
      name: 'weather-detail',
      component: () => import('../views/WeatherDetailView.vue'),
    },
    {
      // 정의되지 않은 경로 접근 시 (Catch-all Route)
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

export default router
