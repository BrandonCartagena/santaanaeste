<template>
  <q-page class="q-pa-md q-pa-lg-xl bg-patron-ondas">
    <div class="container">
      <!-- Encabezado de página (alineado al estilo de la aplicación) -->
      <div class="q-mb-xl">
        <div class="row items-center q-gutter-x-md">
          <h1 class="text-h3 text-weight-bold q-my-none text-white">
            Canal de Denuncia Segura
          </h1>
          <q-icon color="white" size="48px" name="sym_o_verified_user" />
        </div>
        <p class="text-subtitle1 text-grey-3 q-mt-sm q-mb-none">
          Gestión Antisoborno · Reporte confidencial y anónimo
        </p>
      </div>

      <!-- Tarjeta principal del formulario -->
      <q-card class="custom-card form-wrapper overflow-hidden">
        <!-- Banner institucional (se oculta limpiamente si no carga la imagen) -->
        <img
          v-if="!bannerError"
          src="img/DENUNCIA.png"
          alt="Canal de Denuncia Segura"
          class="header-banner"
          @error="bannerError = true"
        />

        <!-- Barra de progreso reactiva según campos obligatorios completados -->
        <q-linear-progress
          :value="progresoFormulario"
          color="amber-7"
          track-color="grey-3"
          size="5px"
          animation-speed="400"
        />

        <q-card-section class="q-pa-lg q-pa-md-xl">
          <!-- Aviso de confidencialidad -->
          <q-banner rounded class="security-banner q-mb-lg">
            <template #avatar>
              <div class="security-icon-badge row flex-center">
                <q-icon name="sym_o_lock" size="24px" color="amber-10" />
              </div>
            </template>
            <div class="text-weight-bold text-amber-10 q-mb-xs">
              Canal Seguro y Confidencial
            </div>
            <div class="text-body2 text-brown-9">
              Toda la información proporcionada a través de este formulario se
              maneja con estricta confidencialidad. Tu anonimato está garantizado.
            </div>
          </q-banner>

          <!-- Indicador de progreso textual -->
          <div class="row items-center justify-between q-mb-lg">
            <span class="text-caption text-grey-7 text-weight-medium">
              Campos obligatorios completados
            </span>
            <q-badge
              rounded
              :color="progresoFormulario === 1 ? 'positive' : 'primary'"
              class="q-px-sm q-py-xs text-weight-bold"
              :label="`${camposCompletados} de ${totalCamposRequeridos}`"
            />
          </div>

          <!-- Iframe oculto para envío con adjuntos a FormSubmit -->
          <iframe
            name="ventanaOculta"
            style="display: none"
            @load="onIframeLoad"
          />

          <q-form
            ref="formRef"
            action="https://formsubmit.co/denuncias.antisoborno@santanaeste.com"
            method="POST"
            enctype="multipart/form-data"
            target="ventanaOculta"
            @submit="onSubmit"
            @validation-error="onValidationError"
          >
            <!-- Campos ocultos de configuración FormSubmit -->
            <input
              type="hidden"
              name="_subject"
              value="Nueva Denuncia Confidencial Recibida"
            />
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_template" value="table" />

            <!-- SECCIÓN 1: Datos del Denunciado -->
            <div class="section-header row items-center q-gutter-x-sm q-mb-md">
              <q-icon name="sym_o_person_search" size="20px" color="primary" />
              <span class="section-title-text">1. Datos del Denunciado</span>
              <q-separator class="col" />
            </div>

            <div class="row q-col-gutter-md q-mb-xl">
              <div class="col-12">
                <q-input
                  v-model="form.nombre"
                  name="Nombre_Denunciado"
                  outlined
                  bg-color="grey-1"
                  label="Nombre completo de la persona denunciada *"
                  placeholder="Ej. Juan Pérez"
                  :rules="[
                    (val) =>
                      (val && val.trim().length > 0) ||
                      'Ingresa el nombre de la persona denunciada',
                  ]"
                  lazy-rules
                >
                  <template #prepend>
                    <q-icon name="sym_o_person" color="primary" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.oficina"
                  name="Oficina_o_Dependencia"
                  outlined
                  bg-color="grey-1"
                  label="Oficina o Unidad *"
                  placeholder="Ej. Unidad de Compras Públicas"
                  :rules="[
                    (val) =>
                      (val && val.trim().length > 0) ||
                      'Especifica la oficina o unidad',
                  ]"
                  lazy-rules
                >
                  <template #prepend>
                    <q-icon name="sym_o_apartment" color="primary" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.cargo"
                  name="Cargo_del_Denunciado"
                  outlined
                  bg-color="grey-1"
                  label="Cargo que desempeña"
                  placeholder="Ej. Gerente (opcional)"
                >
                  <template #prepend>
                    <q-icon name="sym_o_badge" color="grey-7" />
                  </template>
                </q-input>
              </div>
            </div>

            <!-- SECCIÓN 2: Detalles del Hecho -->
            <div class="section-header row items-center q-gutter-x-sm q-mb-md">
              <q-icon name="sym_o_assignment" size="20px" color="primary" />
              <span class="section-title-text">2. Detalles del Hecho</span>
              <q-separator class="col" />
            </div>

            <div class="row q-col-gutter-md q-mb-xl">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.fecha"
                  name="Fecha_del_Incidente"
                  type="date"
                  outlined
                  bg-color="grey-1"
                  label="Fecha del incidente *"
                  :max="fechaMaxima"
                  stack-label
                  :rules="[
                    (val) => !!val || 'Selecciona la fecha del incidente',
                    (val) =>
                      val <= fechaMaxima || 'La fecha no puede ser futura',
                  ]"
                  lazy-rules
                >
                  <template #prepend>
                    <q-icon name="sym_o_event" color="primary" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.lugar"
                  name="Lugar_del_Incidente"
                  outlined
                  bg-color="grey-1"
                  label="Lugar del incidente *"
                  placeholder="Especificar ubicación"
                  :rules="[
                    (val) =>
                      (val && val.trim().length > 0) ||
                      'Indica el lugar del incidente',
                  ]"
                  lazy-rules
                >
                  <template #prepend>
                    <q-icon name="sym_o_location_on" color="primary" />
                  </template>
                </q-input>
              </div>

              <div class="col-12">
                <q-input
                  v-model="form.descripcion"
                  name="Descripcion_de_los_Hechos"
                  type="textarea"
                  outlined
                  autogrow
                  counter
                  maxlength="2000"
                  bg-color="grey-1"
                  input-style="min-height: 110px"
                  label="Descripción detallada de la acción o hecho *"
                  placeholder="Relata cronológicamente cómo sucedió el incidente..."
                  :rules="[
                    (val) =>
                      (val && val.trim().length >= 20) ||
                      'Describe los hechos con al menos 20 caracteres',
                  ]"
                  lazy-rules
                >
                  <template #prepend>
                    <q-icon name="sym_o_description" color="primary" />
                  </template>
                </q-input>
              </div>
            </div>

            <!-- SECCIÓN 3: Pruebas Documentales -->
            <div class="section-header row items-center q-gutter-x-sm q-mb-md">
              <q-icon name="sym_o_attach_file" size="20px" color="primary" />
              <span class="section-title-text">3. Pruebas Documentales</span>
              <q-separator class="col" />
            </div>

            <div class="q-mb-xl">
              <!-- Zona interactiva Drag & Drop conectada a q-file -->
              <div
                class="file-dropzone column flex-center text-center q-pa-lg"
                :class="{
                  'is-dragover': isDragging,
                  'has-file': !!form.evidencia,
                }"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="onFileDrop"
                @click="triggerFilePicker"
              >
                <q-file
                  ref="fileInputRef"
                  v-model="form.evidencia"
                  name="Archivos_Evidencia"
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  max-file-size="10485760"
                  class="hidden-q-file"
                  @update:model-value="onFileSelected"
                  @rejected="onFileRejected"
                />

                <template v-if="!form.evidencia">
                  <div class="dropzone-icon-wrap q-mb-sm">
                    <q-icon
                      :name="isDragging ? 'sym_o_file_download' : 'sym_o_cloud_upload'"
                      size="38px"
                      color="primary"
                    />
                  </div>
                  <div class="text-subtitle2 text-weight-bold text-primary">
                    {{
                      isDragging
                        ? 'Suelta el archivo aquí'
                        : 'Haz clic o arrastra un archivo aquí'
                    }}
                  </div>
                  <div class="text-caption text-grey-7 q-mt-xs">
                    Imágenes, video, PDF o Word (máximo 1 archivo de hasta 10 MB)
                  </div>
                </template>

                <!-- Vista previa reactiva cuando hay archivo cargado -->
                <template v-else>
                  <div
                    class="row items-center no-wrap full-width justify-between q-gutter-x-md"
                    @click.stop
                  >
                    <div class="row items-center no-wrap q-gutter-x-md col">
                      <q-avatar
                        v-if="previewUrl"
                        rounded
                        size="56px"
                        class="shadow-1"
                      >
                        <img :src="previewUrl" alt="Vista previa" />
                      </q-avatar>
                      <div
                        v-else
                        class="file-type-badge row flex-center"
                      >
                        <q-icon
                          :name="fileIcon"
                          size="28px"
                          color="positive"
                        />
                      </div>

                      <div class="col text-left ellipsis">
                        <div class="text-subtitle2 text-weight-bold text-positive ellipsis">
                          {{ form.evidencia.name }}
                        </div>
                        <div class="text-caption text-grey-7">
                          {{ formatFileSize(form.evidencia.size) }} · Listo para enviar
                        </div>
                      </div>
                    </div>

                    <q-btn
                      round
                      flat
                      dense
                      icon="sym_o_close"
                      color="grey-7"
                      @click.stop="clearFile"
                    >
                      <q-tooltip>Quitar archivo</q-tooltip>
                    </q-btn>
                  </div>
                </template>
              </div>
            </div>

            <!-- Botón de envío estilo píldora -->
            <q-btn
              type="submit"
              unelevated
              rounded
              no-caps
              size="lg"
              color="primary"
              class="full-width submit-pill-btn text-weight-bold"
              :loading="enviando"
              :disable="enviando"
            >
              <span class="row items-center q-gutter-x-sm">
                <span>Enviar Denuncia</span>
                <q-icon name="sym_o_send" size="20px" />
              </span>

              <template #loading>
                <q-spinner-dots size="24px" class="q-mr-sm" />
                <span>Subiendo evidencia y enviando...</span>
              </template>
            </q-btn>
          </q-form>
        </q-card-section>
      </q-card>
    </div>

    <!-- Diálogo de confirmación (estilo consistente con Registro Civil) -->
    <q-dialog
      v-model="dialogConfirmacion"
      transition-show="jump-down"
      transition-hide="fade"
      transition-duration="350"
    >
      <q-card class="dialog-card column no-wrap">
        <div class="dialog-header row items-center no-wrap q-px-lg q-py-md">
          <div class="header-icon-badge row flex-center q-mr-md">
            <q-icon name="sym_o_check_circle" size="28px" color="white" />
          </div>
          <div class="col">
            <div class="text-h6 text-weight-bold text-white">
              Denuncia Enviada
            </div>
            <div class="text-caption text-blue-1">
              Recepción confidencial confirmada
            </div>
          </div>
          <q-btn
            round
            flat
            dense
            icon="sym_o_close"
            color="white"
            v-close-popup
          />
        </div>

        <q-card-section class="q-pa-lg text-center">
          <q-icon
            name="sym_o_mark_email_read"
            size="56px"
            color="positive"
            class="q-mb-md"
          />
          <div class="text-subtitle1 text-weight-bold text-grey-10 q-mb-xs">
            ¡Tu denuncia ha sido procesada con éxito!
          </div>
          <div class="text-body2 text-grey-7">
            La información y cualquier evidencia adjunta fueron enviadas de forma
            segura al canal antisoborno.
          </div>
        </q-card-section>

        <q-separator />
        <div class="dialog-footer row justify-end q-px-lg q-py-sm">
          <q-btn
            unelevated
            rounded
            no-caps
            color="primary"
            label="Entendido"
            class="q-px-lg text-weight-medium"
            v-close-popup
          />
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const formRef = ref(null)
const fileInputRef = ref(null)
const bannerError = ref(false)
const isDragging = ref(false)
const enviando = ref(false)
const dialogConfirmacion = ref(false)
const previewUrl = ref(null)

