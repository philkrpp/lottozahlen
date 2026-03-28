<template>
  <div>
    <HeroSection />
    <FeaturesSection />
    <HowItWorksSection />
    <PricingSection />
    <TestimonialsSection />
    <CTASection />
  </div>
</template>

<script setup lang="ts">
import HeroSection from '~/components/landing/HeroSection.vue'
import FeaturesSection from '~/components/landing/FeaturesSection.vue'
import HowItWorksSection from '~/components/landing/HowItWorksSection.vue'
import PricingSection from '~/components/landing/PricingSection.vue'
import TestimonialsSection from '~/components/landing/TestimonialsSection.vue'
import CTASection from '~/components/landing/CTASection.vue'

definePageMeta({
  layout: 'default',
})
</script>
