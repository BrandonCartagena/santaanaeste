<template>
  <q-page class="q-pa-md q-pa-lg-xl bg-patron-ondas">
    <div class="container">
      <!-- Encabezado de sección -->
      <div class="q-mb-xl">
        <div class="row items-center q-gutter-x-md">
          <h1 class="text-h3 text-weight-bold q-my-none text-white">
            Impuestos
          </h1>
          <q-icon color="white" size="48px" name="assured_workload" />
        </div>
        <p class="text-subtitle1 text-grey-3 q-mt-sm q-mb-none">
          Consulta y pago de tasas municipales
        </p>
      </div>

      <!-- Grid de tarjetas -->
      <div class="row q-col-gutter-lg items-stretch justify-center">
        <div
          class="col-12 col-md-4"
          v-for="item in blocks"
          :key="item.title"
        >
          <q-card class="custom-card column justify-between fit">
            <!-- Cuerpo superior: Icono + Título + Descripción -->
            <q-card-section class="q-pa-lg q-pb-md">
              <div class="icon-wrapper q-mb-md">
                <q-icon :name="item.icon" size="46px" class="card-icon" />
              </div>

              <div class="text-h6 text-weight-bold text-grey-10 q-mb-sm">
                {{ item.title }}
              </div>

              <div class="text-body2 text-grey-8 card-description">
                {{ item.description }}
              </div>
            </q-card-section>

            <!-- Pie de tarjeta: Botón tipo píldora -->
            <q-card-actions class="q-px-lg q-pb-lg q-pt-sm">
              <q-btn
                outline
                rounded
                no-caps
                class="full-width pill-btn text-weight-medium"
                :label="item.cta"
                :icon-right="item.hasArrow ? 'arrow_forward' : undefined"
                @click = "item.dialog = true"
              />
            </q-card-actions>
          </q-card>

          <q-dialog
            v-model="item.dialog"
            transition-show="jump-down"
            transition-hide="fade"
            transition-duration="350"
          >
            <q-card class="dialog-card column no-wrap">
              <!-- Encabezado con los datos del bloque -->
              <div class="dialog-header row items-center no-wrap q-px-lg q-py-md">
                <div class="header-icon-badge row flex-center q-mr-md">
                  <q-icon :name="formatIcon(item.icon)" size="28px" color="white" />
                </div>

                <div class="col">
                  <div class="text-h6 text-weight-bold text-white ellipsis">
                    {{ item.title }}
                  </div>
                  <div class="text-caption text-blue-1 ellipsis">
                    {{ item.description }}
                  </div>
                </div>

                <q-btn
                  round
                  flat
                  dense
                  icon="sym_o_close"
                  color="white"
                  class="close-btn q-ml-sm"
                  v-close-popup
                >
                  <q-tooltip class="bg-white text-primary">Cerrar</q-tooltip>
                </q-btn>
              </div>

              <!-- Barra sutil con instrucción (solo si hay servicios) -->
              <div
                v-if="getServicios(item).length"
                class="dialog-hint-bar row items-center q-px-lg q-py-xs q-gutter-x-xs"
              >
                <q-icon name="sym_o_touch_app" size="16px" color="primary" />
                <span>Toca una tarjeta para ver los requisitos del trámite</span>
              </div>

              <!-- Cuerpo con scroll y animación suave de altura -->
              <div class="dialog-scroll-area col">
                <div v-smooth-height class="smooth-height">
                  <div class="q-pa-md">
                    <!-- Lista de servicios -->
                    <div v-if="getServicios(item).length" class="q-gutter-y-md">
                      <div
                        v-for="servicio in getServicios(item)"
                        :key="servicio.titulo"
                        class="service-item-card"
                      >
                        <!-- Cabecera del servicio -->
                        <div class="row items-center no-wrap q-mb-sm">
                          <div class="service-icon-badge row flex-center q-mr-sm">
                            <q-icon
                              :name="formatIcon(servicio.icon)"
                              size="22px"
                              class="card-icon"
                            />
                          </div>
                          <div class="col text-subtitle1 text-weight-bold text-grey-10">
                            {{ servicio.titulo }}
                          </div>
                          <q-icon
                            name="sym_o_flip"
                            size="18px"
                            class="text-grey-5 q-ml-xs"
                          />
                        </div>

                        <!-- Sección interactiva Flip -->
                        <FlipSection
                          front-class="bg-grey-2 text-grey-9"
                          back-class="bg-transparent q-pa-none"
                        >
                          <template #front>
                            <div class="flip-front-box">
                              <div class="text-body2 text-grey-10">
                                {{ servicio.descripcion }}
                              </div>
                              <div class="flip-hint row items-center justify-end q-mt-sm">
                                <span>Ver requisitos</span>
                                <q-icon name="sym_o_chevron_right" size="18px" />
                              </div>
                            </div>
                          </template>

                          <template #back>
                            <div class="flip-back-box">
                              <!-- Encabezado con contador total -->
                              <div class="row items-center justify-between q-mb-xs">
                                <div class="row items-center q-gutter-x-xs text-primary text-weight-bold text-caption text-uppercase">
                                  <q-icon name="sym_o_fact_check" size="16px" />
                                  <span>Requisitos</span>
                                </div>

                                <q-badge
                                  rounded
                                  class="req-count-badge"
                                  :label="`${countRequisitos(servicio.requisitos)} ${
                                    countRequisitos(servicio.requisitos) === 1
                                      ? 'requisito'
                                      : 'requisitos'
                                  }`"
                                />
                              </div>

                              <!-- Grupos de requisitos (sub-secciones o lista única) -->
                              <div class="q-gutter-y-sm">
                                <div
                                  v-for="(group, gIdx) in getRequisitosGroups(servicio.requisitos)"
                                  :key="group.titulo || gIdx"
                                  :class="{ 'req-subsection': group.titulo }"
                                >
                                  <!-- Título de la sub-sección (solo se muestra si existe) -->
                                  <div
                                    v-if="group.titulo"
                                    class="req-subsection-title row items-center q-gutter-x-xs q-mb-xs"
                                  >
                                    <q-icon name="sym_o_subdirectory_arrow_right" size="16px" color="primary" />
                                    <span class="text-caption text-weight-bold text-primary">
                                      {{ group.titulo }}
                                    </span>
                                  </div>

                                  <!-- Lista de requisitos con separadores -->
                                  <q-list dense separator class="req-q-list">
                                    <q-item
                                      v-for="(req, idx) in group.items"
                                      :key="idx"
                                      class="req-item q-px-none"
                                    >
                                      <q-item-section avatar class="req-avatar">
                                        <q-icon
                                          name="sym_o_check_circle"
                                          size="18px"
                                          class="req-bullet-icon"
                                        />
                                      </q-item-section>

                                      <q-item-section class="text-body2 text-grey-9">
                                        {{ req }}
                                      </q-item-section>
                                    </q-item>
                                  </q-list>
                                </div>
                              </div>

                              <div class="flip-hint row items-center justify-end q-mt-xs">
                                <q-icon name="sym_o_chevron_left" size="16px" />
                                <span>Volver a descripción</span>
                              </div>
                            </div>
                          </template>
                        </FlipSection>
                      </div>
                    </div>

                    <!-- Estado vacío (ej. Cementerio mientras no tenga servicios) -->
                    <div v-else class="empty-state column flex-center text-center q-pa-lg">
                      <q-icon
                        :name="formatIcon(item.icon)"
                        size="44px"
                        class="text-grey-4 q-mb-sm"
                      />
                      <div class="text-subtitle1 text-weight-medium text-grey-8">
                        Información en actualización
                      </div>
                      <div class="text-body2 text-grey-6 q-mt-xs">
                        Próximamente estarán disponibles los trámites y requisitos de esta sección.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Pie del diálogo -->
              <q-separator />
              <div class="dialog-footer row justify-end q-px-lg q-py-sm">
                <q-btn
                  unelevated
                  rounded
                  no-caps
                  label="Cerrar"
                  class="dialog-close-pill text-weight-medium"
                  v-close-popup
                />
              </div>
            </q-card>
          </q-dialog>
            
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import FlipSection from '../components/FlipCardSection.vue';
import datosRegistro from '../datos_json/impuestos.json'
defineOptions({
  name: 'TransparencyPage',
})

const blocks = ref(datosRegistro)

// Convierte prefijos "sym_*" a "sym_o_*" si falta el estilo (outlined)
const formatIcon = (icon) => {
  if (!icon) return 'sym_o_description';
  if (icon.startsWith('sym_') && !/^sym_[ors]_/.test(icon)) {
    return icon.replace(/^sym_/, 'sym_o_');
  }
  return icon;
};

// Cuenta el total real de requisitos (sumando los de cada sub-sección si existen)
const countRequisitos = (requisitos) => {
  if (!Array.isArray(requisitos)) return 0

  return requisitos.reduce((total, item) => {
    if (item && typeof item === 'object' && Array.isArray(item.requisitos)) {
      return total + normalizeRequisitos(item.requisitos).length
    }
    return total + (typeof item === 'string' && item.trim() ? 1 : 0)
  }, 0)
}

// Convierte tanto un array plano como uno con sub-secciones en una estructura uniforme
const getRequisitosGroups = (requisitos) => {
  if (!Array.isArray(requisitos) || !requisitos.length) return []

  const hasSubsections = requisitos.some(
    (item) => item && typeof item === 'object' && Array.isArray(item.requisitos)
  )

  // Caso tradicional: ["Requisito 1", "Requisito 2"]
  if (!hasSubsections) {
    return [
      {
        titulo: null,
        items: normalizeRequisitos(requisitos)
      }
    ]
  }

  // Caso con sub-secciones: [{ titulo: "...", requisitos: [...] }]
  return requisitos
    .filter((item) => item && typeof item === 'object' && Array.isArray(item.requisitos))
    .map((sub) => ({
      titulo: sub.titulo || '',
      items: normalizeRequisitos(sub.requisitos)
    }))
}

// Evita errores cuando "servicios" viene como objeto vacío {}
const getServicios = (item) => {
  return Array.isArray(item.servicios) ? item.servicios : [];
};

// Asegura que "requisitos" siempre se recorra como arreglo
const normalizeRequisitos = (requisitos) => {
  if (Array.isArray(requisitos)) return requisitos;
  return requisitos ? [requisitos] : [];
};

// Directiva para animar suavemente el cambio de altura al hacer flip
const vSmoothHeight = {
  mounted(el) {
    const inner = el.firstElementChild;
    if (!inner) return;

    let isFirst = true;

    const observer = new ResizeObserver(() => {
      const height = inner.offsetHeight;
      if (!height) return;

      if (isFirst) {
        el.style.transition = 'none';
        el.style.height = `${height}px`;
        void el.offsetHeight;
        el.style.transition = '';
        isFirst = false;
      } else {
        el.style.height = `${height}px`;
      }
    });

    observer.observe(inner);
    el._resizeObserver = observer;
  },
  unmounted(el) {
    el._resizeObserver?.disconnect();
  },
};

</script>

<style lang="scss" scoped>
.container {
  max-width: 1180px;
  margin: 0 auto;
}

.dialog-card {
  width: 560px;
  max-width: 92vw;
  border-radius: 20px;
  overflow: hidden;
  background: #f8fafc;
  box-shadow: 0 20px 50px rgba(4, 24, 48, 0.35);
  will-change: transform, opacity;
}

.header-icon-badge {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.18);
  flex-shrink: 0;
}

.close-btn {
  background: rgba(255, 255, 255, 0.14);
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.28);
  }
}

.dialog-header {
  background: linear-gradient(135deg, #0b4a8f 0%, #0d5cab 55%, #00acc1 100%);
}

.dialog-scroll-area {
  max-height: 68vh;
  overflow-y: auto;
}

.smooth-height {
  overflow: hidden;
  transition: height 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: height;
}

.service-item-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 14px 16px;
  border: 1.5px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(89, 117, 180, 0.04);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    border-color: #7ec8e3;
    box-shadow: 0 6px 18px rgba(13, 92, 171, 0.1);
  }
}

.service-icon-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(13, 92, 171, 0.08);
  flex-shrink: 0;
}

.flip-front-box {
  line-height: 1.55;
  cursor: pointer;
}

.flip-hint {
  font-size: 0.78rem;
  font-weight: 600;
  color: #0d5cab;
}

.flip-back-box {
  background: #f0f9ff;
  border-left: 3.5px solid #00acc1;
  border-radius: 8px;
  padding: 10px 12px;
  line-height: 1.55;
  cursor: pointer;
}

.dialog-footer {
  background: #ffffff;
}

.dialog-close-pill {
  background: #0b4a8f;
  color: #ffffff;
  padding: 6px 22px;
  transition: background-color 0.2s ease;

  &:hover {
    background: #0d5cab;
  }
}

.custom-card {
  background: #ffffff;
  border-radius: 18px;
  border: 2px solid #7ec8e3; /* Borde celeste sutil como en la imagen */
  box-shadow: 0 12px 28px rgba(4, 24, 48, 0.35);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 18px 36px rgba(4, 24, 48, 0.5);
    border-color: #29b6f6;
  }
}

.card-icon {
  /* Degradado azul a turquesa en el icono */
  background: linear-gradient(135deg, #0d5cab 0%, #00acc1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.card-description {
  line-height: 1.5;
  color: #334155;
}

.pill-btn {
  color: #0b4a8f !important;
  border: 1.5px solid #0b4a8f;
  padding: 8px 16px;
  font-size: 0.95rem;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background-color: #0b4a8f !important;
    color: #ffffff !important;
  }
}

.dialog-hint-bar {
  background: #e0f2fe;
  color: #0b4a8f;
  font-size: 0.8rem;
  font-weight: 500;
  border-bottom: 1px solid #bae6fd;
}

.req-count-badge {
  background: rgba(13, 92, 171, 0.12);
  color: #0b4a8f;
  font-weight: 600;
  padding: 3px 8px;
}

.req-q-list {
  :deep(.q-item) {
    min-height: 28px;
    padding-top: 6px;
    padding-bottom: 6px;
  }

  :deep(.q-item + .q-item) {
    border-top-color: rgba(13, 92, 171, 0.12);
  }
}

.req-avatar {
  min-width: 26px;
  padding-right: 8px;
  align-self: flex-start;
  margin-top: 2px;
}

.req-bullet-icon {
  color: #00acc1;
}

.req-bullet-icon {
  color: #00acc1;
  flex-shrink: 0;
}

.empty-state {
  min-height: 160px;
}

.req-subsection {
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(var(--q-primary-rgb, 25, 118, 210), 0.04);
  border-left: 3px solid var(--q-primary);
}

.req-subsection-title {
  line-height: 1.2;
}
</style>
