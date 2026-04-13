<script setup lang="ts">
import { Sun, Moon, Monitor } from 'lucide-vue-next'
import { useTheme } from '@/composables/useTheme'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const { theme, setTheme } = useTheme()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon" aria-label="Alternar tema">
        <Sun v-if="theme === 'light'" class="size-4" />
        <Moon v-else-if="theme === 'dark'" class="size-4" />
        <Monitor v-else class="size-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @click="setTheme('light')">
        <Sun class="mr-2 size-4" />
        Claro
      </DropdownMenuItem>
      <DropdownMenuItem @click="setTheme('dark')">
        <Moon class="mr-2 size-4" />
        Escuro
      </DropdownMenuItem>
      <DropdownMenuItem @click="setTheme('auto')">
        <Monitor class="mr-2 size-4" />
        Automático
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
