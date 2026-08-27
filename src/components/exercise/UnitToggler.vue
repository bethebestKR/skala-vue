<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useConfigStore } from '@/stores/configStore'

// 단위 설정 스토어 사용
const configStore = useConfigStore()
const { unit, unitSymbol } = storeToRefs(configStore)
const { toggleUnit } = configStore

// [Element Plus] el-switch 는 boolean 을 다루므로, 화씨 여부로 매핑한다.
const isFahrenheit = computed({
  get: () => unit.value === 'fahrenheit',
  set: () => toggleUnit(), // 스위치가 바뀔 때마다 단위 토글
})
</script>

<template>
  <div class="unit-toggler">
    <span class="unit-label">날씨단위</span>
    <el-switch
      v-model="isFahrenheit"
      inline-prompt
      active-text="°F"
      inactive-text="°C"
      style="--el-switch-on-color: #f59e0b; --el-switch-off-color: #2563eb"
    />
    <el-tag type="info" effect="plain">{{ unitSymbol }}</el-tag>
  </div>
</template>

<style scoped>
.unit-toggler {
  display: flex;
  align-items: center;
  gap: 10px;
}
.unit-label {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}
</style>