const form = reactive({
  nombre: '',
  oficina: '',
  cargo: '',
  fecha: '',
  lugar: '',
  descripcion: '',
  evidencia: null,
})

const fechaMaxima = computed(() => {
  const hoy = new Date()
  return hoy.toISOString().split('T')[0]
})

// Progreso reactivo de campos obligatorios
const camposRequeridos = computed(() => [
  form.nombre.trim().length > 0,
  form.oficina.trim().length > 0,
  Boolean(form.fecha),
  form.lugar.trim().length > 0,
  form.descripcion.trim().length >= 20,
])

const totalCamposRequeridos = computed(() => camposRequeridos.value.length)
const camposCompletados = computed(
  () => camposRequeridos.value.filter(Boolean).length
)
const progresoFormulario = computed(
  () => camposCompletados.value / totalCamposRequeridos.value
)

const fileIcon = computed(() => {
  const type = form.evidencia?.type || ''
  if (type.includes('pdf')) return 'sym_o_picture_as_pdf'
  if (type.includes('video')) return 'sym_o_movie'
  return 'sym_o_description'
})

const formatFileSize = (bytes) => {
  if (!bytes) return '0 KB'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const updatePreview = (file) => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
  if (file && file.type?.startsWith('image/')) {
    previewUrl.value = URL.createObjectURL(file)
  }
}

