import { mapState } from 'vuex'
export default {
	data () {
		return {
			curKey: '',
            xiguanCode: '',
            showTipBtn: false,
            showBtn: false,
            xiguanInfo: {},
            maxColumn: 0 // 每段细管数，细管序号不能大于细管数
		}
	},
	props: ['index', 'smallColumnIndex'],
    computed: {
        ...mapState({
            canvas: 'mainCanvas',
            items: state => state.xiguan.items,
        })
    },
	created () {
        this.updateInfo(true)
        this.xiguanCode = this.curKey = this.xiguanInfo.product.code
	},
	methods: {
		async hideTipBtn () {
            await this.$sleep(3000)
            this.showTipBtn = false
        },
        async build3d () {
            const xiguanAllSelect = this.$store.state.xiguanAllSelect
            this.showTipBtn = true
            let data = {}
            for(let i in this.items) {
                if (this.items[i].code == this.curKey)
                    data = this.items[i]
            }
            const params = [{
                type: 'smallColumn',
                index: this.index,
                pattern: data.pattern,
                code: data.code,
                smallColumnIndex: xiguanAllSelect ? undefined : this.smallColumnIndex
            }]
            this.hideTipBtn()
            this.canvas.updateCanvas(params)
            this.$store.commit('getInfo')
            this.updateInfo()
        },
        updateInfo (isInitial) {
            const xiguanAllSelect = this.$store.state.xiguanAllSelect
            const xiguanInfo = this.xiguanInfo = this.canvas.getInfo({ 
                type: 'smallColumn', 
                index: this.index, 
                smallColumnIndex: this.smallColumnIndex 
            })
            this.maxColumn = xiguanInfo.smallColumnCount
            
            if (isInitial) return
            const params = xiguanAllSelect ?  {
                    action: 'all',
                    type:'smallColumn',
                    index: this.index
                } : {
                    action: 'smallColumn',
                    index: this.index,
                    smallColumnIndex: this.smallColumnIndex 
                }
            this.canvas.select(params)
            if (xiguanAllSelect) {
                console.log(this.$parent.$refs.column.length)
                this.$parent.$refs.column.forEach(f => {
                    f.xiguanCode = xiguanInfo.product.code
                })
            } else {
                this.xiguanCode = xiguanInfo.product.code
            }
        }
	}
}