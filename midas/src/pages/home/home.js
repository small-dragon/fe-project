export default {
	data () {
		return {
			railings: {
				"straight": {
					hovering: false,
					name: '一字型',
					regularId: 1,
					path: "一.png"
				},
				"L": {
					hovering: false,
					name: 'L型',
					regularId: 2,
					path :"l.png"
				},
				"U": {
					hovering: false,
					name: 'U型',
					regularId: 3,
					path: "u.png"
				}
			},
			curType: '',
		}
	},
	created () {
	},
	async mounted () {
		this.curType = 'straight'
	},
	methods: {
        go2Main (key) {
        	const item = this.railings[key]
			this.$router.push(`/main?regularId=${item.regularId}`)
		},
		showImgs (key) {
			this.railings[key].hovering = true
		},
		hideImgs (key) {
			this.railings[key].hovering = false
		},
	}
}