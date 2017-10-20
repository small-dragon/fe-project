<template>
	<div class="v-home">
		<!-- <div class="display-sec">
			<canvas id="home-canvas" style="width: 100%; height: 100%;"></canvas>
		</div> -->
		<div class="select-sec">
			<div class="t">
				<img src="~images/home/logo.png">
			</div>
			<div class="strus">
				<div class="stru" 
					@click="go2Main(key)"
					:class="{on: key == curType }"
					v-for="(value, key) in railings"
				>
					<img :src="`/static/assets/img/${value.path}`" :alt="value.path" class="figure">
					<!-- <i></i> -->
					<span class="name">{{ value.name }}</span>
					<!-- <transition name="pagefade">
						<div class="hover-sec" v-show="value.hovering">
							<div class="item">
								<img :src="`/static/main/images/home/${key}/both.png`">
							</div>
							<div class="item">
								<img :src="`/static/main/images/home/${key}/left.png`">
							</div>
							<div class="item">
								<img :src="`/static/main/images/home/${key}/right.png`">
							</div>
							<div class="item">
								<img :src="`/static/main/images/home/${key}/none.png`">
							</div>
						</div>
					</transition> -->
				</div>
			</div>
			<!-- <a @click="go2Main" class="btn-ok">确定</a> -->
		</div>
	</div>
</template>
<style src="./home.less" lang="less"></style>
<script src="./home.js"></script>