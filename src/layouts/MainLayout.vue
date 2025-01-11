<template>
  <q-layout view="hHh lpR fFf">

    <q-header reveal elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <header-left />
        <header-center />
        <header-right />
      </q-toolbar>
      <header-bar />
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <!-- drawer content -->
    </q-drawer>

    <q-drawer show-if-above v-model="rightDrawerOpen" side="right" bordered>
      <!-- drawer content -->
    </q-drawer>

    <q-page-container>
      <router-view />
      <page-sticky />
    </q-page-container>

    <footer />

    <q-ajax-bar
      ref="bar"
      position="bottom"
      color="accent"
      size="10px"
      skip-hijack
    />
  </q-layout>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import HeaderLeft from "../layouts/MainLayout/HeaderLeft.vue";
import HeaderRight from "../layouts/MainLayout/HeaderRight.vue";
import HeaderBar from "../layouts/MainLayout/HeaderBar.vue";
import HeaderCenter from "../layouts/MainLayout/HeaderCenter.vue";
import PageSticky from "../layouts/MainLayout/PageSticky.vue";
import Footer from "../layouts/MainLayout/Footer.vue";

const leftDrawerOpen = ref(false)
const rightDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value
}
</script>

<style>
.q-page-sticky {
  z-index: 2000;
}

.fab-main {
  .q-fab-action {
    &__label {
      border-radius: 4px;
      padding: 4px 12px;
      font-size: 14px;
      right: 66px;
      color: #fff;
    }

    &--primary &__label {
      background: var(--q-primary);
    }

    &--secondary &__label {
      background: var(--q-secondary);
    }
  }
}

@media (max-width: 599px) {
  .fab-main {
    .q-fab-action {
      &__label {
        padding: 4px 8px;
        font-size: 12px;
      }
    }
  }
}
</style>
