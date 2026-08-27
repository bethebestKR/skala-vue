<script setup>
// 검색박스와 리스트박스의 디자인을 공통화하는 베이스 카드
// [Element Plus] el-card 로 감싸고, header 슬롯에 제목을 넣는다.
// <slot> 위치에 부모 컴포넌트가 도시 검색 / 날씨 현황을 주입한다.
defineProps({
  title: { type: String, default: '' },
})
</script>

<template>
  <el-card class="panel" shadow="hover">
    <template #header>
      <span class="panel-title">{{ title }}</span>
    </template>
    <slot />
  </el-card>
</template>

<style scoped>
.panel {
  margin-bottom: 16px;
}
.panel-title {
  font-size: 16px;
  font-weight: 600;
}
</style>