const triggerFilePicker = () => {
  fileInputRef.value?.pickFiles()
}

const onFileSelected = (file) => {
  updatePreview(file)
}

const onFileDrop = (event) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (!files || !files.length) return

  const file = files[0]
  if (file.size > 10485760) {
    onFileRejected([{ failedPropValidation: 'max-file-size' }])
    return
  }
  form.evidencia = file
  updatePreview(file)
}

const onFileRejected = (rejectedEntries) => {
  const reason = rejectedEntries?.[0]?.failedPropValidation
  const message =
    reason === 'max-file-size'
      ? 'El archivo supera el límite permitido de 10 MB.'
      : 'Formato de archivo no permitido.'
  $q.notify({
    type: 'warning',
    icon: 'sym_o_warning',
    message,
    position: 'top',
  })
}

const clearFile = () => {
  form.evidencia = null
  updatePreview(null)
}

const resetForm = () => {
  form.nombre = ''
  form.oficina = ''
  form.cargo = ''
  form.fecha = ''
  form.lugar = ''
  form.descripcion = ''
  clearFile()
  formRef.value?.resetValidation()
}

const onSubmit = () => {
  enviando.value = true
}

const onValidationError = () => {
  $q.notify({
    type: 'negative',
    icon: 'sym_o_error',
    message: 'Por favor completa los campos obligatorios marcados en rojo.',
    position: 'top',
  })
}

