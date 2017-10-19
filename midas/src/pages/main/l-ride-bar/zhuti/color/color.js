import { mapState } from 'vuex'
export default {
    data () {
        return {
            items: {},
            curKey: '',
            showTipBtn: false,
            showBtn: false
        }
    },
    computed: {
        ...mapState({
            mainCanvas: 'mainCanvas',
            color: state => state.zhuti.color
        })
    },
    created () {
        this.items = this.mainCanvas.getRgbColor() 
        this.curKey = this.color.name
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
                if (this.items[i].name == this.curKey)
                    data = this.items[i]
            }
            console.log(data) 
            this.hideTipBtn()
            this.mainCanvas.updateCanvas([{
                type: 'color',
                color: data
            }])
            this.$store.commit('getInfo')
        }
    }
}