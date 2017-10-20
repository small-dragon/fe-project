<template>
	<div class="comp-smallColumn">
		<div class="items">
	        <div 
	            class="item" 
	            v-for="(item, index) in items"
	            :class="{ on: curKey == item.code }"
	            @click="curKey = item.code "
	        >
	            <img :src="`/static/assets/img/${item.iconPath}`" class="figure">
	            <span class="name">{{ item.name.split(/\s/)[0] }}</span>
	            <a class="radio"></a>
	        </div>
	    </div>
	    <a 
	    	class="btn-ok" 
	    	@click="build3d" 
	    	v-show="!showTipBtn && curKey != xiguanCode"
	    >确定</a>
	    <transition name="pagefade">
	    	<a class="btn-ok btn-tip" v-show="showTipBtn">确定成功</a>
	    </transition>
	</div>
</template>
<script src="./smallColumn.js"></script>