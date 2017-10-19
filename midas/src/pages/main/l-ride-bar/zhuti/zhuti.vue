<template>
    <div class="v-m-l-zhuti">
        <div class="tabs">
            <div 
                class="tab" 
                v-for="(item, index) in items" 
                :class="{ on: curIdx == index }" 
                :show="curIdx == index"
                @click="curIdx = index"
            >
                <i :class="item.key"></i>
                <span>{{ item.name }}</span>
            </div>
        </div>
        <transition name="pagefade" mode="out-in">
            <keep-alive>
                <component :is="tabs[curIdx]"></component>
            </keep-alive>
        </transition>
    </div>
</template>
<style src="./zhuti.less" lang="less"></style>
<script src="./zhuti.js"></script>