<template>
	<div class="v-main-work" @click.self="hidePop">
		<div class="content">
			<div class="title-sec">
				<input type="text" 
				placeholder="作品标题" 
				class="title" 
				v-model="title">
			</div>
			<div class="capture">
				<img class="figure" :src="img.src" :style="img.style">
				<textarea 
					v-model="description"
					@focus="focusDesc"
					@blur="blurDesc"
					rows="4">
				</textarea>
			</div>
			<a class="btn-save" @click="save">保存</a>
			<a class="btn-close" @click="hidePop"></a>
		</div>
	</div>
</template>
<style src="./work.less" lang="less"></style>
<script src="./work.js"></script>