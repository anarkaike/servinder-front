<template>
  <q-page-sticky position="bottom-right" :offset="[20, 20]">
    <q-fab
      color="purple"
      direction="up"
      class="fab-main"
    >
      <template v-slot:icon>
        <q-icon name="keyboard_arrow_up" />
      </template>

      <template v-slot:active-icon>
        <q-icon name="close" />
      </template>

      <q-fab-action
        label="Mail Mail Mail"
        label-position="left"
        external-label
        color="primary"
        icon="mail"
      />

      <q-fab-action
        label="Alarm Alarm Alarm"
        label-position="left"
        external-label
        color="secondary"
        icon="alarm"
      />
    </q-fab>
  </q-page-sticky>
</template>
