<template>
	<div class="section">
		<div class="btn-sec" @click="addColumn">
            <img src="~images/main/tap.png" v-show="!taping">
            <img src="~images/main/tap-on.png" v-show="taping">
        </div>
		<comp-column 
			v-for="n in maxColumn" 
			:index="index"
			:smallColumnIndex="smallColumnIndex"
			:key="`column-${n}`"
			ref="column"
			v-show="smallColumnIndex == n-1"
		></comp-column>
	</div>
</template>
<script src="./section.js"></script>