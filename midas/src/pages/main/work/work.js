import { mapState } from 'vuex'
export default {
	data () {
		return {
			title: '',
			showTitleCursor: true,
			description: '',
			showDescCursor: true,
			descPh: '',
			img: {
				src: '',
				style: `width: 560px; height: 374px; `
			}
		}
	},
	watch: {
		title (newVal, oldVal) {
			this.showTitleCursor = newVal ? false : true
		}
	},
	computed: {
        ...mapState(['work', 'xiguan', 'mainCanvas', 'id'])
    },
    created () {
    	console.log(document.body.clientWidth - 390, document.body.clientHeight)
    	this.img.src = this.mainCanvas.getSnapshot(document.body.clientWidth - 390, document.body.clientHeight)
    },
	mounted () {
		this.descPh = `备注：\n\t1.这部分是小花园的栏杆，老板说要铜绿色，采取罗马风格装饰` + 
			`\n\t2.财务部要求控制预算，每段细管控制在10根以内` + 
			`\n\t3.8月15日要完成组装`
		if (this.work.id) {
			this.description = this.work.description
			this.title = this.work.title
		} else {
			this.description = this.descPh
		}
		setTimeout(() => {
			this.$el.querySelector('.title').focus()
		}, 100)
	},
	methods: {
		hidePop () {
			this.$store.state.showWork = false
		},
		async save () {
			const { title, description } = this
			if (!title) {
				return this.$pop.showMessage(`标题不能为空`)
			}
			if (description == this.descPh) {
				return this.$pop.showMessage(`备注不能为空`)
			}
			const params = {
				title, description,
				config: JSON.stringify(this.mainCanvas.config),
				img: this.img.src
			}
			if (this.id) {
				params.id = this.id
			}
			const { data } = await this.$api.auth.save_solution(params)
			this.$store.state.id = data
			this.hidePop()
			this.$pop.showMessage(`保存成功`)
		},
		focusDesc (e) {
			if (e.target.value == this.descPh) {
				e.target.value = ''
				e.target.style.color = "#666"
			}
		},
		blurDesc (e) {
			if (!e.target.value) {
				e.target.value = this.descPh
				e.target.style.color = "#999"
			}
		}
	}
}