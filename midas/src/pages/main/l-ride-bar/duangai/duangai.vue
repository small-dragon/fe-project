<template>
    <div class="v-m-l-duangai v-m-l-z-langan">
    <div 
            class="item" 
            v-for="(item, index) in items"
            :class="{ on: curKey == item.code }"
            @click="curKey = item.code "
        >
            <div class="l">
                <img :src="`/static/assets/img/${item.iconPath}`" class="figure" style="width: 90px;">
                <span>{{ item.name }}</span>
            </div>
            <a class="radio"></a>
        </div>
        <a class="btn-ok" @click="build3d" v-show="!showTipBtn && curKey != duangai.product.code">确定</a>
        <transition name="pagefade">
            <a class="btn-ok btn-tip" v-show="showTipBtn">确定成功</a>
        </transition>
    </div>
</template>
<style src="./duangai.less" lang="less"></style>
<script src="./duangai.js"></script>