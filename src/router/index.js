import LoginPage from "@/presentation/pages/page-login/LoginPage.vue";
import GetStarted from "@/presentation/pages/page-register/GetStarted.vue";
import RegisterPage from "@/presentation/pages/page-register/RegisterPage.vue";
import LandingCarousel from "@/presentation/pages/page-start/LandingCarousel.vue";
import WelcomePage from "@/presentation/pages/page-start/WelcomePage.vue";
import store from "@/store";
import { createRouter, createWebHistory } from "vue-router";
//import LogRocket from "logrocket";

const routes = [
  {
    path: "/",
    redirect: "/welcome",
  },
  {
    path: "/welcome",
    name: "WelcomePage",
    component: WelcomePage,
  },
  {
    path: "/landing-carousel",
    name: "LandingCarousel",
    component: LandingCarousel,
  },
  {
    path: "/register",
    name: "RegisterPage",
    component: RegisterPage,
    props: true,
    meta: { notAllowLoggedInUser: true },
  },
  {
    path: "/get-started",
    name: "GetStarted",
    component: GetStarted,
    props: true,
  },
  {
    path: "/login",
    name: "LoginPage",
    component: LoginPage,
    props: true,
    meta: { notAllowLoggedInUser: true },
  },
  // lazy load other pages
  {
    path: "/home",
    name: "HomePage",
    component: function () {
      return import("../presentation/pages/page-home/HomePage.vue");
    },
    meta: { requireLogin: true },
  },
  {
    path: "/feeds",
    name: "FeedPage",
    component: function () {
      return import("../presentation/pages/page-feeds/FeedPage.vue");
    },
    meta: { requireLogin: true },
  },
  {
    path: "/points",
    name: "PointsPage",
    component: function () {
      return import("../presentation/pages/page-points/PointsPage.vue");
    },
    meta: { requireLogin: true },
  },
  {
    path: "/my-voucher",
    name: "MyVoucherPage",
    component: function () {
      return import("../presentation/pages/page-points/MyVoucherPage.vue");
    },
    meta: { requireLogin: true },
  },
  {
    path: "/404",
    name: "ErrorPage",
    component: function () {
      return import("../presentation/pages/page-message/ErrorPage.vue");
    },
  },
  {
    path: "/survey/:nudgeId",
    name: "SurveyPage",
    component: function () {
      return import("../presentation/pages/page-survey/SurveyPage.vue");
    },
    meta: { requireLogin: true },
  },
  {
    path: "/article/:nudgeId/:shareToken?",
    name: "ArticlePage",
    component: function () {
      return import("../presentation/pages/page-article/ArticlePage.vue");
    },
    props: true,
    meta: { requireLogin: true },
  },
  {
    path: "/surprise/:nudgeId",
    name: "SurprisePage",
    component: function () {
      return import("../presentation/pages/page-surprise/SurprisePage.vue");
    },
    props: true,
    meta: { requireLogin: true },
  },
  {
    path: "/faq",
    name: "FAQ",
    component: function () {
      return import("../presentation/pages/page-faq/FaqPage.vue");
    },
  },
  {
    path: "/thank-you",
    name: "ThankYouPage",
    component: function () {
      return import("../presentation/pages/page-message/ThankYouPage.vue");
    },
    props: true,
  },
  {
    path: "/scan-barcode",
    name: "BarcodePage",
    component: function () {
      return import("../presentation/pages/page-barcode/BarcodePage.vue");
    },
  },
  /*
	{
		path: "/profile",
		name: "Profile",
		component: function () {
			return import(
				"../presentation/pages/page-profile/Profile.vue"
			);
		},
		meta: { requireLogin: true },
	},
	*/
  {
    path: "/settings",
    name: "Settings",
    component: function () {
      return import("../presentation/pages/page-profile/Settings.vue");
    },
    meta: { requireLogin: true },
  },
  {
    path: "/interests",
    name: "Interests",
    component: function () {
      return import("../presentation/pages/page-profile/Interests.vue");
    },
    meta: { requireLogin: true },
  },
  {
    path: "/events",
    name: "EventsPage",
    component: function () {
      return import("../presentation/pages/page-events/EventsPage.vue");
    },
    meta: { requireLogin: false },
  },
  {
    path: "/search/event/:eventName",
    name: "EventSearch",
    component: function () {
      return import("../presentation/pages/page-events/EventSearch.vue");
    },
    props: true,
    meta: { requireLogin: false },
  },
  {
    path: "/events/view",
    name: "EventsView",
    component: function () {
      return import("../presentation/pages/page-events/EventSearch.vue");
    },
    props: true,
    meta: { requireLogin: false },
  },
  {
    path: "/event/:category/:eventId",
    name: "EventDetails",
    component: function () {
      return import("../presentation/pages/page-events/EventDetails.vue");
    },
    props: true,
    meta: { requireLogin: false },
  },
  {
    path: "/booking/:eventId",
    name: "EventBooking",
    component: function () {
      return import("../presentation/pages/page-events/EventBooking.vue");
    },
    props: true,
    meta: { requireLogin: true },
  },
  /*
	{
		path: "/event/:eventId/:sessionId",
		name: "EventDetails",
		component: function () {
			return import(
				"../presentation/pages/page-events/EventDetails.vue"
			);
		},
		props: true,
		meta: { requireLogin: true },
	},
	{
		path: "/booking/:eventId/:sessionId",
		name: "EventBooking",
		component: function () {
			return import(
				"../presentation/pages/page-events/EventBooking.vue"
			);
		},
		props: true,
		meta: { requireLogin: true },
	},
	*/
  {
    path: "/shop/:pathMatch(.*)*",
    name: "ShopPage",
    component: function () {
      return import("../presentation/pages/page-store/ShopPage.vue");
    },
    props: true,
    meta: { requireLogin: false },
  },
  {
    path: "/shop/:outlet",
    name: "ShopPage",
    component: function () {
      return import("../presentation/pages/page-store/ShopPage.vue");
    },
    props: true,
    meta: { requireLogin: false },
  },
  {
    path: "/brand/:outlet/:brandCode",
    name: "BrandPage",
    component: function () {
      return import("../presentation/pages/page-brand/BrandPage.vue");
    },
    props: true,
    meta: { requireLogin: false },
  },
  {
    path: "/category/:outlet/:brandCode/:categoryId",
    name: "FilterPage",
    component: function () {
      return import("../presentation/pages/page-brand/FilterPage.vue");
    },
    props: true,
    meta: { requireLogin: false },
  },
  {
    path: "/shop/:outlet/product-details/:productId",
    name: "ProductDetails",
    component: function () {
      return import("../presentation/pages/page-product/ProductDetails.vue");
    },
    props: true,
    meta: { requireLogin: false },
  },
  {
    path: "/checkout",
    name: "CheckoutPage",
    component: function () {
      return import("../presentation/pages/page-checkout/CheckoutPage.vue");
    },
    props: true,
    meta: { requireLogin: true },
  },
  {
    path: "/receipt/:number/:pathMatch(.*)*",
    name: "ReceiptPage",
    component: function () {
      return import("../presentation/pages/page-checkout/ReceiptPage.vue");
    },
    props: true,
    meta: { requireLogin: true },
  },
  {
    path: "/ticket/:number",
    name: "TicketPage",
    component: function () {
      return import("../presentation/pages/page-checkout/TicketPage.vue");
    },
    props: true,
    meta: { requireLogin: true },
  },
  {
    path: "/order-summary/:number",
    name: "OrderSummary",
    component: function () {
      return import("../presentation/pages/page-checkout/TicketPage.vue");
    },
    props: true,
    meta: { requireLogin: true },
  },
  {
    path: "/search/:outlet/:pathMatch(.*)*",
    name: "SearchPage",
    component: function () {
      return import("../presentation/pages/page-store/SearchPage.vue");
    },
    props: true,
    meta: { requireLogin: false },
  },
  {
    path: "/cart/:outletCode/:cartId",
    name: "CartPage",
    component: function () {
      return import("../presentation/pages/page-cart/CartPage.vue");
    },
    props: true,
    meta: { requireLogin: true, reinit: true },
  },
  {
    path: "/redirect/payment/:orderType/:outletCode/:currentStoreId/:trackingId/:accountKey/:cartId/:amount",
    name: "RedirectPayment",
    component: function () {
      return import("../presentation/pages/page-redirect/RedirectPayment.vue");
    },
    props: true,
    meta: { requireLogin: true },
  },
  {
    path: "/my-order",
    name: "MyOrderPage",
    component: function () {
      return import("../presentation/pages/page-profile/MyOrderPage.vue");
    },
    props: true,
    meta: { requireLogin: true },
  },
  {
    path: "/deleted-account/:code",
    name: "DeletedAccount",
    component: function () {
      return import("../presentation/pages/page-profile/DeletedAccount.vue");
    },
    props: true,
    meta: { notAllowLoggedInUser: true },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  // eslint-disable-next-line no-unused-vars
  scrollBehavior(to, from, savedPosition) {
    // always scroll to top
    return { top: 0 };
  },
});

