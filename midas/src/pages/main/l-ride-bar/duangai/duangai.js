import { mapState } from 'vuex'
export default {
    data () {
        return {
            curKey: '',
            showTipBtn: false,
            showBtn: false
        }
    },
    computed: {
        ...mapState({
            duangai: state => state.duangai,
            items: state => state.duangai.items,
            canvas: 'mainCanvas'
        })
    },
    created () {
        this.curKey = this.duangai.product.code
    },
    methods: {
        async hideTipBtn () {
            await this.$sleep(3000)
            this.showTipBtn = false
        },
        async build3d () {
            this.showTipBtn = true
            let data = {}
            for(let i in this.items) {
                if (this.items[i].code == this.curKey)
                    data = this.items[i]
            }
            this.hideTipBtn()
            this.canvas.updateCanvas([{
                type: 'endCover',
                code: data.code
            }])
            this.$store.commit('getInfo')
        }
    }
}