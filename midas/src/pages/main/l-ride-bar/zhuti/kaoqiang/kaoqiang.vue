<template>
    <div class="v-m-l-z-langan v-m-l-z-kaoqiang">
        <div 
            class="item" 
            v-for="(value, key) in items"
            :class="{ on: curKey == key }"
            @click="curKey = key"
        >
            <div class="l">
                <img :src="`/static/main/images/home/${type}/${key}.png`" class="figure">
                <span>{{ value }}</span>
            </div>
            <a class="radio"></a>
        </div>
        <a class="btn-ok" @click="build3d" v-show="!showTipBtn && curKey != zhuti.wallStyle">确定</a>
        <transition name="pagefade">
            <a class="btn-ok btn-tip" v-show="showTipBtn">确定成功</a>
        </transition>
    </div>
</template>
<style src="../langan/langan.less" lang="less"></style>
<style src="./kaoqiang.less" lang="less"></style>
<script src="./kaoqiang.js"></script>