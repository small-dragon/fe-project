import Vuex from 'vuex';
import Vue from 'vue';
Vue.use(Vuex);

export default new Vuex.Store({
	state: {
        isSaved: true,
		rInfo: { // 右边导航栏当前激活类型
			type: 'zhuti',
			name: '主体'
		},
        id: '', // 当前方案的id
        workKey: '',
        work: {}, // 如果有id，则为此id的作品
        zhuti: {
            length: 0, // 总长度
            height: 0,
            type: '', // 当前的类型，一字型、U型等
            color: '',
            wallStyle: '',
            styleName: '', // 常规、中空等
            heightData: {}
        },
        lizhu: {
            spec: '',  // 规格
            count: 0 // 数量
        },
        xiguan: {
            items: [],
            name: '',
            count: 0
        },
        duangai: {
            items: []
        },
        renderData: {   // 用来渲染3d模型的数据 
            cavity: {},
            regular: {},
            flower: {},
        },
        renderDataReady: false,
        isInit3d: false,
        mainCanvas: {}, 
        wuliaoConfig: {},
        displayObj: {}, // 存储了3d模型信息
        productLists: '',
        xiguanIndex: 0, // 细管第几边
        xiguanAllSelect: true, // 选中细管的一边的整段
        isChanged: false, // 用户是否操作过
        showNotSave: false, // 用户是否保存
        showWork: false,
        isLogin: false,
        undoCount: -1,
        redoCount: 0
	},
	mutations: {
		getInfo (state) {
            state.isSaved = false
            const canvas = state.mainCanvas
            const mainObj = canvas.getInfo({ type: 'main' })
            const xiguanObj = canvas.getInfo({ type: 'smallColumn', index: 0, smallColumnIndex: 1 })
            const lizhuObj = canvas.getInfo({ type: 'column' })
            const duangaiObj = canvas.getInfo({ type: 'endCover' })
            const wallStyle = canvas.getInfo({ type: 'wall' })
            state.zhuti.wallStyle = wallStyle
            Object.assign(state.zhuti, mainObj)
            console.log(mainObj)
            const specArr = {
                C: '102×102',
                P: '90×90',
                R: '57×57'
            }
            Object.assign(state.lizhu, lizhuObj)
            state.lizhu.spec = specArr[state.lizhu.product.pattern]
            Object.assign(state.xiguan, xiguanObj)
            Object.assign(state.duangai, duangaiObj)

            const heightData = {
                P: {
                    'RP4L': {
                        code: 'RP4L',
                        height: 1070
                    }
                },
                C: {
                    'CPL': {
                        code: 'CPL',
                        height: 1070
                    }
                },
                R: {
                    'RLP': {
                        code: 'RLP',
                        height: 1070
                    },
                    'RLP-36': {
                        code: 'RLP-36',
                        height: 914
                    },
                    'RLP-32': {
                        code: 'RLP-32',
                        height: 800
                    }
                }
            }
            state.zhuti.heightData = heightData[state.lizhu.product.pattern]
            state.xiguan.items = canvas.getRelSmallColumns()
            state.duangai.items = canvas.getRelEndCovers()
            state.undoCount++
        }
	}
});