const onIframeLoad = () => {
  if (!enviando.value) return
  enviando.value = false
  dialogConfirmacion.value = true
  resetForm()
}

// Protección ligera manteniendo editable la selección dentro de inputs
const blockContext = (e) => {
  if (!['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) {
    e.preventDefault()
  }
}

const blockDevShortcuts = (e) => {
  const key = e.key?.toLowerCase()
  if (
    e.key === 'F12' ||
    ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(key)) ||
    ((e.ctrlKey || e.metaKey) && key === 'u')
  ) {
    e.preventDefault()
  }
}

onMounted(() => {
  document.addEventListener('contextmenu', blockContext)
  document.addEventListener('keydown', blockDevShortcuts)
})

onBeforeUnmount(() => {
  document.removeEventListener('contextmenu', blockContext)
  document.removeEventListener('keydown', blockDevShortcuts)
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})
</script>

<style lang="scss" scoped>
.form-wrapper {
  max-width: 780px;
  margin: 0 auto;
  border-radius: 20px;
  box-shadow: 0 20px 40px -15px rgba(11, 37, 89, 0.18);
  user-select: none;
}

.header-banner {
  width: 100%;
  height: auto;
  display: block;
  border-bottom: 4px solid #fbc02d;
  pointer-events: none;
}

.security-banner {
  background-color: #fffbeb;
  border-left: 5px solid #fbc02d;
}

.security-icon-badge {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: rgba(251, 192, 45, 0.22);
}

.section-title-text {
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--q-primary);
  font-weight: 700;
}

.file-dropzone {
  border: 2px dashed #cbd5e1;
  background-color: #f8fafc;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover,
  &.is-dragover {
    border-color: var(--q-primary);
    background-color: #f1f5f9;
  }

  &.has-file {
    border-style: solid;
    border-color: var(--q-positive);
    background-color: #f0fdf4;
    cursor: default;
  }
}

.dropzone-icon-wrap {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(var(--q-primary-rgb, 25, 118, 210), 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-type-badge {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: rgba(22, 163, 74, 0.12);
}

.hidden-q-file {
  display: none;
}

.submit-pill-btn {
  padding: 12px 24px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px -10px rgba(11, 37, 89, 0.45);
  }
}

.dialog-card {
  width: 100%;
  max-width: 440px;
  border-radius: 18px;
  overflow: hidden;
}

.dialog-header {
  background: var(--q-primary);
}

.header-icon-badge {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.16);
}
</style>
