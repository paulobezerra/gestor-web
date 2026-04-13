<script setup lang="ts">
import AppLogo from '@/components/AppLogo.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-12">
    <div class="mb-8">
      <AppLogo size="lg" />
    </div>
    <div class="w-full max-w-md">
      <slot />
    </div>
  </div>
</template>
