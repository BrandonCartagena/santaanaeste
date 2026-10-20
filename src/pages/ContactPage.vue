<template>
  <q-page class="q-pa-md q-pa-lg-md">
    <div class="container">
      <h1 class="text-h4 text-weight-bold q-mb-sm">Atencion Ciudadana</h1>
      <p class="text-body1 text-grey-8 q-mb-lg">
        Envia tus consultas o reportes y te contactaremos a la brevedad.
      </p>

      <q-card bordered>
        <q-card-section>
          <q-form class="q-gutter-md" @submit="onSubmit">
            <q-input v-model="form.name" label="Nombre completo" outlined :rules="[(v) => !!v || 'Requerido']" />
            <q-input v-model="form.email" label="Correo electronico" outlined type="email" :rules="[(v) => !!v || 'Requerido']" />
            <q-input v-model="form.subject" label="Asunto" outlined :rules="[(v) => !!v || 'Requerido']" />
            <q-input
              v-model="form.message"
              label="Mensaje"
              outlined
              type="textarea"
              autogrow
              :rules="[(v) => !!v || 'Requerido']"
            />

            <div class="row justify-end">
              <q-btn color="primary" no-caps label="Enviar" type="submit" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { reactive } from 'vue'
import { Notify } from 'quasar'

defineOptions({
  name: 'ContactPage',
})

const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: '',
})

function onSubmit() {
  Notify.create({
    type: 'positive',
    message: 'Solicitud recibida. Pronto te contactaremos.',
  })

  form.name = ''
  form.email = ''
  form.subject = ''
  form.message = ''
}
</script>

<style scoped>
.container {
  max-width: 920px;
  margin: 0 auto;
}
</style>