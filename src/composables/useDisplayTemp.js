import { computed, toValue } from 'vue'
import { useConfigStore } from '@/stores/configStore'

// 원본 섭씨 온도(rawTemp)를 현재 단위 설정에 맞게 변환해 주는 Composable
// - ref, getter, 원시값 모두 인자로 받을 수 있도록 toValue 사용
export function useDisplayTemp(rawTemp) {
  const configStore = useConfigStore()

  const displayTemp = computed(() => {
    const temp = toValue(rawTemp) // 기본 원본 데이터는 섭씨 숫자
    if (configStore.unit === 'fahrenheit') {
      return Math.round((temp * 9) / 5 + 32) // 화씨 변환 연산
    }
    return temp // 'celsius'일 때는 원본 그대로 반환
  })

  return { displayTemp }
}
