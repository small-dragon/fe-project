import { mapState } from 'vuex'
export default {
	data () {
		return {
			view: 'zhuti',
			type: '',
			defaultConfig: {},
			loading: true,
			pop: {
				items: false,
				pricelist: false,
			}
		}
	},
	components: {
		'comp-header': require('./header/header.vue'),
		'comp-r-sidebar': require('./r-side-bar/r-side-bar.vue'),
		'comp-l-sidebar': require('./l-ride-bar/l-side-bar.vue'),
		'pop-work': require('./work/work.vue'),
		'pop-items': require('./itemlist/itemlist.vue'),
		'pop-pricelist': require('./pricelist/pricelist.vue'),
		'pop-not-save': require('./not-save/not-save.vue')
	},
	computed: {
		...mapState(['isInit3d', 'renderData', 'mainCanvas', 'showNotSave', 'showWork', 'id', 'workKey']),
	},
	created () {
		if (this.$store.state.isInit3d) {
			location.reload()
		}
		this.$store.state.id = this.$route.query.id
	},
	async mounted () {
		await this.getProductInfo()
		await this.getDefaultInfo()
	},
	methods: {
		async getProductInfo () {
			if (this.isInit3d) return
			const { data } = await this.$api.index.relationships({})
			Display.init(data)
			this.$store.state.isInit3d = true
		},
		async getRailingData () {
            const { data } = await this.$api.index.default_solution()
            const map = {
            	1: '一字型',
            	2: 'L型',
            	3: 'U型'
            }
            const type = this.$store.state.zhuti.type
            let renderData = {}
            data.forEach(f => {
                if (map[type] == f.name) {
                    renderData[f.code] = f
                }
            })
            this.$store.state.renderData = renderData
            this.$store.state.renderDataReady = true
        },
		async getDefaultInfo () {
			const state = this.$store.state
	        let resultObj = {}, data = {}, defaultConfig = {}
        	if (this.id) {
	        	resultObj = await this.$api.auth.query_solution({ id: this.id})
	        	data = resultObj.data
	        	state.work = data
				defaultConfig = JSON.parse(data.config)
				state.zhuti.styleName = data.description
	        } else if (this.$route.query.regularId) {
				resultObj = await this.$api.index.query_default_solution({ id: this.$route.query.regularId})
				data = resultObj.data
				defaultConfig = JSON.parse(data.config)
				state.zhuti.styleName = data.description
	        } else if (localStorage.config) {
	        	defaultConfig = JSON.parse(localStorage.config)
	        	state.zhuti.styleName = localStorage.styleName
	        } else {
	        	this.$pop.showMessage(`该作品不存在，请重新创建一个~`)
	        	await this.$sleep(2000)
	        	this.$router.push('/home')
	        	return
	        }
			this.loading = false
			state.wuliaoConfig = defaultConfig
			const canvas = new Display(defaultConfig, 'main-canvas')
			canvas.get3DAreaRect && canvas.get3DAreaRect(
				{ x: 0, y: 51},
				{ x: window.innerWidth, y: window.innerHeight }	
			)
			canvas.updateCanvas = (args) => {
				const result = canvas.update(args)
				this.$store.state.isChanged = true
				if (result.warning) {
					this.$pop.showMessage(result.warnings[0] && result.warnings[0].msg)
				}
			}
			// 右键选中事件
			canvas.registerSelectedEvent((data, type) => {
				this.handleSelect(data, type)
			})
			state.mainCanvas = window.display = canvas
			this.$store.commit('getInfo')
			this.getRailingData()
		},
		showPop (payload) {
			const { type } = payload
			this.pop[type] = true
		},
		async  handleSelect (data, type){
			const state = this.$store.state
			if (type == 'column') {
				state.rInfo = { type: 'lizhu', name: '立柱' }
			}
			if (type == 'endCover') {
				state.rInfo = { type: 'duangai', name: '端盖' }
			}
			if (type == 'smallColumn') {
				this.$store.state.xiguanAllSelect = false
				state.rInfo = { type: 'xiguan', name: '细管' }
				state.xiguanIndex = data.index
				await this.$sleep(1000)
				const ref = state[`xiguan${data.index}`]
				ref.smallColumnIndex = data.seq
			}
		}
	}
}