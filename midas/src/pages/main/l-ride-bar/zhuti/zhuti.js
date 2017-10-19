export default {
    data () {
        return {
            items: [
                { key: 'type', name: '款式' },
                { key: 'brick', name: '靠墙' },
                { key: 'ruler', name: '尺寸' },
                { key: 'color', name: '颜色' }
            ],
            curIdx: 0,
            tabs: ['langan', 'kaoqiang', 'wuliao', 'color']
        }
    },
    components: {
        'langan': require('./langan/langan.vue'),
        'color': require('./color/color.vue'),
        'kaoqiang': require('./kaoqiang/kaoqiang.vue'),
        'wuliao': require('./wuliao/wuliao.vue')
    },
    methods: {
    }
}