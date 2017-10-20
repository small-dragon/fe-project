<template>
	<div class="comp-not-save">
		<p>你的作品尚未保存</p>
		<p>直接退出将会导致现有作品丢失</p>
		<div class="btns">
			<a class="btn" @click="hide">退出</a>
			<a class="btn" @click="save">保存</a>
		</div>
	</div>
</template>
<style src="./not-save.less" lang="less"></style>
<script src="./not-save.js"></script>