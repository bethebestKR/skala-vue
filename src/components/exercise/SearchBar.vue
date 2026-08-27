<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

// 부모로부터 검색도시 반응형 데이터를 props로 전달받아 표시
defineProps({
  keyword: { type: String, default: '' },
})

// 도시 검색 시 update-query 이벤트를 발생시키면서 검색어를 부모에게 전달
const emit = defineEmits(['update-query'])

// [Element Plus] el-input 은 한글(IME) 입력을 내부적으로 처리한다.
// @input 은 최종 문자열 값을 바로 넘겨준다.
const isComposing = ref(false)

const onInput = (value) => {
  emit('update-query', value)
}
const onCompositionStart = () => {
  isComposing.value = true
}
const onCompositionEnd = () => {
  isComposing.value = false
}
</script>

<template>
  <el-input
    :model-value="keyword"
    placeholder="검색할 도시 이름 입력 (예: 파리, Tokyo)"
    clearable
    size="large"
    :prefix-icon="Search"
    @input="onInput"
    @compositionstart="onCompositionStart"
    @compositionend="onCompositionEnd"
  />
  <p class="search-echo">
    검색 중인 도시: <strong>{{ keyword }}</strong>
    <span v-if="isComposing" class="composing">(입력 중…)</span>
  </p>
</template>

<style scoped>
.search-echo {
  margin: 8px 0 0;
  font-size: 13px;
  color: #475569;
}
.composing {
  color: #94a3b8;
}
</style>
