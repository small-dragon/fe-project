<template>
	<div class="v-m-r">
		<div class="sec" :class="{ on: rInfo.type == 'zhuti' }" @click="changeType(0)">
			<h3 class="t"><i class="radio"></i>主&emsp;&emsp;体</h3>
			<p class="info">总长度：{{ zhuti.length }}</p>
			<p class="info">高&emsp;度：{{ zhuti.height }}</p>
			<p class="info">款&emsp;式：{{ zhuti.styleName }}</p>
			<p class="info">颜&emsp;色：{{ zhuti.color.text }}</p>
		</div>
		<div class="sec" :class="{ on: rInfo.type == 'lizhu' }" @click="changeType(1)">
			<h3 class="t"><i class="radio"></i>立&emsp;&emsp;柱</h3>
			<p class="info">类&emsp;型：{{ lizhu.product.pattern }}型</p>
			<p class="info">规&emsp;格：{{ lizhu.spec }}</p>
			<p class="info">数&emsp;量：{{ lizhu.count }}</p>
		</div>
		<div class="sec" :class="{ on: rInfo.type == 'xiguan' }" @click="changeType(2)">
			<h3 class="t"><i class="radio"></i>细&emsp;&emsp;管</h3>
			<p class="info">类&emsp;型：{{ xiguan.product.name }}</p>
			<p class="info">数&emsp;量：{{ xiguan.count }}</p>
		</div>
		<div class="sec" :class="{ on: rInfo.type == 'duangai' }" @click="changeType(3)">
			<h3 class="t"><i class="radio"></i>端&emsp;&emsp;盖</h3>
			<p class="info">类&emsp;型：{{ duangai.product.name }}</p>
		</div>
	</div>
</template>
<style src="./r-side-bar.less" lang="less"></style>
<script src="./r-side-bar.js"></script>