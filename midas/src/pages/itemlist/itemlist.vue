<template>
	<div class="v-pricelist">
		<div class="content">
			<h3 class="title">物品清单</h3>
			<table style="width: 486px;">
				<thead>
					<tr class="h1">
						<td>货物名称</td>
						<td>货物编号</td>
						<td>单位</td>
						<td>数量</td>
					</tr>
					<tr class="h2">
						<td>Description</td>
						<td>Part NO.</td>
						<td>Unit</td>
						<td>Qty</td>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(item, index) in list">
						<td style="text-align: left;">{{ item.name }}</td>
						<td>{{ item.code }}</td>
						<td>{{ item.unit }}</td>
						<td>{{ item.count }}</td>
					</tr>
				</tbody>
			</table>
		</div>
		<a class="btn-return" href="javascript:history.back(-1)">返回</a>
	</div>
</template>
<style lang="less" src="../pricelist/pricelist.less"></style>
<script src="./itemlist.js"></script>