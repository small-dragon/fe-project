<template>
	<div class="v-m-l">
        <div class="title">{{ rInfo.name }}</div>
        <div class="content">
        	<transition name="pagefade" mode="out-in">
        		<keep-alive>
            		<component :is="rInfo.type"></component>
            	</keep-alive>
            </transition>
        </div>
	</div>
</template>
<style src="./l-side-bar.less" lang="less"></style>
<script src="./l-side-bar.js"></script>