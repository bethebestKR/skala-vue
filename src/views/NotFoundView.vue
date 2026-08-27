<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="not-found">
    <div class="icon">🌞<span class="q">❓</span></div>
    <h2 class="title">페이지를 찾을 수 없습니다.</h2>
    <p class="desc">
      요청하신 주소가 존재하지 않거나,<br />
      아직 개발되지 않았습니다.
    </p>
    <button class="home-btn" @click="goHome">날씨 메인으로 이동</button>
  </div>
</template>

<style scoped>
.not-found {
  max-width: 420px;
  margin: 48px auto;
  padding: 40px 24px;
  text-align: center;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
}
.icon {
  font-size: 48px;
  margin-bottom: 16px;
}
.q {
  color: #ef4444;
}
.title {
  font-size: 22px;
  margin: 0 0 12px;
  color: #1f2937;
}
.desc {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 24px;
}
.home-btn {
  padding: 10px 20px;
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
