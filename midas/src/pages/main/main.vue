<template>
	<div class="v-main">
		<comp-header @showPop="showPop"></comp-header>
		<comp-l-sidebar v-if="!loading"></comp-l-sidebar>
        <div class="main">
            <canvas id="main-canvas" style="width: 100%; height: 100%;"></canvas>
        </div>
        <comp-r-sidebar v-if="!loading"></comp-r-sidebar>
        <transition name="zoom">
        	<pop-work v-if="showWork" :key="workKey"></pop-work>
        </transition>
        <transition name="zoom">
            <pop-items @hide="pop.items=false" v-if="pop.items"></pop-items>
        </transition>
        <transition name="zoom">
            <pop-pricelist @hide="pop.pricelist=false" v-if="pop.pricelist"></pop-pricelist>
        </transition>
        <transition name="pagefade">
            <pop-not-save v-if="showNotSave"></pop-not-save>
        </transition>
        <p class="bottom">
            <span>技术支持：</span>
            <a href="http://ismartcube.cn/">智方科技</a>
        </p>
	</div>
</template>
<style src="./main.less" lang="less"></style>
<script src="./main.js"></script>