<template>
	<div class="v-pricelist">
		<div class="content">
			<h3 class="title">价格清单</h3>
			<table>
				<thead>
					<tr class="h1">
						<td>货物名称</td>
						<td>货物编号</td>
						<td>单位</td>
						<td>单价</td>
						<td>数量</td>
						<td>金额(人民币)</td>
					</tr>
					<tr class="h2">
						<td>Name</td>
						<td>Part No</td>
						<td>Unit</td>
						<td>Price</td>
						<td>Qty</td>
						<td>Amount(RMB)</td>					
					</tr>
				</thead>
				<tbody>
					<tr v-for="(item, index) in list">
						<td style="text-align: left;">{{ item.name }}</td>
						<td>{{ item.code }}</td>
						<td>{{ item.unit }}</td>
						<td>{{ item.price }}</td>
						<td>{{ item.count }}</td>
						<td>{{ item.sum.toFixed(2) }}</td>
					</tr>
					<tr class="h3">
						<td>总金额</td>
						<td colspan="4">{{ upperCaseTotal }}</td>
						<td>{{ total }}</td>					
					</tr>
				</tbody>
			</table>
		</div>
		<div class="top">
			<a class="btn-return" @click="$emit('hide')">返回云设计</a>
			<i class="icon pricelist"></i>
		</div>
		
	</div>
</template>
<style lang="less" src="./pricelist.less"></style>
<script src="./pricelist.js"></script>