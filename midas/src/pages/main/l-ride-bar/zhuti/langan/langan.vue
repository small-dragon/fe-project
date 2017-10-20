<template>
    <div class="v-m-l-z-langan">
        <div 
            class="item" 
            v-for="(value, key) in data"
            :class="{ on: key == curKey }"
            @click="curKey = key"
            v-if="ready"
        >
            <div class="l">
                <img :src="`/static/assets/img/${value.path}`" class="figure" :alt="key">
                <span>{{ value.description }}</span>
            </div>
            <a class="radio"></a>
        </div>
        <!-- <a class="btn-ok" @click="build3d" v-show="curKey != oldKey">确定</a>
        <transition name="pagefade">
            <a class="btn-ok btn-tip" v-show="showTipBtn">确定成功</a>
        </transition> -->
        <a class="btn-ok" @click="build3d" v-show="!showTipBtn && curKey != zhuti.style">确定</a>
        <transition name="pagefade">
            <a class="btn-ok btn-tip" v-show="showTipBtn">确定成功</a>
        </transition>
    </div>
</template>
<style src="./langan.less" lang="less"></style>
<script src="./langan.js"></script>