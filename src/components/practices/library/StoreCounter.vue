<script setup>
import { storeToRefs } from 'pinia'
import { useCounterStore } from '@/stores/counter'

// Pinia store 사용
const counterStore = useCounterStore()
// state / getter를 반응성 유지한 채로 구조 분해
const { count, doubleCount } = storeToRefs(counterStore)
// action은 그대로 구조 분해 가능
const { increment } = counterStore
</script>

<template>
  <div class="practice-section">
    <h2>Pinia Store Counter</h2>
    <h3>count: {{ count }}</h3>
    <h3>doubleCount: {{ doubleCount }}</h3>
    <button @click="increment">증가</button>
  </div>
</template>
