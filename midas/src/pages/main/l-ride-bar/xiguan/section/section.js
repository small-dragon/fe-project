import { mapState } from 'vuex'
export default {
    data () {
        return {
            smallColumnIndex: 0,
            xiguanInfo: {},
            taping: false, // 是否被按中
            maxColumn: 0 // 每段细管数，细管序号不能大于细管数
        }
    },
    props: ['index'],
    computed: {
        ...mapState({
            canvas: 'mainCanvas'
        })
    },
    components: {
        'comp-column': require('../smallColumn/smallColumn.vue')
    },
    created () {
        const state = this.$store.state
        this.updateInfo(true)
        state[`xiguan${this.index}`] = this
    },
    methods: {
        addColumn () {
            if (this.taping) return
            this.tap()
            if (this.smallColumnIndex == this.maxColumn-1) {
                // this.$pop.showMessage(`细管序号不能超过每一段细管的数量`)
                this.$store.state.xiguanAllSelect = true
                this.canvas.select({
                    action: 'all',
                    type:'smallColumn',
                    index: this.index
                })
                this.smallColumnIndex = 0
                return
            } 
            if (this.$store.state.xiguanAllSelect) {
                this.$store.state.xiguanAllSelect = false
                this.smallColumnIndex = 0
            } else {
                this.smallColumnIndex++
            }
            this.$pop.showMessage(`细管序号当前为${this.smallColumnIndex+1}`)
            this.canvas.select({
                action: 'smallColumn',
                index: this.index,
                smallColumnIndex: this.smallColumnIndex 
            })
        },
        async tap () {
            this.taping = true
            await this.$sleep(1000)
            this.taping = false
        },
        updateInfo (isInitial) {
            const xiguanInfo = this.xiguanInfo = this.canvas.getInfo({ 
                type: 'smallColumn', 
                index: this.index, 
                smallColumnIndex: this.smallColumnIndex 
            })
            this.maxColumn = xiguanInfo.smallColumnCount
        }
    }
}