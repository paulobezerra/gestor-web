<script setup lang="ts">
defineProps<{ size?: 'sm' | 'md' | 'lg' }>()
</script>

<template>
  <div class="flex items-center gap-2">
    <div
      class="flex items-center justify-center rounded-lg bg-primary text-primary-foreground"
      :class="{
        'size-7 text-sm': size === 'sm',
        'size-9 text-base': !size || size === 'md',
        'size-12 text-xl': size === 'lg',
      }"
    >
      <span class="font-bold">G</span>
    </div>
    <span
      class="font-semibold tracking-tight text-foreground"
      :class="{
        'text-base': size === 'sm',
        'text-lg': !size || size === 'md',
        'text-2xl': size === 'lg',
      }"
    >
      Gestor
    </span>
  </div>
</template>
