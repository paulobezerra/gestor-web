<script setup lang="ts">
import { toast } from 'vue-sonner'
import AppLayout from '@/layouts/AppLayout.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <AppLayout>
    <div class="mx-auto max-w-2xl p-6">
      <h1 class="mb-6 text-2xl font-bold">Perfil</h1>

      <Card class="mb-6">
        <CardHeader>
          <CardTitle>Informações da conta</CardTitle>
          <CardDescription>Seus dados de acesso ao sistema</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="email-perfil">E-mail</Label>
            <Input
              id="email-perfil"
              :value="authStore.user?.email"
              disabled
              readonly
              aria-readonly="true"
            />
          </div>
          <div class="space-y-2">
            <Label for="role-perfil">Perfil de acesso</Label>
            <Input
              id="role-perfil"
              :value="authStore.user?.role"
              disabled
              readonly
              aria-readonly="true"
            />
          </div>
          <p class="text-sm text-muted-foreground">
            Alteração de nome disponível em breve.
          </p>
        </CardContent>
      </Card>

      <Separator class="my-6" />

      <Card>
        <CardHeader>
          <CardTitle>Alterar senha</CardTitle>
          <CardDescription>Atualize sua senha de acesso</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="senha-atual">Senha atual</Label>
            <Input id="senha-atual" type="password" disabled aria-disabled="true" />
          </div>
          <div class="space-y-2">
            <Label for="nova-senha-perfil">Nova senha</Label>
            <Input id="nova-senha-perfil" type="password" disabled aria-disabled="true" />
          </div>
          <div class="space-y-2">
            <Label for="confirmar-senha-perfil">Confirmar nova senha</Label>
            <Input id="confirmar-senha-perfil" type="password" disabled aria-disabled="true" />
          </div>
          <Button
            type="button"
            @click="toast.info('Funcionalidade disponível em breve.')"
          >
            Alterar senha
          </Button>
        </CardContent>
      </Card>
    </div>
  </AppLayout>
</template>
