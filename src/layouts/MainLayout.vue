<template>
  <q-layout view="hHh lpR fFf">

    <q-header reveal elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar class="d-flex justify-between">
        <header-left />
        <header-center />
        <header-right />
      </q-toolbar>
      <div class="row items-center justify-between q-px-md">
        <div class="col-auto">
          <breadcrumbs :items="breadcrumbItems" />
        </div>
        <div class="col-auto">
          <header-bar :items="items" />
        </div>
      </div>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <!-- drawer content ESQUERDO -->
    </q-drawer>
    <q-drawer show-if-above v-model="rightDrawerOpen" side="right" bordered>
      <!-- drawer content DIREITO -->
    </q-drawer>

    <q-page-container>
      <router-view />
      <page-sticky />
    </q-page-container>

    <q-footer elevated class="bg-grey-8 text-white">
      <footer-bar />
      <q-toolbar>
        <footer-left />
        <q-toolbar-title class="text-center vertical-middle">
          <a class="text-white text-small no-underline" target="_blank" href="https://wa.me/551122222222?text=Ol%C3%A1%2C%20tenho%20uma%20d%C3%BAvida%3A">Qualquer dúvida: (11) 97687-1674</a>
        </q-toolbar-title>
        <footer-right />
      </q-toolbar>
    </q-footer>

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
import HeaderCenter from "../layouts/MainLayout/HeaderCenter.vue";
import HeaderRight from "../layouts/MainLayout/HeaderRight.vue";
import HeaderBar from "../layouts/MainLayout/HeaderBar.vue";
import Breadcrumbs from "../layouts/MainLayout/Breadcrumbs.vue";
import FooterBar from "../layouts/MainLayout/FooterBar.vue";
import FooterLeft from "../layouts/MainLayout/FooterLeft.vue";
import FooterRight from "../layouts/MainLayout/FooterRight.vue";
import PageSticky from "../layouts/MainLayout/PageSticky.vue";

const leftDrawerOpen = ref(false)
const rightDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value
}

const breadcrumbItems = [
  { label: 'Home', icon: 'home', to: '/' },
  { label: 'Dashboard', icon: 'dashboard', to: '/dashboard' },
  { label: 'Relatórios', icon: 'analytics', to: '/relatorios' }
]

const items = [
  {
    label: 'Home',
    to: '/'
  },
  {
    label: 'Dashboard',
    to: '/dashboard'
  },
  {
    label: 'Configurações',
    to: '/settings'
  }
]
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
