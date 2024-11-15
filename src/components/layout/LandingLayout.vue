<template>
	<div class="layout-flex">
        <div class="flex-item-image">
            <img v-lazyload :data-url="require('@/assets/images/login-bg.jpg')" alt="Landing">
        </div>
        <div class="flex-item-content">
            <img v-lazyload class="logo"
                width="80"
                height="80"
                alt="rxc logo"
                :data-url="require('@/assets/images/rox-logo-new.png')"
            />
            <slot name="content"></slot>
        </div>
    </div>
</template>

<script>
export default {
	name: "LayoutLanding",
	data() {
		return {};
	},
	methods: {},
};
</script>

<style scoped lang="scss">
    .layout-flex {
        width: 100%;
        height: 100%;
        display: flex;
        position: relative;

        .flex-item-image {
            flex: 2;
            width: 100%;
            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }
        .flex-item-content {
            width: 100%;
            height: 100%;
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            max-width: 400px;
        }
    }
    @media (max-width: 800px) {
        .layout-flex {
            flex-direction: column;
            .flex-item-image {
                max-height: 50%;
                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            }
            .flex-item-content {
                width: 100%;
                position: relative;
                max-width: 100% !important;

                .logo {
                    z-index: 2;
                    position: absolute;
                    top: -40px;
                }

                &::before {
                    content: "";
                    position: absolute;
                    top: -24px;
                    left: 0;
                    right: 0;
                    height: 25px;
                    z-index: 1;
                    background: linear-gradient(180deg, transparent, $white);
                }
            }
        }
    }
</style>
