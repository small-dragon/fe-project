<template>
	<div class="v-m-header clearfix">
		<a class="btn new-icon add fl" @click="newCanvas" title="新建"></a>
		<a class="btn new-icon save fl" @click="save" title="保存"></a>
		<a class="btn undo fl" @click="undo" title="撤销" :class="{ on: undoCount >= 1 }"></a>
		<a class="btn redo fl" @click="redo" title="重做" :class="{ on: redoCount >= 1 }"></a>
		<a class="btn enlarge fl" @click="enlarge" title="快速放大"></a>
		<a class="btn fullscreen fl" @click="fullscreen" title="全屏显示"></a>
		<a class="btn shrink fl" @click="shrink" title="快速放小"></a>
		<a class="btn shift fl" @click="shift" title="切换操作器"></a>
		<a class="btn ruler fl" @click="showRuler" title=" 用于显示模型尺寸，状态由后台3D引擎维护"></a>
		<div 
			class="btn user fr" 
			@mouseenter="showMenuList=true" 
			@mouseleave="showMenuList=false"
		>
			<transition name="pagefade">
				<div class="menulist" v-show="showMenuList">
					<div class="lwrap">
						<a class="menu" href="/auth/user_info">
							<i class="i-user i"></i>
							<span>个人信息</span>
						</a>
						<a class="menu" href="/auth/works_manage">
							<i class="i-works i"></i>
							<span>作品管理</span>
						</a>
						<a class="menu" @click="logout" v-if="isLogin">
							<i class="i-logout i"></i>
							<span>退出</span>
						</a>
						<a class="menu" @click="login" v-else>
							<i class="i-logout i"></i>
							<span>登录</span>
						</a>
					</div>
				</div> 
			</transition>
		</div>
		<a class="btn items fr new-icon" @click="go2Itemslist" title="物料清单"></a>
		<a class="btn price fr new-icon" @click="go2Pricelist" title="价格清单"></a>
	</div>
</template>
<style src="./header.less" lang="less"></style>
<script src="./header.js"></script>