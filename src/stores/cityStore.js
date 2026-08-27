import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 즐겨찾기 도시를 전역으로 관리하는 스토어
export const useCityStore = defineStore('city', () => {
  // state: 즐겨찾기한 도시 id 목록
  const favoriteIds = ref([])

  // getter: 즐겨찾기 개수
  const favoriteCount = computed(() => favoriteIds.value.length)

  // getter: 특정 도시가 즐겨찾기 상태인지 판별 (id를 받는 함수형 getter)
  const isFavorite = computed(() => (cityId) => favoriteIds.value.includes(cityId))

  // action: 즐겨찾기 추가/해제 토글
  function toggleFavorite(cityId) {
    const index = favoriteIds.value.indexOf(cityId)
    if (index === -1) {
      favoriteIds.value.push(cityId)
    } else {
      favoriteIds.value.splice(index, 1)
    }
  }

  // action: 즐겨찾기 전체 해제
  function clearFavorites() {
    favoriteIds.value = []
  }

  return { favoriteIds, favoriteCount, isFavorite, toggleFavorite, clearFavorites }
})
