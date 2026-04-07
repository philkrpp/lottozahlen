<template>
	<v-app-bar
		flat
		class="navbar-sticky"
		:color="scrolled ? undefined : 'transparent'"
		:style="scrolled ? {} : { background: 'transparent' }"
	>
		<v-container class="d-flex align-center">
			<NuxtLink
				to="/"
				class="text-decoration-none d-flex align-center"
			>
				<span class="text-h5 font-weight-bold text-gradient">Lottozahlen</span>
			</NuxtLink>

			<v-spacer />

			<!-- Desktop Nav -->
			<template v-if="!mobile">
				<v-btn
					variant="text"
					@click="scrollTo('features')"
					>Features</v-btn
				>
				<v-btn
					variant="text"
					@click="scrollTo('how-it-works')"
					>Wie es funktioniert</v-btn
				>
				<v-btn
					variant="text"
					@click="scrollTo('pricing')"
					>Preise</v-btn
				>
				<ThemeToggle class="mx-2" />
				<template v-if="isLoggedIn">
					<v-btn
						variant="flat"
						color="primary"
						to="/dashboard"
						class="ml-2"
						append-icon="mdi-arrow-right"
						>Zum Dashboard</v-btn
					>
				</template>
				<template v-else>
					<v-btn
						variant="outlined"
						color="primary"
						to="/login"
						class="ml-2"
						>Login</v-btn
					>
					<v-btn
						variant="flat"
						color="primary"
						to="/register"
						class="ml-2"
						>Registrieren</v-btn
					>
				</template>
			</template>

			<!-- Mobile Nav -->
			<template v-else>
				<ThemeToggle />
				<v-app-bar-nav-icon @click="drawer = !drawer" />
			</template>
		</v-container>
	</v-app-bar>

	<!-- Mobile Drawer -->
	<ClientOnly>
		<v-navigation-drawer
			v-model="drawer"
			temporary
			location="right"
		>
			<v-list>
				<v-list-item
					@click="
						scrollTo('features');
						drawer = false;
					"
				>
					<v-list-item-title>Features</v-list-item-title>
				</v-list-item>
				<v-list-item
					@click="
						scrollTo('how-it-works');
						drawer = false;
					"
				>
					<v-list-item-title>Wie es funktioniert</v-list-item-title>
				</v-list-item>
				<v-list-item
					@click="
						scrollTo('pricing');
						drawer = false;
					"
				>
					<v-list-item-title>Preise</v-list-item-title>
				</v-list-item>
				<v-divider class="my-2" />
				<template v-if="isLoggedIn">
					<v-list-item
						to="/dashboard"
						@click="drawer = false"
					>
						<v-list-item-title>Zum Dashboard</v-list-item-title>
					</v-list-item>
				</template>
				<template v-else>
					<v-list-item
						to="/login"
						@click="drawer = false"
					>
						<v-list-item-title>Login</v-list-item-title>
					</v-list-item>
					<v-list-item
						to="/register"
						@click="drawer = false"
					>
						<v-list-item-title>Registrieren</v-list-item-title>
					</v-list-item>
				</template>
			</v-list>
		</v-navigation-drawer>
	</ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useDisplay } from "vuetify";
import { useAuth } from "~/composables/useAuth";
import ThemeToggle from "./ThemeToggle.vue";

const { mobile } = useDisplay();
const { useSession } = useAuth();
const session = useSession();
const isLoggedIn = computed(() => !!session.value?.data?.user);
const drawer = ref(false);
const scrolled = ref(false);

const router = useRouter();
const route = useRoute();

function scrollTo(id: string) {
	if (route.path !== "/") {
		router.push({ path: "/", hash: `#${id}` });
		return;
	}
	const el = document.getElementById(id);
	if (el) el.scrollIntoView({ behavior: "smooth" });
}

function handleScroll() {
	scrolled.value = window.scrollY > 50;
}

onMounted(() => window.addEventListener("scroll", handleScroll));
onUnmounted(() => window.removeEventListener("scroll", handleScroll));
</script>
