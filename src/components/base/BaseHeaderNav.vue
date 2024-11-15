<template>
	<div class="header-nav">
        <div class="header-nav-item" @click="showScanner()" v-if="scannerOn">
            <span class="material-icons">qr_code_scanner</span>
        </div>
        <div class="header-nav-item" v-if="!menuOnly && !noSearch">
            <div class="search-wrapper" :class="{'show-search': showInput}">
                <span class="search-icon material-icons" @click="toggleSearch()">search</span>
            </div>
            <Transition name="modal">
                <div class="search__overlay" v-if="showInput">
                    <div class="search__overlay__content">
                        <div class="search__overlay__content__input">
                            <input class="search-input" type="text" placeholder="search" v-model="searchText" @keyup.enter="clickSearch()"/>
                            <span class="overlay-icon material-icons" @click="clickSearch()">search</span>
                        </div>
                        <div class="search__overlay__content__previous" v-if="!isEmpty(searchItems)">
                            <h1 class="search__overlay__content__previous__title">Previous searches</h1>
                            <div class="search__overlay__content__previous__items">
                                <span class="item" v-for="(sr, i) in searchItems" :key="i" @click="searchPrevious(sr)">{{ sr }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </div>
        <div class="header-nav-item" v-if="!menuOnly" @click="clickCart()">
            <span class="material-icons-outlined">shopping_cart</span>
            <span class="cart-count" v-if="countCart">{{ countCart }}</span>
        </div>
        <span v-if="!noMenu && isLoggedIn()" class="header-nav-item material-icons" @click="toggleSideBar()">menu</span>
    </div>
    <div class="side-bar" :class="{'active': showSideBar}" v-if="!noMenu">
        <base-menu v-if="openSideBar" @hide-menu="toggleSideBar()"></base-menu>
    </div>
</template>

<script>
    import BaseMenu from "./BaseMenu.vue";
    import utility from "@/presentation/mixins/utility.js";
    export default {
        props: {
            preText: {
                type: String,
                default: ""
            },
            menuOnly: {
                type: Boolean,
                default: false
            },
            noMenu: {
                type: Boolean,
                default: false
            },
            noSearch: {
                type: Boolean,
                default: false
            },
            scannerOn: {
                type: Boolean,
                default: false
            },
        },
        components: {
            BaseMenu,
        },
        data() {
            return {
                showInput: false,
                searchText: "",
                showSideBar: false,
                openSideBar: false,
                countCart: 0,
                searchItems: [],
            };
        },
        mixins: [utility],
        methods: {
            showScanner(){
                this.$emit('scanner-clicked');
            },
            toggleSideBar(){
                this.showSideBar = !this.showSideBar;
            },
            hideSearch(){
                this.showInput = false;
                this.searchText = "";
                this.$emit('open-text', true);
            },
            toggleSearch(){
                this.showInput = !this.showInput;
                if(!this.showInput){
                    return this.hideSearch();
                }
                this.$emit('open-text', false);
            },
            clickSearch(){
                if(!this.searchText) return;
                let items = this.searchItems || [];
                let found = items.filter((it) => { return it == this.searchText }).length > 0;
                if(!found){
                    let newItems = [this.searchText, ...items];
                    localStorage.setItem("search-items", JSON.stringify(newItems));
                }
                let currentOutlet = this.$store.getters.getCurrentOutlet;
                // let currentStore = this.getCurrentStore();
                this.goToWithParams('SearchPage', {
                    // storeId: currentStore.id,
                    outlet: currentOutlet ? currentOutlet.apiCode : -1,
                    key: this.searchText
                });
            },
            searchPrevious(txt) {
                let currentOutlet = this.$store.getters.getCurrentOutlet;
                // let currentStore = this.getCurrentStore();
                this.goToWithParams('SearchPage', {
                    // storeId: currentStore.id,
                    outlet: currentOutlet ? currentOutlet.apiCode : -1,
                    key: txt
                });
            },
            clickCart(){
                //this.$emit('click-cart');
                let cartId = this.$store.getters.getCartId || 0
                this.goToWithParams('CartPage', { cartId: cartId, outletCode: this.getOutletCode() })
            },
            clickMenu(){
                this.$emit('click-menu');
            }
        },
        watch: {
            showSideBar(val){
                if(val) this.openSideBar = true;
                else {
                    setTimeout(() => {
                        this.openSideBar = false;
                    }, 300);
                }
            }
        },
        async created(){
            this.countCart = this.$store.getters.getCarts.length;
            let items = localStorage.getItem("search-items");
            if(items) this.searchItems = JSON.parse(items);
        }
    };
</script>
<style scoped lang="scss">
    .side-bar {
        width: 100%;
        transform: translateX(100%);
        position: fixed;
        z-index: 100000;
        top: 0;
        left: 0;
        bottom: 0;
        background: $white;
        color: $secondary-color-90;
        -webkit-transition: all 0.2s ease-in-out 0.2s;
        -moz-transition: all 0.2s ease-in-out 0.2s;
        -o-transition: all 0.2s ease-in-out 0.2s;
        transition: all 0.2s ease-in-out 0.2s;

        &.active {
            transform: translateX(0);
        }
    }
    .header-nav-item {
        display: flex;
        align-items: center;
        position: relative;

        .cart-count {
            position: absolute;
            top: -5px;
            right: -5px;
            width: 15px;
            height: 15px;
            border-radius: 50%;
            background: $primary-color-50;
            color: $white;
            font-size: 0.6em;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
        }
    }
    .search {
        &__overlay {
            transition: opacity 0.3s ease;
            position: fixed;
            top: 64px;
            left: 0px;
            right: 0px;
            bottom: 0px;
            z-index: 100;
            cursor: auto;

            &__content {
                transition: all 0.3s ease;
                background: $secondary-color-90;
                width: 100%;
                height: 100%;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 36px;
                color: $white;
                overflow: hidden;
                overflow-y: auto;

                &__input {
                    width: 100%;
                    padding: 12px 24px;
                    border: none;
                    margin: 0 auto;
                    border-radius: 12px;
                    background: $white;
                    display: flex;
                    align-items: center;
                    gap: 16px;

                    input.search-input {
                        width: 100%;
                        border: none;
                        outline: 0;
                        background: $white;
                    }
                    .overlay-icon {
                        color: $secondary-color-80;
                        cursor: pointer;
                    }
                }
                &__previous {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;

                    &__title {
                        font-size: 1.5em;
                    }
                    &__items {
                        width: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 12px;
                        flex-wrap: wrap;

                        .item {
                            padding: 6px 20px;
                            background: $white;
                            color: $secondary-color-90;
                            cursor: pointer;
                            border-radius: 18px;
                        }
                    }
                }
            }
        }

    }
    @media (min-width: 672px) {
        .side-bar {
            &.active{
                background: linear-gradient(45deg, #00000085, transparent);
            }
        }
        .search {
            &__overlay {
                top: 105px !important;

                &__content {
                    padding: 16px 7% !important;

                    &__input {
                        width: 80%;
                    }
                }
            }

        }
    }
</style>