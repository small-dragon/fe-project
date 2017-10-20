<template>
    <div class="v-m-l-xiguan">
        <div class="sec-tabs">
            <div 
                class="sec-tab" 
                :class="{ on: xiguanIndex == n-1 }"
                @click="selectSection(n-1)"
                v-for="n in sectionNum" 
                v-if="sectionNum > 1"
            >
                <span>第{{['一','二','三'][n-1]}}边</span>
            </div>
        </div>
        <transition-group name="list" tag="div" class="s-wrap">
            <comp-section 
                v-for="n in sectionNum" 
                :key="n"
                :index="n-1"
                v-show="xiguanIndex == n-1"
            >
            </comp-section>
        </transition-group>
    </div>
</template>
<style src="./xiguan.less" lang="less"></style>
<script src="./xiguan.js"></script>