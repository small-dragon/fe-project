import upperCaseSum from 'upperCaseMoney'
export default {
	data () {
		return {
			list: []
		}
	},
	async created () {
		const productLists = this.$store.state.productLists
		if (!productLists) {
			this.$pop.showMessage(`您还没设计你的3d作品噢~`)
			await this.$sleep(2000)
			this.$router.push('/home')
		} else {
			let data = JSON.parse(productLists)
			for(let i in data) {
				if (typeof data[i] == 'object') {
					this.list.push(data[i])
				}
			}
		}
	},
	methods: {
	}
}