router.beforeEach((to, from, next) => {
  const isLoggedIn = store.getters.isLoggedIn;
  if (to.matched.some((record) => record.meta.requireLogin) && !isLoggedIn) {
    let path = { redirect: to.fullPath };
    if (to.reinit) path.reinit = true;
    return next({
      path: "/login",
      // params: { redirect: { name: to.name, params: to.params } },
      query: path,
    });
  }
  if (["LoginPage", "RegisterPage"].includes(to.name) && !isLoggedIn) {
    let path = { redirect: from.fullPath };
    if (path.redirect == "/") {
      path.redirect = to.query.redirect;
      path.reinit = true;
    }
    to.query = path;
  }
  // this is to prevent user accessing login page after logged in using navigation guard
  if (isLoggedIn) {
    /*
    	const customer = store.getters.getCustomer;
		const isUsingLogRocket = process?.env?.VUE_APP_LOG_ROCKET_ID ? true : false;

		if (isUsingLogRocket && customer?.email) LogRocket.identify(customer.email);
		*/

    const notAllowLoggedInUser = to.matched.some(
      (route) => route.meta.notAllowLoggedInUser
    );

    if (notAllowLoggedInUser) return next({ path: "/events" });
    if (to.name == "WelcomePage") return next({ path: "/home" });
    return next();
  }
  next();
});

export default router;
