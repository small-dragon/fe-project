import { mapState } from 'vuex'
export default {
    data () {
        return {
            curKey: '',
            showTipBtn: false,
            showBtn: false,
        }
    },
    computed: {
        ...mapState({
            canvas: 'mainCanvas',
            data: 'renderData',
            ready: 'renderDataReady',
            zhuti: 'zhuti'
        })
    },
    watch: {
        curKey (newVal, oldVal) {
            if (!oldVal) return
            this.showBtn = true 
        }
    },
    created () {
        this.curKey = this.zhuti.style
    },
    methods: {
        async hideTipBtn () {
            await this.$sleep(3000)
            this.showTipBtn = false
        },
        async build3d () {
            this.showTipBtn = true
            const item = this.data[this.curKey]
            const config = item.config && JSON.parse(item.config)
            const state = this.$store.state
            this.hideTipBtn()
            this.canvas.update([{
                type: 'style',
                style: this.curKey
            }])
            // this.canvas.build(config)
            this.$store.commit('getInfo')
            state.zhuti.styleName = item.description
            state.wuliaoConfig = config
            state.isChanged = true
        }
    }
}