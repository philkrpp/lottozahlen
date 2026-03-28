import { defineConfig } from 'jsrepo'

export default defineConfig({
  // configure where stuff comes from here
  registries: ['https://vue-bits.dev/r'],
  // configure where stuff goes here
  paths: {
    '*': 'app/components',
    component: 'app/components',
  },
})
