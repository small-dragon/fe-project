<template>
    <div class="v-m-l-z-wuliao">
        <div 
            class="sec" 
            :class="{ on: curKey == 'height' }"
            @click="curKey = 'height'"
        >
            <div class="t">高度（mm）</div>
            <div class="checks content">
                <div 
                    class="check" 
                    v-for="(value, key) in zhuti.heightData"
                    :class="{ on: height_curKey == value.code }"
                    @click="height_curKey = value.code"
                >
                    <span class="v">{{ value.height }}</span>
                    <i class="radio"></i>
                </div>
            </div>
            <div class="desc">单段长度建议2m以下，不超过3.5m</div>
        </div>
        <div 
            class="sec fill" 
            :class="{ on: curKey == index }"
            @click="selectSide(index)"
            v-for="(item, index) in widthList"
            v-if="!isLoading"
        >
            <div class="t">第{{ ['一','二','三','四','五'][index] }}边</div>
            <div class="content">
                <div class="row">
                    <span class="label">总长度</span>
                    <input type="text" v-model="item.width" @input="judgeIsChanged">
                    <span class="unit">m</span>
                </div>
                <div class="row">
                    <span class="label">分段数</span>
                    <input type="text" v-model="item.segments" @input="judgeIsChanged">
                    <span class="unit"></span>
                </div>
                <div class="row">
                    <span class="label">单段长</span>
                    <span class="word">{{ (item.width / item.segments).toFixed(2) }}m</span>
                    <!-- <span class="unit">m</span> -->
                </div>
            </div>
        </div>
        <a class="btn-ok" @click="build3d" v-show="showConfirmBth">确定</a>
        <transition name="pagefade">
            <a class="btn-ok btn-tip" v-show="showTipBtn">确定成功</a>
        </transition>
    </div>
</template>
<style src="./wuliao.less" lang="less"></style>
<script src="./wuliao.js"></script>