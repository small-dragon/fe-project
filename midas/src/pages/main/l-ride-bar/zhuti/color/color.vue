<template>
    <div class="v-m-l-z-color">
        <div 
            class="item" 
            v-for="(value, key) in items"
            :class="{ on: curKey == value.name }"
            @click="curKey = value.name"
        >
            <span class="name">{{ value.text }}</span>
            <div class="color" :style="`background-color: ${value.displayColor}`"></div>
            <a class="check"></a>
        </div>
        <a class="btn-ok" @click="build3d" v-show="!showTipBtn && curKey != color.name">确定</a>
        <transition name="pagefade">
            <a class="btn-ok btn-tip" v-show="showTipBtn">确定成功</a>
        </transition>
    </div>
</template>
<style src="./color.less" lang="less"></style>
<script src="./color.js"></script>