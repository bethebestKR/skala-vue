import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 날씨 단위(섭씨/화씨)를 전역으로 관리하는 스토어
export const useConfigStore = defineStore('config', () => {
  // state: 단위를 저장하는 변수 (초기값: celsius)
  const unit = ref('celsius')

  // getter: 현재 단위 상태에 맞는 기호 (°C / °F)
  const unitSymbol = computed(() => (unit.value === 'celsius' ? '°C' : '°F'))

  // action: 'celsius'와 'fahrenheit'를 토글(스위칭)하는 함수
  function toggleUnit() {
    unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
  }

  return { unit, unitSymbol, toggleUnit }
})
