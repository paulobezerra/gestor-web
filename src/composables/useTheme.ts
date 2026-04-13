import { ref, watch, onMounted } from 'vue'
import { usePreferredDark } from '@vueuse/core'

export type ThemeOption = 'light' | 'dark' | 'auto'

const THEME_KEY = 'theme-preference'

const theme = ref<ThemeOption>((localStorage.getItem(THEME_KEY) as ThemeOption) ?? 'auto')
const prefersDark = usePreferredDark()

function applyTheme(value: ThemeOption) {
  const isDark = value === 'dark' || (value === 'auto' && prefersDark.value)
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

watch(
  [theme, prefersDark],
  () => {
    applyTheme(theme.value)
  },
  { immediate: true },
)

export function useTheme() {
  function setTheme(value: ThemeOption) {
    theme.value = value
    localStorage.setItem(THEME_KEY, value)
  }

  onMounted(() => {
    applyTheme(theme.value)
  })

  return { theme, setTheme }
}
