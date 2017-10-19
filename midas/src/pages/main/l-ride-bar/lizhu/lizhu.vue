<template>
    <div class="v-m-l-lizhu">
        <div 
            class="item" 
            v-for="(value, key) in items"
            :class="{ on: curKey == key }"
            @click="curKey = key"
        >
            <div class="l">
                <!-- <img :src="`/static/assets/img/${key}.png`" class="figure"> -->
                <img :src="`/static/main/images/main/${key}.png`" class="figure">
                <span>{{ key }}&ensp;型</span>
                <span>(mm)</span>
                <!-- <span>（{{ value.spec }}）</span> -->
            </div>
            <a class="radio"></a>
        </div>
        <a 
            class="btn-ok" 
            @click="build3d" 
            v-show="!showTipBtn && curKey != lizhu.product.pattern"
        >确定</a>
        <transition name="pagefade">
            <a class="btn-ok btn-tip" v-show="showTipBtn">确定成功</a>
        </transition>
    </div>
</template>
<style src="./lizhu.less" lang="less"></style>
<script src="./lizhu.js"></script>