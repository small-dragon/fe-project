import { mapState } from 'vuex'
export default {
    data () {
        return {
            items: {
                P: {
                    code: 'RP4L',
                    spec: '90×90cm'
                },
                C: {
                    code: 'CPL',
                    spec: '102×102cm'
                },
                R: {
                    code: '',
                    spec: '57×57cm'
                }
            },
            curKey: '',
            showTipBtn: false,
            showBtn: false,
        }
    },
    computed: {
        ...mapState({
            mainCanvas: 'mainCanvas',
            lizhu: 'lizhu',
            zhuti: 'zhuti'
        })
    },
    created () {
        this.curKey = this.lizhu.product.pattern
    },
    methods: {
        async hideTipBtn () {
            await this.$sleep(3000)
            this.showTipBtn = false
        },
        async build3d () {
            this.showTipBtn = true
            const item = this.items[this.curKey]
            const heightMap = {
                1070: 'RLP',
                914: 'RLP-36',
                800: 'RLP-32'
            }
            let code
            if (this.curKey != 'R') {
                code = item.code
            } else {
                code = heightMap[this.zhuti.height]
            }
            this.hideTipBtn()
            this.mainCanvas.updateCanvas([{
                type:'column',
                code
            }])
            this.$store.commit('getInfo')
        }
    }
}