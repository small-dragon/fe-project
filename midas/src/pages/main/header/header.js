import { mapState } from 'vuex'
export default {
	data () {
		return {
			showMenuList: false,
		}
	},
	computed: {
        ...mapState({
            canvas: 'mainCanvas',
            isLogin: 'isLogin',
            undoCount: 'undoCount',
            redoCount: 'redoCount'
        })
    },
	async created () {
		const { data } = await this.$api.useraccount.is_login()
		this.$store.state.isLogin = data
	},
	methods: {
		save () {
			this.$store.state.workKey = Date.now()
			this.$store.state.showWork = true
		},
		undo () {
			this.canvas.undo()
			if (!this.$store.state.undoCount) return
			this.$store.state.undoCount -= 2
			this.$store.state.redoCount++
			this.$store.commit('getInfo')
		},
		redo () {
			this.canvas.redo()
			if (!this.$store.state.redoCount) return
			this.$store.state.redoCount -= 1 
			this.$store.commit('getInfo')
		},
		go2Itemslist () {
			this.$store.state.productLists = JSON.stringify(this.canvas.getProducts())
			this.$emit('showPop', {
				type: 'items'
			})
			// this.$router.push('/itemlist')
		},
		go2Pricelist () {
			this.$store.state.productLists = JSON.stringify(this.canvas.getProducts())
			this.$emit('showPop', {
				type: 'pricelist'
			})
			// this.$router.push('/pricelist')
		},
		newCanvas () {
			if (this.$store.state.isChanged) {
				this.$store.state.showNotSave = true
			} else {
				this.$router.push('/home')
			}
		},
		fullscreen () {
			this.canvas.homePosition()
		},
		enlarge () {
			this.canvas.zoomIn()
		},
		shrink () {
			this.canvas.zoomOut()
		},
		showRuler () {
			this.canvas.showRuler()
		},
		shift () {
			var status = this.canvas.manipulatorOperation()
			if (status == 'pan') {
				this.$pop.showMessage(`当前为平移操作`)
			} else {
				this.$pop.showMessage(`当前为旋转操作`)
			}
		},
		async logout () {
			await this.$api.useraccount.logout({
				toJson: true
			})
			this.$pop.showMessage(`退出成功`)
			this.$store.state.isLogin = false
		},
		login () {
			localStorage.config = JSON.stringify(this.canvas.config)
			localStorage.styleName = this.$store.state.zhuti.styleName
			const url = encodeURIComponent('#/main')
			location.href = `/login?redirect=${url}`
			// this.$pop.showMessage(`登录页面尚未开发完成`)
		},
	}
}